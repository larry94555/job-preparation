# Interview-Prep Quiz System — Design & Roadmap

A config-driven quiz platform for interview preparation. Once the engine exists, a new
programming topic is added by dropping in configuration files and evaluation skills — no
engine code changes. Grading of open-ended answers is done by a **small local LLM** driven
by carefully engineered, individually-tested evaluation skills.

Status: **design agreed, not yet built.** This document is the spec to build against.

---

## 1. Vision & guiding principles

1. **The engine never changes; only content does.** Content (questions + eval skills) is
   declarative config. Deep-diving a new topic = adding a `topics/<topic>/` folder.
2. **Grading must be trustworthy, and provably so.** A small model grades open answers, but
   every evaluation skill is a *tested artifact* with its own calibration set and a CI gate.
   If a skill can't reproduce its own labels, it isn't allowed to grade real users.
3. **Cheap-model discipline as a forcing function.** If the eval skills are decomposed well
   enough that a 3B model grades reliably, hosting is cheap and everything runs offline in dev.
4. **Hosted-ready architecture, local-first deployment.** Multi-tenancy is baked into the
   schema from commit #1; the expensive cloud/GPU/sandbox infra is deferred until justified.
5. **Layered evaluation — cheapest first.** Deterministic checks before LLM judgment; LLM
   judgment before human review.
6. **Fail loud.** Malformed config never silently mis-grades — it fails validation at load/CI.

---

## 2. Decisions log (agreed)

These were resolved during design review and are the load-bearing assumptions.

| # | Decision | Consequence |
|---|---|---|
| 1 | Multi-user **hosted** is the destination | Postgres, auth, per-user scoping, hostile sandbox |
| 2 | "Low-end local LLM" = **cost/portability constraint**, not literal locality | Inference behind a swappable `Evaluator` interface; small model is a hard design target |
| 3 | Eval-skills are **tested artifacts** | Decomposed rubrics + calibration set + meta-eval gate + escalation |
| 4 | Requirement #4 = **A + B + C** | Adaptive/spaced-rep, mock-interview mode, analytics — all planned |
| 5 | Untrusted code = **isolated service, managed sandbox first**, delivered last | Code exercises are Phase 3, not a launch blocker |
| 6 | **Config files = source of truth**, DB = projection, curated authoring | Add/edit topic → PR → eval-gate → deploy → re-import |
| 7 | **TypeScript everywhere** (Next.js + Zod + Postgres) | One language, shared types, Zod config validation |
| 8 | **Async grading** (model is single-slot) | Grading job queue + worker pool; honest "grading in progress" UX |
| 9 | **Hosted-ready arch, local-first deploy**, defer expensive infra | Develop on laptop w/ local `llama-server`; scale later |
| 10 | **Two roles** (`user` / `admin`), Auth.js + local dev stub | Minimal RBAC; ownership = own attempts/progress only |

**The local model (pinned reference):** Qwen2.5-3B-Instruct, q4_k_m GGUF, served by
`llama-server` (llama.cpp) via its OpenAI-compatible endpoint, `n_ctx = 8192`, **single slot**.
This is the grading target the eval-skill format must survive.

---

## 3. Technology stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** end-to-end | One language front-to-back; strong types for a config-driven engine |
| Web framework | **Next.js (App Router)** | UI + API routes in one deployable; server components keep answer keys off the client |
| Config validation | **Zod** | The whole app is "load config → trust it"; Zod parses YAML/JSON into typed, validated objects + a validate CLI for free |
| Persistence | **Postgres** (Drizzle ORM) | Multi-tenant from day 1; joins mastery state with content |
| Auth | **Auth.js (NextAuth)** | Google/GitHub OAuth + email magic-link; local dev stub; HTTP-only cookie sessions |
| LLM eval | **`llama-server`** OpenAI-compatible API, behind an **`Evaluator` interface** | Local Qwen2.5-3B in dev; swap to hosted small model or bigger model for escalation |
| Job queue | **DB-backed queue** (in-process) initially → managed broker later | Async grading without premature infra |
| Code sandbox | **Managed sandbox service** first (e.g. Judge0-style / E2B) → self-hosted gVisor/Firecracker later | Offload the hardest security surface until justified |
| Content format | **YAML** (questions/topics) + **Markdown+frontmatter** (eval skills) | Human-authorable, git-diffable, reviewable |

