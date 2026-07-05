# job-preparation

A config-driven quiz platform for interview preparation. Once the engine exists, a new
programming topic is added by dropping in configuration files and evaluation skills — no
engine code changes. Open-ended answers are graded by a **small local LLM** driven by
carefully engineered, individually-tested evaluation skills.

- **Design & rationale:** [`DESIGN.md`](DESIGN.md)
- **How to run it:** [`GettingStarted.md`](GettingStarted.md)
- **What to build next:** [`NextSteps.md`](NextSteps.md)

## Status

**Phase 0 — Foundations.** This repo currently contains the config-driven core:

- Zod schemas for every question type, topics, eval skills, and calibration sets
  (`packages/schema`).
- A content **loader + validator** that reads a `topics/` tree and fails loud on bad config
  (`packages/engine`).
- A `validate` CLI (`npm run validate`).
- The multi-tenant database schema as a migration (`drizzle/0000_init.sql`).
- A pilot topic, `topics/golang-concurrency/`, exercising all question types + one eval skill
  with a calibration set.

The quiz-taking UI, LLM grading, and code execution arrive in later phases — see
[`NextSteps.md`](NextSteps.md).

## Quick start

```bash
npm install
npm run validate     # loads & validates every topic under topics/
```

## Layout

```
packages/
  schema/     # Zod schemas + inferred types (the config contract)
  engine/     # loader, validator, randomizer, CLI
drizzle/      # SQL migrations (multi-tenant schema)
topics/       # all content lives here — add a folder to add a topic
```
