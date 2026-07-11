# Deploy runbook (Phase 6 hosting)

The hosted stack is four tiers (DESIGN §§6, 8, 9). Each maps to one service in
`docker-compose.prod.yml`:

| Tier        | Compose service | Image                    | Runs                                   | Faces untrusted code? |
| ----------- | --------------- | ------------------------ | -------------------------------------- | --------------------- |
| Next.js app | `web`           | `web/Dockerfile`         | `node web/server.js` (standalone)      | no                    |
| Postgres    | `db`            | `postgres:16-alpine`     | managed/containerized DB               | no                    |
| Grading     | `worker`        | `Dockerfile.worker`      | `npm run worker` (drains `grading_jobs`)| no                    |
| Sandbox     | `sandbox`       | `services/sandbox/Dockerfile` | `npm run sandbox-service`         | **YES**               |

Each grading **worker** replica owns a single llama-server model slot; the
**sandbox** is the only tier that executes user-submitted code.

## Environment variables per tier

Shared: `DATABASE_URL` (managed Postgres), `AUTH_SECRET` (`openssl rand -base64 32`).

**web**

| Var                 | Value / example                              | Why                                  |
| ------------------- | -------------------------------------------- | ------------------------------------ |
| `DATABASE_URL`      | `postgres://user:pass@host:5432/jobprep`     | Postgres store + content + queue     |
| `AUTH_SECRET`       | (secret)                                     | signs Auth.js session JWTs           |
| `AUTH_ADMIN_EMAILS` | `admin@example.com`                          | grants the `admin` role              |
| `STORE`             | `pg`                                         | use `PgProgressStore`                |
| `CONTENT`           | `db`                                         | read content from `content_topics`   |
| `QUEUE`             | `db`                                         | enqueue grading into `grading_jobs`  |
| `SANDBOX`           | `http`                                       | delegate code exec to the sandbox    |
| `SANDBOX_URL`       | `http://sandbox:4500`                        | address of the sandbox service       |
| `PORT`              | `3000`                                       | listen port                          |

**worker**

| Var               | Value / example                          | Why                                    |
| ----------------- | ---------------------------------------- | -------------------------------------- |
| `DATABASE_URL`    | `postgres://…`                           | reads the shared job queue             |
| `QUEUE`           | `db`                                     | `DbJobQueue`                           |
| `SANDBOX`         | `http`                                   | code grading runs via the sandbox      |
| `SANDBOX_URL`     | `http://sandbox:4500`                    | sandbox address                        |
| `LLAMA_BASE_URL`  | `http://llama:8080/v1`                   | this replica's model slot              |
| `LLAMA_MODEL`     | `local`                                  | small/first-pass grading model         |
| `LLAMA_BIG_MODEL` | (optional)                               | escalation model for low-confidence    |

**sandbox** — `PORT=4500` only. No `DATABASE_URL`, no secrets: it just runs code.

**db** — `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` (default `jobprep`).

## Deploy sequence

Flow: **config → PR → eval-gate → deploy → re-import** (DESIGN §13). CI runs the
gate on every PR; `deploy.yml` runs on a release tag or manual dispatch.

1. **Eval-gate (the gate).** `npm run eval-gate` MUST pass against a live grading
   model before shipping. In CI it self-skips (no model) and passes as a no-op;
   in `deploy.yml` it is required — a failing eval-skill must never grade users.
2. **Build images.** `web`, `worker`, `sandbox` (deploy.yml, gated on registry
   secrets). Never built in a no-egress dev box.
3. **Migrate the DB.** `npm run db:migrate` — applies the committed
   `drizzle/*.sql` migrations via drizzle-kit. **This is the production path, not
   `npm run db:push`.** `db:push` diffs the live DB against the schema for local
   dev; production uses reviewed, versioned migration files.
4. **Import content.** `CONTENT=db DATABASE_URL=… npm run db:import` — projects
   the git-tracked `topics/` into `content_topics`. Idempotent (content-hash
   keyed), so it is safe to re-run on every deploy ("re-import").
5. **Start the tiers.** Bring up `web` + `worker` + `sandbox` (db first). The
   sandbox exposes `GET /health`; `web`/`worker` `depends_on` it being healthy.

```
docker compose -f docker-compose.prod.yml up -d db
npm run db:migrate            # DATABASE_URL set
CONTENT=db npm run db:import  # DATABASE_URL set
docker compose -f docker-compose.prod.yml up -d web worker sandbox
```

## Scaling

- **Grading throughput:** add `worker` replicas — the single-slot model can't
  grade concurrently, so scale = more workers, each pinned to its own
  `LLAMA_BASE_URL`. `docker compose -f docker-compose.prod.yml up -d --scale worker=N`.
- **Web:** stateless behind Postgres; scale replicas freely behind a load balancer.
- **Sandbox:** the only tier facing untrusted code. Run it under
  gVisor/Firecracker with **no network egress**, dropped capabilities, a
  read-only + ephemeral filesystem, and CPU/memory/wall-clock limits (see
  `services/sandbox/Dockerfile`). Scale it independently of grading concurrency.

## Local-first still holds

Hosting is additive — nothing above is required to run or author:

- **Zero-setup:** `npm run begin-lesson` uses the file store and `topics/` on
  disk. No Postgres, no Docker, no secrets.
- **Hosted stack on a laptop:** run `web` against `docker compose up -d db` (the
  unchanged dev `docker-compose.yml`) with `STORE=pg`/`CONTENT=db`/`QUEUE=db`, or
  bring up the full stack with `docker-compose.prod.yml`.

Content always lives, diffable and eval-gated, in `topics/` under git; the DB is
a projection, never the source of truth.
