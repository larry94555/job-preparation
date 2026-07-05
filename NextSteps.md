# Next Steps

Ordered plan for what to build next, derived from the roadmap in [`DESIGN.md`](DESIGN.md) §14.
Phase 0 (this PR) delivered the config-driven foundation: schemas, loader/validator, CLI,
multi-tenant migration, and a pilot topic. The phases below build on it.

Guiding rule from the design: **cheapest evaluation first, hosted-ready architecture, local-first
deployment.** Ship a usable product early (Phase 1), make grading trustworthy (Phase 2), then add
the harder/optional pieces.

---

## Phase 1 — Deterministic quiz (next up)

Goal: a runnable quiz loop with **no LLM** — instant, fully deterministic grading. This is the
first genuinely usable product.

- [ ] **Postgres + Drizzle wiring.** Apply `drizzle/0000_init.sql`; add a Drizzle client in a new
      `packages/db`. Local Postgres via Docker Compose for dev.
- [ ] **Content importer.** New command (`import`) that loads validated topics (reuse
      `loadAllTopics`) and projects them into `topics` / `questions` / `eval_skills`, keyed by
      content hash. Idempotent; re-runnable on deploy.
- [ ] **Next.js app** (`app/`). App Router, Auth.js with a **dev-stub provider** ("log in as test
      user"), two roles (`user` / `admin`).
- [ ] **Quiz assembler.** Given a topic + tag weights + count, draw a randomized question set;
      create a `sessions` row with a stored seed. Reuse `prepareQuestion` from
      `packages/engine/src/randomize.ts`.
- [ ] **Deterministic evaluators** (`packages/evaluators/deterministic`): MCQ key-match and
      text-input match (`equals` / `regex` / `numeric_tolerance`, with normalization). Write
      `attempts` and return instant feedback.
- [ ] **Take-quiz + review UI.** Render prepared questions (answer keys stay server-side), submit,
      show score and per-question explanations. Reproduce a past session from its seed.

**Done when:** a user can log in (dev stub), take a randomized MCQ + text quiz, and get an
instant score with review — end to end, persisted.

---

## Phase 2 — LLM evaluation + reliability machinery

Goal: trustworthy grading of essay/long-form answers by the small local model, **and a number
that proves it**.

- [ ] **`Evaluator` interface** (`packages/evaluators/llm`) with a `llama-server` implementation
      (OpenAI-compatible endpoint, `temperature: 0`, `response_format: json`). Config-driven base
      URL/model so Ollama or a hosted model swaps in.
- [ ] **Eval-skill runtime.** Load a skill's Markdown body, inject the question's
      `reference_points` and few-shot calibration examples, call the model, validate the JSON
      against the skill's `output_schema` (Zod), one retry on malformed output. Engine aggregates
      the boolean checks → score → verdict (model never does arithmetic).
- [ ] **Async grading pipeline.** DB-backed queue + `grading_jobs`; a worker process owning a
      `llama-server` slot; UI shows "submitted — grading in progress" and resolves on completion.
- [ ] **Meta-eval gate** (`packages/evaluators/meta-eval`). Run each skill against its
      `calibration/*.yaml`; measure agreement (exact-match + pass/fail flip rate); write
      `eval_skills.meta_eval_score` / `meta_eval_status`. A `needs-work` skill may not grade real
      users — those questions route to `review_queue`. Wire this into CI as a gate.
- [ ] **Confidence escalation.** Best-of-3 self-consistency at temp 0 when checks disagree or the
      score is on the pass/fail boundary; escalate to a bigger model or human review; record the
      trail in `grading_jobs.escalation`.

**Done when:** the pilot's `eval-essay-tradeoffs` skill grades its calibration set above
threshold in CI, and a user's essay is graded asynchronously with a visible verdict.

---

## Phase 3 — Programming exercises

Goal: compile/run/test submissions safely, then grade concepts — the highest-risk piece, so it
comes after the product is proven and auth/quotas exist.

- [ ] **Isolated execution service** (separate tier, no DB/secret access). Start with a **managed
      sandbox provider**; keep the client behind an interface so self-hosted gVisor/Firecracker
      can replace it later.
- [ ] **Test harness.** Mount starter + submission, run `test_command` in `runner_image`, capture
      pass/fail with strict CPU/memory/PID/wall-clock limits, `--network=none`, non-root.
- [ ] **Static-signal extraction.** Detect `concept_checks.must_use` / `avoid_antipattern`
      (grep/AST) and pass the evidence to the code eval skill — the model judges design with facts
      already extracted, never raw code cold.
- [ ] **Code eval skill** wired through the same async pipeline (`eval-code-worker-pool` is ready
      as the pilot).
- [ ] **Bounded concurrency + per-user rate limits** so a submission flood can't run away cost.

**Done when:** submitting the worker-pool solution runs the Go tests in a sandbox and returns a
correctness + concept verdict.

---

## Phase 4 — Adaptive practice, mock interviews, analytics (requirement #4 A/B/C)

- [ ] **Mastery tracking (A).** Update `mastery` from attempts; weight weak tags up in the
      assembler's pool draw.
- [ ] **Spaced repetition (A).** SM-2 scheduler over `review_schedule`; a "due for review" queue.
- [ ] **Mock-interview mode (B).** Timed, mixed-format, randomized exam assembled across tags/
      topics (`sessions.mode = 'mock'`); async-graded; scored report + "where you'd have failed"
      debrief.
- [ ] **Analytics dashboard (C).** Per-topic mastery, score trends, readiness score, export —
      reads the same mastery/attempt tables.

---

## Phase 5 — Hosting + authoring polish

- [ ] Real Auth.js providers (Google/GitHub + email magic-link); cloud deploy.
- [ ] Horizontal grading-worker scaling; move the queue to a managed broker if needed.
- [ ] Admin UI: content import, meta-eval/calibration results, flagged-review queue.
- [ ] Authoring ergonomics: topic scaffolder, eval-skill linter, richer CLI reporting.

---

## Recommended immediate next action

Build **Phase 1 against the existing pilot topic** (`golang-concurrency`). Keeping a real topic in
the loop from the start keeps the schema and the assembler honest. Do not start Phase 2 grading
until Phase 1's deterministic loop is solid — it's the foundation the async grading UX plugs into.