> The **host** language (TS) is independent of the languages *exercises* are written in — a Rust
> exercise and a Python exercise each run in their own sandbox image; the TS host only orchestrates.

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│ CONTENT  (git-tracked, per-topic, no code)                        │
│   topics/<topic>/  ──  questions (yaml) + eval skills (md)         │
│                        + calibration sets (yaml)                   │
└───────────────────────────────┬──────────────────────────────────┘
                                │  import + Zod-validate + eval-gate (CI)
┌───────────────────────────────▼──────────────────────────────────┐
│ POSTGRES  (projection of content) + per-user state                │
│   questions · topics    |    users · attempts · mastery ·          │
│   (derived, read-only)  |    grading_jobs · review_schedule        │
└───────────┬───────────────────────────────┬──────────────────────┘
           │                               │
┌───────────▼─────────────┐   ┌─────────────▼─────────────────────┐
│ ENGINE (pure TS)        │   │ EVALUATORS                        │
│  loader · randomizer ·  │   │  deterministic (MCQ/text)         │
│  quiz assembler ·       │   │  llm (Evaluator iface → llama)    │
│  scorer · session ·     │   │  code (→ isolated sandbox svc)    │
│  adaptive scheduler     │   │  meta-eval (calibration gate)     │
└───────────┬─────────────┘   └─────────────┬─────────────────────┘
           │                               │  (async jobs)
┌───────────▼───────────────────────────────▼──────────────────────┐
│ NEXT.JS  UI + API                                                 │
│   take quiz · async grading status · review · mock-exam ·          │
│   adaptive practice · analytics · admin (import/meta-eval/flags)   │
└───────────────────────────────────────────────────────────────────┘

           ┌──────────────────────────────────────────┐
           │ ISOLATED CODE-EXECUTION SERVICE           │
           │  no DB/secrets access · kernel isolation  │
           │  ephemeral · bounded concurrency & cost   │
           └──────────────────────────────────────────┘
```

**Tiers:** (1) Next.js app/API, (2) Postgres, (3) grading workers each owning a `llama-server`
slot, (4) the isolated code-execution service. In local-first dev, tiers 1–3 run on one machine
against one local `llama-server`; tier 4 is a managed provider or stubbed until Phase 3.

---

## 5. Question types & evaluation matrix

| Type | Input | Randomization | Evaluator | Feedback timing |
|---|---|---|---|---|
| **Multiple choice** | Option select | Shuffle options; draw N from pool | Deterministic (key match) | Instant |
| **Text input** | Short string/number | Pool draw; **parameterized** (templated vars) | Deterministic (regex / normalized / numeric tolerance) | Instant |
| **Short essay** | 1–3 paragraphs | Pool draw | **LLM + eval skill** (decomposed rubric) | Async |
| **Long-form / prompt / write-up** | Long text | Pool draw | **LLM + eval skill** (multi-criterion rubric) | Async |
| **Programming exercise** | Code | Pool draw; parameterized fixtures | **Sandbox run + tests** (correctness) → **LLM code-review skill** (concepts/patterns/antipatterns) | Async |

Evaluation is layered: deterministic → tests → LLM judgment → human review (escalation only).

---

## 6. Configuration file design (requirement #1)

One folder per topic. Everything is Zod-validated on import; malformed config fails CI.

```
topics/
  golang-concurrency/
    topic.yaml                 # metadata, tag weighting, pass thresholds
    questions/
      mcq.yaml
      text.yaml
      essay.yaml
      code.yaml
    skills/
      eval-essay-tradeoffs.md          # SKILL.md-style eval skill
      eval-code-worker-pool.md
    calibration/
      eval-essay-tradeoffs.yaml        # labeled exemplars for the meta-eval gate
      eval-code-worker-pool.yaml
    exercises/
      worker-pool/                     # starter code, tests, runner image ref
```

**Multiple choice** (`questions/mcq.yaml`):
```yaml
- id: mcq-chan-close
  type: multiple_choice
  tags: [channels, correctness]
  difficulty: 2
  prompt: "What happens when you send on a closed channel?"
  shuffle_options: true
  options:
    - { text: "It panics", correct: true }
    - { text: "It blocks forever" }
    - { text: "It returns the zero value" }
    - { text: "It silently no-ops" }
  explanation: "Sending on a closed channel panics; receiving yields zero value + ok=false."
