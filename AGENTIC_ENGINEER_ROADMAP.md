# Roadmap — *Becoming an Agentic AI Engineer in 6 Months*

A **second, independent learning track** that lives alongside the existing 22-topic
AI-engineering curriculum. It is complete in itself — a learner can start it cold and
finish job-ready — but it **cross-links** to the core curriculum wherever a topic
overlaps, so a learner can drop into a deeper treatment without the track depending on it.

Status: **roadmap only.** No content is built yet. This document is the contract the
build follows, at the same fidelity as the core curriculum (lessons → checks → apply →
assessment, programming exercises, quizzes, LLM-judge eval-skills + calibration,
per-topic Expert Surface).

---

## 1. Review of the source outline

The 12-stage / 6-month outline is well-ordered and I'd keep the sequence as-is:

- **Foundations before agents** (async, LLM mechanics) is correct — the outline's own
  closing point ("every production agent failure comes from blocking code, no evals, no
  tracing") is exactly right and is why Stages 1, 8, 9 must not be skipped.
- **Evals + observability before shipping** matches how real agent systems fail.
- The progression single-agent → multi-agent → human-in-the-loop → production is the
  right difficulty curve.

Two decisions the outline forces, which this roadmap resolves:

1. **Language: the track is Python.** The core curriculum's executed exercises are
   TypeScript. Agentic engineering in the wild is Python (`asyncio`, `FastAPI`,
   `pydantic`, `anthropic`). We add a **Python execution path** (§3.4) rather than
   translate the domain into TypeScript.
2. **Offline-gradable exercises.** Agent code normally needs a live LLM + API keys. To
   keep exercises deterministic and runnable in CI with no network (as the repo already
   does for its own tests), every exercise tests **pure logic or an injected/stub LLM
   client** — never a live API call (§3.5).

---

## 2. Track shape at a glance

| Stage | Weeks | Topic slug | Title |
|---|---|---|---|
| 1 | 1–2 | `agentic-async-foundations` | Python & Async Foundations |
| 2 | 3–4 | `agentic-llm-mechanics` | LLM Fundamentals for Agents |
| 3 | 5–6 | `agentic-tool-calling` | Tool Calling & Structured Outputs |
| 4 | 7–8 | `agentic-memory-state` | Memory & State Management |
| 5 | 9–10 | `agentic-react-loop` | Single-Agent Workflows (ReAct) |
| 6 | 11–12 | `agentic-multi-agent` | Multi-Agent Orchestration |
| 7 | 13 | `agentic-human-in-the-loop` | Human-in-the-Loop |
| 8 | 14 | `agentic-evaluation` | Evaluation & Quality |
| 9 | 15 | `agentic-observability` | Observability & Tracing |
| 10 | 16 | `agentic-security` | Security & Guardrails |
| 11 | 17 | `agentic-deployment` | Production Deployment |
| 12 | 18+ | `agentic-ship-in-public` | Ship in Public (Capstone) |

**Phase grouping** (rendered as sub-sections on the track's home page):

- **Month 1 — Foundation:** Stages 1–2
- **Month 2 — Agent Core:** Stages 3–4
- **Month 3 — Building Agents:** Stages 5–6
- **Month 4 — Production Skills:** Stages 7–8
- **Month 5 — Ship It:** Stages 9–10
- **Month 6 — Real World:** Stages 11–12

---

## 3. Architecture — how the independent track plugs in

The core curriculum stays untouched. The track is additive.

### 3.1 A `track` field on every topic
Add an optional `track` to `topic.yaml` (schema: `packages/schema/src/topic.ts`):
`track: agentic` for these 12; the existing 22 default to `track: core`. `loadAllTopics`
already discovers every `topics/<slug>/`; nothing needs to move directories.

### 3.2 Two independent sections on the home page
`web/lib/lesson-service.ts` `homeData()` returns topics grouped by `track`; a curated
`AGENTIC_ORDER` array (parallel to the existing `ORDER`) sequences the 12 and carries the
phase grouping. `web/app/page.tsx` renders:

- **"AI-Engineering Lessons"** — the existing grid (core track).
- **"Becoming an Agentic AI Engineer in 6 Months"** — a new section below it, with a
  short track intro (the "what an agentic engineer does" framing + the 6-month table) and
  topic cards grouped by the six monthly phases.

Progress is already per-user-per-topic (`ProgressStore`), so the two tracks are
**independent automatically** — completing/mastering one never touches the other. The
mastery dashboard colors and the "continue where you left off" logic work per-track.

### 3.3 Cross-links, not dependencies
The track references the core curriculum only through **markdown hyperlinks** inside
lessons ("→ for the production-grade treatment, see [Function-Calling Reliability]"). No
build/runtime dependency. The full map is §6.

### 3.4 Python execution path (new capability)
Add a Python runner behind the existing `CodeRunner` seam (`packages/sandbox`):

- Local: a `runPython` sibling to `runTypeScript` that runs `pytest` in a temp dir
  (mirrors the TS runner: write `solution.py` + `test_solution.py`, spawn, capture, cap
  wall-clock). Selected by the code question's `language: python`.
- Hosted: the isolated sandbox service gains a Python image (`quiz-runner-python:3.12`);
  the `HttpRunner` already carries `language` in its payload.
- The `code.yaml` question already supports `language`, `runner_image`, `test_command`
  (`pytest -q`), `starter_file`, `test_file`, `eval_skill`, `concept_checks` — so no
  question-schema change is needed, only the runner.

### 3.5 Offline, deterministic exercises
Exercises test one of:
- **Pure functions** (a model router, a token/cost estimator, a risk classifier, a
  prompt-injection sanitizer, a memory-compression trigger, a trace aggregator, a
  retry/backoff decorator, a Pydantic parse+validate) — trivially unit-testable.
- **Agent loops with an injected stub LLM** — the exercise's function takes a `client`
  whose `.create()` returns scripted tool-calls/answers, exactly how
  `packages/grading/worker.test.ts` grades the real worker with stub graders. This tests
  the *loop control* (max-steps, tool dispatch, handoff validation) without a live model.

This keeps every exercise runnable in CI with no API key — the same discipline the repo
uses for its own suite.

### 3.6 Eval-skills, calibration, and the gate
Each topic ships `skills/eval-<slug>-essay.md` and `skills/eval-<slug>-code.md` plus
`calibration/*.yaml`, so the **meta-eval gate** certifies the track's judges exactly like
the core curriculum (it just adds 24 more skills to the sweep). The pinned grader
(and the Oracle/`--parallel 1` deployment) are shared; no new grader work.

### 3.7 Mastery Index
Each topic carries an `expert-surface.md` with the machine-readable
`<!-- coverage: items=N covered=X partial=Y gap=Z -->` line, so `npm run mastery` reports
the track's completeness. Track it as a **separate sub-total** ("Agentic track: X/Y")
alongside the core index.

---

## 4. The 12 topics (build specs)

Every topic follows the established file layout — `topic.yaml`, `sections.yaml`,
`lessons/<name>.md` + `lesson-<name>.yaml`, `questions/{mcq,missing-term,free-entry,essay,
code,expert,frontier-ops,deep-dive}.yaml`, `skills/eval-*-{essay,code}.md`,
`calibration/*.yaml`, `expert-surface.md`, `reading-list.md` — with `pass_threshold: 0.8`.

**Per-topic quiz budget (baseline, tuned per topic):** ~10 MCQ · ~6 missing-term (cloze) ·
~6 free-entry · 2–3 essay · 1–3 Python code exercises · plus expert/frontier items for the
L3/L4 Expert-Surface rows. Expert Surface target: **18–24 items across D1–D8**.

For each topic below: the goal, the mastery sections, the programming exercise(s), and the
core-curriculum cross-links.

---

### Stage 1 — `agentic-async-foundations` (Weeks 1–2)
**Goal:** write Python that doesn't block while agents wait on models/APIs/tools.
**Sections (mastery bands):**
1. *Concurrency & the event loop* — why agents are I/O-bound; `async`/`await`, `gather`,
   `TaskGroup`; blocking vs non-blocking; `asyncio` vs threads.
2. *Resilient calls* — timeouts, retries with backoff + jitter, circuit-breaking, error
   isolation (one tool failing doesn't crash the run).
**Programming exercises (Python, pytest):**
- `async-fanout` — implement `gather_calls(client, queries)` that fans out N async calls
  concurrently; test asserts concurrency (fake client records overlap) and result order.
- `retry-backoff` — a `retry(attempts, base_delay)` decorator with exponential backoff +
  jitter that gives up after N and re-raises; test drives a flaky fake.
- `isolate-failures` — `run_tools(tools)` returns per-tool `ok/err` so one exception
  never aborts the batch.
**Cross-links:** [golang-concurrency] (worker pools / the same concurrency ideas in Go),
[harness-engineering] (control-flow reliability), [production-failure-modes] (retries,
timeouts, backpressure).

### Stage 2 — `agentic-llm-mechanics` (Weeks 3–4)
**Goal:** reason about the model as a component — context, routing, cost, failure modes.
**Sections:**
1. *Context & tokens* — windows, token accounting, "lost in the middle," context budgets.
2. *Routing & cost* — task→model routing, $/run tracking, the cheap/medium/best ladder.
3. *Failure modes* — hallucination, instruction drift, latency; when to distrust output.
**Exercises:**
- `model-router` — `route_to_model(task, complexity)` returning the right tier; table-driven.
- `cost-estimator` — `estimate_cost(usage, price_table)` → $ per run; edge cases (0 tokens).
- `context-budget` — `fit_messages(messages, max_tokens, keep_last)` that trims/summarizes
  to fit a window while preserving the most recent turns and a system message.
**Cross-links:** [model-routing-fallback], [cost-attribution], [inference-stack-tradeoffs],
[context-engineering], [production-failure-modes], [prompt-vs-semantic-caching].

### Stage 3 — `agentic-tool-calling` (Weeks 5–6)
**Goal:** turn a model that talks into an agent that acts, safely.
**Sections:**
1. *Tool schemas & the tool-use loop* — JSON schemas, the `tool_use` → execute →
   `tool_result` loop, stop reasons.
2. *Structured outputs* — Pydantic models, validate-don't-trust, recovery from malformed
   or wrong tool calls.
**Exercises:**
- `tool-loop` — implement the agent loop over a **stub client** that scripts a
  `tool_use` then an `end_turn`; test asserts the tool ran with validated args and the
  result was fed back.
- `pydantic-parse` — parse+validate a model's JSON into a `ResearchReport`; malformed
  input must raise loudly, not silently pass.
- `tool-recovery` — when the model calls an unknown tool / bad args, return a structured
  error and let the loop continue.
**Cross-links:** [function-calling-reliability] (contracts, idempotency, dispatcher —
the production treatment), [structured-output-reliability] (schema-constrained decoding,
repair).

### Stage 4 — `agentic-memory-state` (Weeks 7–8)
**Goal:** give an agent working, short-term, long-term, and episodic memory.
**Sections:**
1. *The four memories* — buffer (short-term), working, long-term (vector), episodic.
2. *Context compression* — summarize-and-replace at a threshold; recall/remember across
   sessions; staleness.
**Exercises:**
- `memory-buffer` — `AgentMemory.add_message` that compresses (via an injected summarizer
  client) once the buffer passes a threshold, preserving the last K.
- `recall-remember` — `remember(key,value)`/`recall(key)` with timestamps; missing key → None.
- `working-state` — a scratchpad that survives across steps but resets per task.
**Cross-links:** [context-engineering] (what to keep vs drop), [rag-architecture] (vector
long-term memory), [prompt-vs-semantic-caching] (caching recalls), [kv-cache-management].

### Stage 5 — `agentic-react-loop` (Weeks 9–10)
**Goal:** one agent that works end-to-end — Reason → Act → Observe → Decide.
**Sections:**
1. *The ReAct loop* — reasoning + acting interleaved, the system-prompt contract.
2. *Guardrails on the loop* — max-steps, can't-finish handling, per-step logging, tool-
   output validation before feed-back.
**Exercises:**
- `react-agent` — loop with `max_steps`, a clean "step limit reached" return, and a step
  log; driven by a stub client scripting a multi-step solve.
- `validate-observations` — reject/repair a tool output before feeding it back (guards
  the loop from garbage-in).
**Cross-links:** [harness-engineering] (the loop *is* a harness), [agent-guardrails-budgets]
(step/tool/token budgets).

### Stage 6 — `agentic-multi-agent` (Weeks 11–12)
**Goal:** coordinate specialists — and know when *not* to.
**Sections:**
1. *When multi-agent helps (and hurts)* — single-agent first; the supervisor pattern.
2. *Handoffs* — validation between agents, the approval loop with a max-tries exit,
   silent-bad-output failure modes.
**Exercises:**
- `supervisor` — research→write→critic pipeline with a review loop that exits on approval
  or after N tries; stub clients script the specialists.
- `handoff-validate` — reject an incomplete/blank handoff instead of passing it downstream.
**Cross-links:** [agent-guardrails-budgets], [model-routing-fallback] (route specialists),
[eval-methodology] (the critic *is* an evaluator).

### Stage 7 — `agentic-human-in-the-loop` (Week 13)
**Goal:** keep a human on irreversible/expensive actions.
**Sections:**
1. *Risk-gated execution* — risk classes, approval gates before irreversible actions.
2. *Auditability & resumption* — audit trail, pause → human → resume cleanly, timeouts.
**Exercises:**
- `risk-gate` — `assess_risk(action, params)` + `execute_with_approval` that blocks HIGH-
  risk actions on a (stubbed) approval and logs everything.
- `audit-log` — append-only record of action/params/risk/decision with a queryable read.
**Cross-links:** [agent-guardrails-budgets] (budgets/limits), [safety-engineering]
(refusals, approvals), [multi-tenant-isolation] (who's allowed to do what).

### Stage 8 — `agentic-evaluation` (Week 14)
**Goal:** measure agents — you can't improve what you don't measure.
**Sections:**
1. *LLM-as-judge* — scoring rubrics, strict JSON verdicts, judge model choice.
2. *Eval suites & gates* — pass-rate, avg score, regression, "never deploy below 90%."
**Exercises:**
- `llm-judge` — `llm_judge(task, output, criteria)` over a stub judge → `EvalResult`.
- `eval-suite` — `run_eval_suite(agent, cases)` → pass-rate/avg/failed; a deploy gate that
  fails under a threshold.
**Cross-links:** [eval-methodology] (the deep treatment — this stage's parent), [retrieval-evals],
and this repo's own **meta-eval gate** as a worked example of LLM-as-judge + calibration.

### Stage 9 — `agentic-observability` (Week 15)
**Goal:** see inside a running agent — tokens, cost, latency, failures.
**Sections:**
1. *Tracing* — per-step spans: tokens, cost, latency, tool, error; the trace object.
2. *Production surprises* — dev-vs-load cost/latency gaps, tail failures, alerts/dashboards.
**Exercises:**
- `agent-trace` — `AgentTrace.add_step` aggregating total cost/latency; `to_dict` summary.
- `cost-alert` — aggregate a run and fire when cost/latency crosses a budget.
**Cross-links:** [llm-observability] (the parent topic — metrics/logs/traces), [cost-attribution].

### Stage 10 — `agentic-security` (Week 16)
**Goal:** defend the agent once it touches the real world.
**Sections:**
1. *Prompt injection* — instruction/content separation, sanitization, the confused-deputy.
2. *Guardrails* — sandboxed code, PII redaction, output filters, compliance.
**Exercises:**
- `injection-sanitize` — separate system from external content + strip injection patterns;
  test with adversarial "ignore all instructions…" inputs.
- `pii-redact` — redact emails/keys/PII before they enter the context window.
- `output-filter` — block a disallowed action in the agent's proposed output.
**Cross-links:** [safety-engineering] (jailbreaks, refusals — the parent), [multi-tenant-isolation]
(sandboxing, blast-radius), and this repo's sandbox (`LocalRunner` "not a security boundary").

### Stage 11 — `agentic-deployment` (Week 17)
**Goal:** turn "works on my machine" into a service.
**Sections:**
1. *Async job API* — submit → `job_id` → poll; never block the request thread.
2. *Operability* — rate limiting, canary rollout, one-command rollback.
**Exercises:**
- `job-queue` — an in-memory async job store: `submit(task)` → id (queued), background
  `run`, `status(id)` transitions queued→running→done/failed (mirrors this repo's `JobQueue`).
- `rate-limit` — a token-bucket limiter that caps a user's spend/requests per window.
**Cross-links:** [production-failure-modes] (canary, rollback, backpressure), [harness-engineering],
[multi-tenant-isolation] (per-tenant rate limits), and this repo's async grading worker/queue.

### Stage 12 — `agentic-ship-in-public` (Week 18+) — **Capstone**
**Goal:** ship one real agent with a README, evals, and a demo — the thing that gets hired.
**Sections:**
1. *Portfolio architecture* — a real (non-tutorial) agent, README with design decisions,
   an eval suite, a 30–60s demo.
2. *Communicating the work* — architecture write-up, one surprising decision, one break +
   fix.
**Assessment shape:** lighter on quizzes, heavier on **essay + a capstone code exercise**
that assembles pieces from Stages 3/5/8 (a small research-agent with a passing eval suite),
graded by an `eval-agentic-capstone-code` skill on: has tools + a bounded loop, has an eval
suite, handles failure, and is readable. Cross-links: **every** prior stage.

---

## 5. Build plan (waves)

Build in dependency order; each wave is shippable and gate-verified before the next.

- **Wave 0 — Enablers (prereq):** (a) `track` field + home-page two-section rendering +
  `AGENTIC_ORDER`/phases; (b) the **Python runner** (`runPython`, `quiz-runner-python`
  image, `language: python` wiring) with 2–3 smoke exercises; (c) a track landing/intro.
  *Nothing else can be authored-and-tested until the Python runner exists.*
- **Wave 1 — Pilot topic:** author `agentic-tool-calling` **end-to-end** (all files,
  lessons, ~30 questions, 3 exercises, both eval-skills + calibration, expert-surface) as
  the template + fixture, and clear it through the meta-eval gate. It's the richest and
  most central; getting it right de-risks the rest.
- **Wave 2 — Foundations:** Stages 1–2 (`async-foundations`, `llm-mechanics`).
- **Wave 3 — Agent core:** Stages 4–6 (`memory-state`, `react-loop`, `multi-agent`).
- **Wave 4 — Production skills:** Stages 7–10 (`human-in-the-loop`, `evaluation`,
  `observability`, `security`).
- **Wave 5 — Real world + capstone:** Stages 11–12 (`deployment`, `ship-in-public`).
- **Wave 6 — Polish:** cross-link pass (§6), Expert-Surface completeness to 100% on the
  track's Mastery sub-index, walkthrough doc, full track gate green.

**Definition of Done (per topic), mirroring the core curriculum:**
`npm run validate` clean · `npm run selfcheck` clean (deterministic answer keys) ·
Python exercises pass in the sandbox · both eval-skills clear the **meta-eval gate**
(≥0.7 agreement, calibrated) · `expert-surface.md` coverage line at 100% · reading-list
present · cross-links resolve.

---

## 6. Cross-reference map (agentic → core)

| Agentic stage | Links to core topic(s) |
|---|---|
| 1 Async Foundations | golang-concurrency · harness-engineering · production-failure-modes |
| 2 LLM Mechanics | model-routing-fallback · cost-attribution · inference-stack-tradeoffs · context-engineering · production-failure-modes |
| 3 Tool Calling | **function-calling-reliability** · **structured-output-reliability** |
| 4 Memory & State | context-engineering · rag-architecture · prompt-vs-semantic-caching · kv-cache-management |
| 5 ReAct Loop | harness-engineering · agent-guardrails-budgets |
| 6 Multi-Agent | agent-guardrails-budgets · model-routing-fallback · eval-methodology |
| 7 Human-in-the-Loop | agent-guardrails-budgets · safety-engineering · multi-tenant-isolation |
| 8 Evaluation | **eval-methodology** · retrieval-evals |
| 9 Observability | **llm-observability** · cost-attribution |
| 10 Security | **safety-engineering** · multi-tenant-isolation |
| 11 Deployment | production-failure-modes · harness-engineering · multi-tenant-isolation |
| 12 Ship in Public | (capstone — references all) |

Links are one-way (agentic → core) and purely navigational; the core curriculum has no
knowledge of the track.

---

## 7. What changes in the repo (summary for the build)

- **Schema:** `topic.yaml` gains optional `track` (default `core`); code questions already
  support `language`/`runner_image`.
- **Sandbox:** add `runPython` + a Python runner image behind the existing `CodeRunner`.
- **Web:** `homeData()` groups by track; `page.tsx` renders the second section with the
  6-phase grouping + a track intro; a curated `AGENTIC_ORDER`.
- **Content:** 12 new `topics/agentic-*/` directories, fully authored per §4.
- **Docs:** a track walkthrough (new-user guide) + this roadmap; Mastery Index gains an
  "Agentic track" sub-total.
- **Untouched:** the core 22 topics, the grader/gate, the Oracle deployment, auth, storage.

Nothing here is built yet — this is the plan. On approval, Wave 0 (enablers) comes first,
then the pilot topic as the template.
