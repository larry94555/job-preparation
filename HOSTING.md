# Hosting plan

This document tracks the phased path from the local, zero-setup lesson runner to a
multi-user hosted app. It builds on the architecture in `DESIGN.md` (see the referenced
sections per phase). The organizing constraint across every phase is **local-first**.

## Local-first is preserved (non-negotiable)

`npm run begin-lesson` remains the zero-setup path. It uses the **file store**
(`STORE=file`, the default), which has **zero required runtime dependencies** — no
database, no Docker, no network. Progress is written exactly as before to
`.progress/<id>.json`; the only change is that the file I/O now flows through the shared
`@job-prep/store` module so the hosted path can reuse the same interface.

The hosted stack is also runnable entirely on a laptop: `docker compose up -d db`
brings up Postgres locally, `STORE=pg` selects the Postgres-backed store, and open-ended
grading (Phase 2+) targets a local `llama-server` / model. There is never a step that
*requires* the cloud — the cloud is a deployment target, not a dependency.

The Postgres dependencies (`pg`, drizzle's node-postgres adapter) are loaded via dynamic
`import()` and only when `STORE=pg` is selected, so the file path never touches them at
runtime even though they are installed for the pg path and for typechecking.

---

## Phase 1 — Shared persistence layer + local infra ✅ DONE

Introduces a single persistence interface, `ProgressStore`
(`get` / `set` / `list`, user- and topic-scoped), with two implementations behind it:

- **`FileProgressStore`** — the default, zero-dependency path. Scopes each user to
  `<baseDir>/<userId>/<topicId>.json` and wraps the shared synchronous `file-io` helpers
  (`readProgress` / `writeProgress` / `listKeys`) that the local server now also uses.
- **`PgProgressStore`** — a Postgres implementation using Drizzle over `pg`, with `pg`
  and the drizzle adapter **dynamically imported** so the module never loads Postgres
  unless it is actually instantiated. `get` reads a row's `data`; `set` upserts on the
  composite `(userId, topicId)` key with `updatedAt`; `list` returns all of a user's
  rows; a `users` row is ensured on first write.

`createStore()` reads `STORE` (`file` default | `pg`), `DATABASE_URL`, and `PROGRESS_DIR`
to build the selected store. The Drizzle schema (`users`, `lesson_progress`) is a Phase-1
slice of the multi-tenant data model in **DESIGN.md §11**; later phases extend it. Local
infra ships too: `docker-compose.yml` (a `postgres:16-alpine` `db` service),
`.env.example`, `drizzle.config.ts`, and `db:up` / `db:down` / `db:push` / `db:generate`
scripts. The local runner (**DESIGN.md §10.2**) is unchanged in behavior — its
synchronous `loadProgress` / `saveProgress` now route through `@job-prep/store`, keeping
the same `.progress/<id>.json` layout, and `npm run begin-lesson` behaves identically.

**Delivered:** `packages/store/` (`file-io`, `types`, `file`, `schema`, `pg`, `index`,
`file.test`); root `typecheck` / `test` wired to the new package; a minimal
`app/server.ts` refactor; and the Docker / env / drizzle infra above.

---

## Phase 2 — Next.js runner + content-import projection

Replaces the single-file `app/server.ts` with the **Next.js app** described in
**DESIGN.md §10.2 and §13**: server routes for the present→check→apply→assess loop, the
mastery dashboard (**§10.3**), and progress reads/writes going through `ProgressStore` so
the same UI runs on the file store locally and the pg store when hosted. It adds the
**content-import projection** (**DESIGN.md §11**): the git-tracked `topics/` configs are
projected (content-hash keyed, never hand-edited) into read-only `topics` / `sections` /
`lessons` / `questions` tables, so the hosted app reads content from the DB while content
still lives, diffable and eval-gated, in git.

## Phase 3 — Auth.js + user scoping

Adds authentication and real per-user isolation per **DESIGN.md §12**: Auth.js (NextAuth)
with a **local dev-stub** ("log in as test user") so building never touches a real
provider, plus OAuth/magic-link for hosting, and the two roles (`user` / `admin`). Every
`ProgressStore` call becomes scoped to the authenticated user id; the ownership rule
(users read/write only their own progress, content is world-readable to authenticated
users) is enforced at the route layer. This is the point at which `userId` stops being a
fixed local constant and becomes the real session identity.

## Phase 4 — Async grading job queue + worker pool

Implements the async grading pipeline from **DESIGN.md §8**. Deterministic types keep
grading inline; **LLM types enqueue a grading job** into a `grading_jobs` table
(`queued | running | done | flagged | failed`) and the submission is accepted immediately
while the UI shows "grading in progress". A **worker pool**, each worker owning its own
`llama-server` slot, pulls from the queue; escalation / best-of-3 run as extra jobs so a
hard essay finishes later without blocking other users. Mock-exam mode (**DESIGN.md §10**)
rides on the same queue: submit the whole exam, watch "grading N of M", get a report.

## Phase 5 — Isolated code-execution sandbox service

Hardens programming-exercise execution per **DESIGN.md §9**. The in-process TypeScript
runner is replaced by a **dedicated, isolated sandbox service** on its own network with
**no access to the DB, secrets, or other users' data** — a managed provider first
(Judge0-style / E2B / Firecracker-as-a-service), self-hosted gVisor / Firecracker microVMs
later. Per-run hardening (`--network=none`, read-only rootfs, non-root, seccomp, strict
CPU/memory/PID/wall-clock caps, ephemeral) plus bounded concurrency and per-user rate
limits. Grading stays **tests + extracted static signals fed into the code-review eval
skill**, so the model judges design with mechanical facts already extracted.

## Phase 6 — Deploy / CI

Ships the hosted deployment and continuous integration: build/containerize the Next.js
app, the worker pool, and the sandbox service; provision managed Postgres; run migrations
via `drizzle-kit` on deploy; wire secrets and the real Auth.js providers (**DESIGN.md
§12**); and gate merges in CI on `validate` + `selfcheck` + `typecheck` + `test` +
`eval-gate` (the existing `certify` chain). The local-first path (`npm run begin-lesson`,
file store, zero deps) remains untouched and continues to be the recommended zero-setup
way to run and author.