```

**Parameterized text input** (`questions/text.yaml`) — randomization via generated variables:
```yaml
- id: text-buffered-cap
  type: text_input
  tags: [channels]
  parameters:
    n: { random_int: [2, 8] }
  prompt: "A buffered channel `make(chan int, {{n}})` holds how many values before a send blocks?"
  answer: { equals: "{{n}}", numeric_tolerance: 0 }
```

**Essay** (`questions/essay.yaml`) — points to an eval skill + supplies the answer key:
```yaml
- id: essay-mutex-vs-chan
  type: essay
  length: short            # short | long
  tags: [synchronization, tradeoffs]
  prompt: "When would you choose a mutex over a channel in Go? Discuss the trade-off."
  eval_skill: eval-essay-tradeoffs
  reference_points:        # injected into the grader as the key
    - "Mutex: protecting shared state / simple critical sections; lower overhead."
    - "Channel: transferring ownership / orchestrating goroutines."
    - "Mentions contention, deadlock risk, or readability trade-off."
```

**Programming exercise** (`questions/code.yaml`):
```yaml
- id: code-worker-pool
  type: code
  language: go
  tags: [concurrency, patterns]
  prompt: "Implement a worker pool that processes jobs concurrently with N workers."
  starter_file: exercises/worker-pool/starter.go
  test_command: "go test ./..."
  runner_image: quiz-runner-go:1.22
  timeout_sec: 30
  eval_skill: eval-code-worker-pool
  concept_checks:
    must_use: ["goroutine", "channel", "sync.WaitGroup"]
    avoid_antipattern: ["unbounded goroutine spawn", "busy-wait loop"]
```

**Topic** (`topic.yaml`):
```yaml
id: golang-concurrency
title: "Go Concurrency"
description: "Goroutines, channels, sync primitives, common patterns and pitfalls."
pass_threshold: 0.7
tag_weights: { channels: 1.0, synchronization: 1.0, patterns: 1.5 }
```

---

## 7. Evaluation skills & reliability machinery (requirement #2 + decision #3)

An eval skill is a Markdown file with frontmatter (mirrors the familiar `SKILL.md` shape),
engineered so a **3B/q4 model with 8K context** grades reliably.

```markdown
---
id: eval-essay-tradeoffs
applies_to: essay
output_schema: TradeoffScore     # a Zod schema the engine enforces on the model's JSON
model_hint: "qwen2.5-3b-instruct, temperature 0, response_format=json"
---

# Grading a trade-off essay

Grade against the reference key. Reward correct, specific reasoning — NOT eloquence or length.
Answer each check independently as yes/no. Do not compute a total; the engine does that.

## Checks (each yes/no)
1. both_sides   — Does the answer say when a MUTEX is appropriate AND when a CHANNEL is?
2. real_tradeoff — Does it name a real trade-off (contention, overhead, deadlock, readability)?
3. correct      — Are all technical claims correct (no wrong statements)?
4. specific     — Is it concrete rather than hand-wavy?

## Reference key
{{reference_points}}

## Calibration examples
{{few_shot_from_calibration}}   ← anchors the weak model with 2–3 pre-graded samples

