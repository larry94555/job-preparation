# Getting Started

This is **Phase 0** of the interview-prep quiz system: the config-driven foundation. At this
stage you can author topic content (questions, eval skills, calibration sets) and have it
validated. The quiz-taking UI, LLM grading, and code execution come in later phases — see
[`NextSteps.md`](NextSteps.md).

## Prerequisites

- **Node.js ≥ 20** (uses npm workspaces + `tsx`).
- That's it for Phase 0 — no database and no LLM are needed to author and validate content.
  (Postgres and a local `llama-server` come in Phases 1–2.)

## Install

```bash
git clone <your-fork-url> job-preparation
cd job-preparation
npm install
```

## Validate all content

```bash
npm run validate
```

Expected output:

```
✓ golang-concurrency  (7 questions, 2 skills, 1 calibration sets)

All 1 topic(s) valid.
```

The command exits non-zero if any topic has problems, so it works as a **CI gate**. Try it: add
a multiple-choice question with no `correct: true` option and re-run — you'll get a clear error
and a failing exit code.

```
✗ golang-concurrency
    questions: mcq "my-question" has no correct option

1 issue(s) across 1 topic(s).
```

## Type-check

```bash
npm run typecheck
```

## How the project is laid out

```
packages/
  schema/     # Zod schemas + inferred TS types — the config contract
    src/questions.ts   # the 5 question kinds (mcq, text, essay short/long, code)
    src/topic.ts       # topic.yaml
    src/skill.ts       # eval-skill frontmatter + calibration sets
  engine/
    src/loader.ts      # reads a topics/ tree, validates, collects issues (never throws)
    src/randomize.ts   # seeded shuffle + parameterized questions
    src/cli.ts         # the `validate` command
drizzle/
  0000_init.sql        # multi-tenant Postgres schema (used from Phase 1)
topics/
  golang-concurrency/  # the pilot topic
```

## Adding a new topic (the whole point)

Once the engine exists, a new topic is **just files** — no engine changes.

1. Create `topics/<your-topic>/topic.yaml`:

   ```yaml
   id: your-topic
   title: "Your Topic"
   description: "One line."
   pass_threshold: 0.7
   tag_weights: { core: 1.0 }
   ```

2. Add question files under `topics/<your-topic>/questions/` (any `.yaml` filename; each file is
   a YAML **list** of questions). Supported `type` values:

   - `multiple_choice` — `options` with at least one `correct: true`; `shuffle_options` optional.
   - `text_input` — `answer` with `equals`, `regex`, and/or `numeric_tolerance`; optional
     `parameters` for randomized values substituted into `{{name}}` placeholders.
   - `essay` — `length: short | long`, an `eval_skill`, and `reference_points` (the answer key).
     `length: long` is the long-form / prompt / write-up type.
   - `code` — `language`, `test_command`, `runner_image`, optional `eval_skill` +
     `concept_checks` (`must_use` / `avoid_antipattern`).

3. For any `essay`/`code` question that names an `eval_skill`, add
   `topics/<your-topic>/skills/<skill-id>.md` (frontmatter: `id`, `applies_to`, `output_schema`,
   optional `model_hint`; body = the rubric). See
   [`topics/golang-concurrency/skills/`](topics/golang-concurrency/skills) for the pattern.

4. Optionally add `topics/<your-topic>/calibration/<skill-id>.yaml` — labeled exemplar answers
   with expected verdicts. These are the eval skill's own test suite and (from Phase 2) gate
   whether the skill is allowed to grade real users.

5. Run `npm run validate`. Fix anything it reports.

## What is intentionally NOT here yet

- No quiz-taking web UI (Phase 1).
- No LLM grading / `llama-server` integration / calibration gate execution (Phase 2).
- No code sandbox (Phase 3).
- No adaptive practice, mock-exam mode, or analytics (Phase 4).

See [`NextSteps.md`](NextSteps.md) for the ordered plan and [`DESIGN.md`](DESIGN.md) for the full
rationale.
