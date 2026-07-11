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

## Phase 2a — Content projection ✅ DONE

Adds the **content-import projection** (**DESIGN.md §11**) plus a content-source
abstraction so the app can read lesson content from EITHER the git-tracked config files
(local default) or Postgres (hosted). A new `content_topics` table stores each serialized
`LoadedTopic` as a pragmatic JSONB slice keyed by topic id and fingerprinted by a
`contentHash` (sha256 of a stable, key-sorted stringification). The `db:import` script
(`importContent`) projects `topics/` into that table **idempotently** — it upserts a row
only when its hash changed and skips (counts) unchanged topics, so re-running after no
content change reports everything as unchanged. A `ContentSource` interface has two
implementations behind `createContentSource()` (env `CONTENT=file` default | `db`):
`FileContentSource` reads `topics/` via the engine's `loadAllTopics`; `DbContentSource`
reads the projected rows, **dynamically importing** `pg` so the file path never touches
Postgres. Content still lives — diffable and eval-gated — in git; the DB is only a
read-only projection of it. The local runner is untouched: `npm run begin-lesson` still
uses the file store and calls `loadAllTopics` directly, with zero new required runtime
deps on the file path.

The DB persistence + content-projection round-trip is now **verified in-process via
[pglite](https://github.com/electric-sql/pglite) (Postgres compiled to WASM) — no Docker
required**. The Postgres query logic lives in `db-ops.ts` as pure, dependency-injected
functions typed against drizzle's base `PgDatabase`; `PgProgressStore`, `DbContentSource`,
and the importer (`importContentWithDb` / `importContent`) all delegate to them. Because
pglite and the node-postgres drizzle adapter share the same query API, `pglite.test.ts`
runs those exact production functions against an in-memory pglite db — asserting the
progress round-trip and the idempotent 23-topic content import (23 imported, then 23
unchanged) with zero external database. `docker-compose.yml` remains for real-Postgres /
hosted parity; it is no longer needed to exercise the DB path in CI or locally.

**Delivered:** `packages/store/` gains `content-hash`, `db-ops` (the injectable core
Postgres operations), `content` (the `ContentSource` abstraction + `FileContentSource` /
`DbContentSource` / `createContentSource`), `content-import` (`importContent` +
`importContentWithDb`), `content.test`, and the in-process `pglite.test`; the
`content_topics` schema; the `db:import` root script and `scripts/import-content.ts` CLI;
`@job-prep/engine` as a store dependency; `@electric-sql/pglite` as a root devDependency.

## Phase 2b — Next.js UI (remaining)

Replaces the single-file `app/server.ts` with the **Next.js app** described in
**DESIGN.md §10.2 and §13**: server routes for the present→check→apply→assess loop, the
mastery dashboard (**§10.3**), and progress reads/writes going through `ProgressStore` so
the same UI runs on the file store locally and the pg store when hosted. It reads content
through the Phase 2a `ContentSource` so the same UI runs on `topics/` locally and the
projected `content_topics` rows when hosted. A later refinement can normalize the JSONB
slice into fully relational `topics` / `sections` / `lessons` / `questions` tables.

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

### Seam ✅ DONE

Code execution now flows through a `CodeRunner` seam (`@job-prep/sandbox`), mirroring the
`ProgressStore` / `ContentSource` / `JobQueue` pattern — grading logic is unchanged; only
*where* the code runs is swapped by environment.

- **`CodeRunner`** — `run({ solutionCode, testCode, language?, timeoutMs? }) → RunResult`.
- **`LocalRunner`** (default) — wraps the in-process `runTypeScript` subprocess. Fine for
  **single-user local dev**, but it is explicitly **NOT a security boundary**: it runs
  learner code with this process's own privileges, filesystem, and network. It must
  **NEVER face untrusted users**.
- **`HttpRunner`** — `POST`s the run request to `${SANDBOX_URL}/run` on the dedicated
  sandbox service and returns the parsed `RunResult`. This is the hosted path.
- **`createCodeRunner()`** — reads `SANDBOX` (`local` default | `http`) and `SANDBOX_URL`
  (required for `http`). `@job-prep/grading` `wireDefaults()` now injects
  `run: (opts) => createCodeRunner().run(opts)` into the worker deps, so essay grading is
  untouched and code grading (tests → correctness gate → concept escalation) is identical
  whichever runner is selected.

A **standalone reference sandbox service** ships at `services/sandbox/server.ts` (root
script `npm run sandbox-service`, `PORT` default `4500`): a minimal dependency-free Node
`http` server exposing `POST /run` (executes via `runTypeScript`) and `GET /health`. It
touches **no database and no secrets** — it only runs code. This is the application-level
process; the round-trip is verified locally as a plain Node service on localhost (no Docker
required). The security comes from the deploy-time isolation below.

### Deploy-time isolation (required for the HTTP service in production)

The reference service above is the *seam*, not the *sandbox*. When it faces untrusted
users it MUST be deployed under OS-level isolation — this is a deployment property, not
something the Node process can grant itself:

- **Dedicated service on its own network with NO egress** — the run network has no route
  to the DB, secrets, internal services, or the public internet (`--network=none` per run,
  or an isolated network namespace with no default route). It never holds a credential.
- **Dropped Linux capabilities / non-root** — run as an unprivileged UID with
  `--cap-drop=ALL`, `--security-opt=no-new-privileges`, and a strict seccomp profile.
- **Read-only + ephemeral filesystem** — read-only root filesystem with only a small
  ephemeral `tmpfs` scratch dir; the container/microVM is discarded after each run so no
  state leaks between submissions or users.
- **CPU / memory / PID / wall-clock limits** — hard caps on every axis (e.g. CPU quota,
  memory + swap ceiling, PID limit, and the request-level `timeoutMs` wall-clock kill) so a
  fork bomb or infinite loop cannot exhaust the host. Bounded concurrency and per-user
  rate limits sit in front.
- **Kernel isolation via gVisor (runsc) or Firecracker microVMs** — a shared-kernel
  container alone is not sufficient for untrusted code; each run executes under a gVisor
  sandbox (`runsc`) or in a Firecracker microVM, with **per-language runner images**
  (a TypeScript/Node image today, more per language later).
- **Managed provider is the first option** — Judge0, E2B, or Firecracker-as-a-service give
  this hardening out of the box; self-hosted gVisor / Firecracker is the later, more-work
  alternative.

The `LocalRunner` subprocess is the recommended zero-setup path for local, single-user
authoring and dev only, and must never be exposed to untrusted users; hosting always uses
`SANDBOX=http` against a service deployed under the isolation above.

## Phase 6 — Deploy / CI

Ships the hosted deployment and continuous integration: build/containerize the Next.js
app, the worker pool, and the sandbox service; provision managed Postgres; run migrations
via `drizzle-kit` on deploy; wire secrets and the real Auth.js providers (**DESIGN.md
§12**); and gate merges in CI on `validate` + `selfcheck` + `typecheck` + `test` +
`eval-gate` (the existing `certify` chain). The local-first path (`npm run begin-lesson`,
file store, zero deps) remains untouched and continues to be the recommended zero-setup
way to run and author.