## Output (JSON only)
{ "checks": {"both_sides":true|false, ...}, "feedback": "one specific sentence" }
```

**Why this survives a 3B model:**
- **Near-binary checks**, never holistic 0–100. The model answers small yes/no factual
  questions; the **engine** aggregates checks → score → verdict (deterministic arithmetic).
- **Reference key injected** from the question — grading against a key beats open judgment.
- **Constrained JSON** (`response_format=json`), re-validated with Zod, one retry on malformed.
- **Few-shot calibration** baked in; **temperature 0** for reproducibility.
- **8K budget aware:** rubric + key + few-shot + answer must fit; long-form questions cap
  answer length and/or grade section-by-section.

**The four reliability layers (decision #3):**

1. **Decompose** to near-binary checks (above).
2. **Calibration set is required** — `calibration/<skill>.yaml` holds 5–10 exemplar answers with
   human-assigned expected outcomes (clear pass, clear fail, tricky borderlines). This is the
   skill's own test suite.
   ```yaml
   skill: eval-essay-tradeoffs
   cases:
     - answer: "Use a mutex for simple shared counters; a channel to hand off ownership..."
       expect: { verdict: pass, checks: { both_sides: true, real_tradeoff: true } }
     - answer: "Mutexes are always better."
       expect: { verdict: fail, checks: { correct: false } }
   ```
3. **Meta-eval gate** (the analog of a CI eval-gate): run the grader against the calibration set,
   measure agreement (exact-match rate + pass/fail flip rate). A skill below threshold is marked
   **`needs-work`** and is **not allowed to grade real users** — those question types fall back to
   "flagged for human review." This turns "I hope it grades well" into a number in CI.
4. **Confidence escalation at runtime:** if checks disagree run-to-run, or the score lands within
   ±1 of the pass/fail boundary → re-grade with **self-consistency best-of-3 (temp 0)**; if still
   unstable → escalate to a bigger model (via the `Evaluator` interface) or flag for human review.
   Users always see **"graded"** vs **"flagged for review"**, never a silent coin-flip.

---

## 8. Async grading pipeline (decision #8)

The model is **single-slot** — grading cannot be synchronous in a multi-user app.

- **Deterministic types (MCQ, text) grade inline, instantly** — no model, no queue.
- **LLM types enqueue a grading job.** Submission accepted immediately; UI shows
  **"submitted — grading in progress"**; result lands via poll/push.
- **`grading_jobs` table** (status: `queued | running | done | flagged | failed`) is core schema.
- **Worker pool**, each worker owning its own `llama-server` slot/instance, pulls from the queue.
  Throughput scales by adding small workers — *this is where the cheap-model discipline pays off*.
- **Escalation / best-of-3 run as extra jobs** — a hard essay just finishes later; it never blocks
  other users.
- **Mock-exam mode fits this perfectly:** submit whole exam → "grading N of M" → report.

---

## 9. Programming-exercise execution (decision #5)

Runs **arbitrary attacker-controlled code** in a hosted world — treated as its own hardened tier.

- **Dedicated isolated service**, separate network, **no access to DB, secrets, or other users'
  data** — it holds nothing worth stealing.
- **Managed sandbox provider first** (Judge0-style / E2B / Firecracker-as-a-service) to offload
  the hardest security surface; **self-hosted gVisor (runsc) / Firecracker microVMs later** if
  "code never leaves our infra" becomes a requirement.
- **Per-run hardening:** `--network=none`, read-only rootfs, non-root, seccomp, strict
  CPU/memory/PID/wall-clock caps, ephemeral (destroyed after run).
- **Bounded concurrency + per-user rate limits** so a submission flood can't run away the bill.
- **Grading = tests (correctness) + extracted static signals (`must_use`/`avoid_antipattern`)
  fed into the LLM code-review skill (concepts/patterns).** The small model judges *design* with
  the mechanical facts already extracted — it never reads raw code cold.
- **Delivered last (Phase 3)** — the other four types ship a usable product with zero code-exec risk.

---

## 10. Requirement #4 — adaptive practice, mock interviews, analytics

- **(A) Adaptive practice + spaced repetition.** Per-user, per-question/tag **mastery state**;
  weak tags weighted up in pool draws; missed items re-surfaced on an SM-2-style schedule.
  This is what makes it a study *system*, not a quiz generator.
- **(B) Mock-interview / timed-exam mode.** Assemble a randomized, timed, mixed-format exam from
  a topic (or across topics); async-graded; produces a scored report + "where you'd have failed"
  debrief. A thin assembly layer over the engine + async grading.
- **(C) Analytics dashboard.** Per-topic mastery, score trends, readiness score, export — reads
  the same mastery/attempt tables.

All three drive the schema now (mastery + review-schedule tables) so nothing is bolted on later.

---

## 11. Data model (Postgres, multi-tenant)

Content tables are a **projection of the config files** (content-hash keyed, never hand-edited).
Per-user tables carry `user_id` and are strictly owner-scoped.

| Table | Purpose |
|---|---|
| `users` | Auth identity, role (`user` \| `admin`) |
| `topics` | Projection of `topic.yaml` |
| `questions` | Projection of question configs (+ content hash) |
| `eval_skills` | Projection of skills + latest meta-eval score/status |
| `sessions` | A quiz/exam instance: topic(s), **seed**, config, mode (practice \| mock) |
| `attempts` | Per-question: submitted answer, evaluator output (JSON), score, verdict |
| `grading_jobs` | Async LLM/code grading: status, attempt ref, worker, escalation trail |
| `mastery` | Per-user, per-question/tag mastery state (for adaptive + analytics) |
| `review_schedule` | Spaced-repetition due dates (SM-2 state) |
| `review_queue` | Flagged-for-human-review grading cases (admin works these) |

Content lives in **git** (diffable, reviewable, eval-gated); the DB holds **attempts + progress**.

---

## 12. Auth & roles (decision #10)

- **Auth.js (NextAuth):** Google/GitHub OAuth + email magic-link; HTTP-only cookie sessions.
  **Local dev stub** ("log in as test user") so building never touches a real provider.
- **Two roles:** `user` (takes quizzes, owns own attempts/mastery/progress) and `admin`
  (content import, meta-eval/calibration results, flagged-review queue).
- **Ownership rule:** users read/write only their own attempts + progress; content is
  world-readable to authenticated users, admin-writable via the import pipeline only.
- Schema leaves room to add an `author`/`instructor` role or team/org grouping later (small
  migration) — not built now.

---

## 13. Repository layout

```
job-preparation/
  app/                  # Next.js UI + API routes
  packages/
    engine/             # loader, randomizer, quiz assembler, scorer, adaptive scheduler — pure TS
    schema/             # Zod schemas (config + eval-output) + validate CLI + import step
    evaluators/
      deterministic/    # MCQ + text
      llm/              # Evaluator interface, llama-server client, skill loader, JSON-repair/retry
      code/             # sandbox-service client
      meta-eval/        # calibration runner + gate (CI)
  runners/              # per-language sandbox image definitions (Phase 3)
  topics/               # ← all content lives here (add topics freely)
  drizzle/              # migrations
  DESIGN.md             # this document
```

---

## 14. Roadmap

| Phase | Deliverable | Proves |
|---|---|---|
| **0 — Foundations** | Repo, Zod config schemas, importer + `validate` CLI, Postgres migrations (multi-tenant schema), dev-stub auth | Config-driven core + fail-loud validation + hosted-ready schema |
| **1 — Deterministic quiz** | MCQ + text-input, randomization (shuffle + parameterized), quiz-runner UI, instant scoring, session review | End-to-end loop **with no LLM**; usable product |
| **2 — LLM evaluation** | `Evaluator` interface + `llama-server` client, eval-skill format + loader, **calibration sets + meta-eval gate**, async grading queue + worker pool, essay + long-form grading, escalation/best-of-3 | Small model grades reliably **and provably** |
| **3 — Programming exercises** | Sandbox-service client (managed first), test harness, static-signal extraction, code-review eval skill | Compile/run/test + concept grading, safely |
| **4 — Adaptive + mock + analytics (req #4 A/B/C)** | Mastery tracking, spaced-repetition scheduler, mock-exam assembly + debrief, analytics dashboard | Turns quizzing into interview *preparation* |
| **5 — Hosting + authoring polish** | Real Auth.js providers, cloud deploy, worker scaling, admin content/meta-eval/review UI, topic scaffolder + skill linter | Ready for external users |

A usable app exists at end of **Phase 1**; the trustworthy-grading differentiator lands in
**Phase 2**; the "prep system" value lands in **Phase 4**.

---

## 15. Risks & open items

- **Grading reliability on 3B/q4 is the top product risk.** Mitigated by the meta-eval gate
  (§7) — but each new topic must invest in calibration examples, not just questions. That authoring
  cost is accepted as the price of trustworthy grades.
- **8K context ceiling** constrains long-form essay grading — cap answer length and/or grade
  section-by-section; watch token budgets in the LLM evaluator.
- **Antipattern detection is hard** — never rely on the LLM alone; always feed extracted static
  signals. Some antipatterns may be undetectable and should be scoped out per-exercise.
- **Sandbox cost/abuse** at scale — bounded concurrency + per-user rate limits are mandatory, not
  optional, before code exercises go public.
- **First pilot topic** should be chosen early (e.g. `golang-concurrency`) and built through
  Phases 0–2 to keep the schema and eval-skill format honest against real content.
- **User-contributed content / marketplace** is explicitly **out of scope** until the curated core
  is proven (moderation + malicious-skill + crafted-exercise surface is large).

---

*Next steps: (a) turn this into concrete issues (`prd-to-issues`), or (b) scaffold Phase 0
(repo + Zod schemas + importer + migrations). Recommend building the pilot topic through
Phases 0–2 first.*
