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
| `MODEL_CONFIG_PATH` | `/app/model_configuration.yaml`        | catalog of grader models (primary/secondary tiers) |
| `LLAMA_MODEL`     | `local`                                  | fallback grader model when no config file |
| `LLAMA_BIG_MODEL` | (optional)                               | fallback escalation model when no config file |

**sandbox** — `PORT=4500` only. No `DATABASE_URL`, no secrets: it just runs code.

### Choosing the grader model(s)

`model_configuration.yaml` (validated on load) is the source of truth for which
local open-source LLM fills each grader tier — **primary** (faster, less reliable;
the default judge) and **secondary** (slower, more reliable; used by opt-in skills
and as the escalation tiebreaker). It also carries each model's footprint (RAM,
GPU/CPU-only, disk) and a Hugging Face reference, and an allow-list per tier.

- The **/models** page (linked from the home page, opens in a new tab) lets a
  signed-in user switch between **allowed** models for each tier and shows the
  requirements. A tier with a single allowed model is shown read-only. When
  `secondary_model_allowed: false`, only the primary model is ever used.
- To add a model: add a catalog entry (`status: allowed`), then `ollama pull <id>`
  (or import its GGUF) so the model host can serve it. The `id` is the runtime tag;
  the base URL stays in `LLAMA_BASE_URL`.
- If the file is absent/invalid the grader falls back to `LLAMA_MODEL` /
  `LLAMA_BIG_MODEL`, so the zero-config path still works.
- Like `.env`, this file is **node-local**. On a multi-instance deploy, bake it
  into the image or mount it from a shared volume so every replica agrees.

### Backends: where the model runs (llama.cpp / Oracle Cloud)

`model_configuration.yaml` also lists **backends** — the service that hosts the
model behind an OpenAI-compatible endpoint. `environments` gates each backend to
`local` and/or `hosted`, and `DEPLOY_ENV` selects which set applies:

| `DEPLOY_ENV` | Behavior |
| --- | --- |
| `local` (default) | All `local`-eligible backends are offered in **/models**; pick one. Two grader tiers available. |
| `hosted` | The single `hosted`-eligible backend is **forced**, the config is **read-only**, and a `single_model` backend collapses to the primary model only. |

The shipped catalog has three backends:

- **`ollama-local`** — Ollama at `:11434` (multi-model; the two-tier dev default).
- **`llamacpp-local`** — a local llama.cpp `llama-server` at `:8080`, single-model.
  Use it to rehearse the hosted setup on your machine:
  ```bash
  # from a llama.cpp build; serves ONE gguf as the primary model, single-slot
  llama-server -m /models/llama-3.1-8b-instruct-q4_k_m.gguf --host 0.0.0.0 --port 8080 -c 16384 --parallel 1
  ```
  Then select "llama.cpp server (local)" in /models — the secondary tier disables.
- **`oracle-llamacpp`** — `hosted`-only. The single model deployed to Oracle Cloud.

**Deploying the model to Oracle Cloud (single model, CPU-only):**

1. Create an Oracle Cloud compute instance — an Always-Free/Standard shape (12 GB
   RAM) fits models up to ~8B Q4; a PAYG 24 GB shape fits Phi-3-Medium-14B. No GPU
   needed (all catalog models are `cpu_only`).
2. Build llama.cpp and download one GGUF (the model you selected as `primary`,
   from its `huggingface` repo). Llama-3.1-8B-Instruct-Q4_K_M is the current pick.
3. Run llama-server **single-slot** with a generous context and the API key:
   ```bash
   llama-server -m <model>.gguf --host 0.0.0.0 --port 8080 \
     -c 16384 --parallel 1 --api-key "$LLAMA_API_KEY"
   ```
   - **`--parallel 1` is REQUIRED for correctness.** With more than one slot,
     llama-server batches requests continuously, which reorders floating-point
     reductions and makes output **non-deterministic even at `temperature: 0`** —
     grades then wobble run-to-run and quality drops. Grading is sequential, so
     one slot costs nothing. (The eval-gate and worker warn if `/props` reports
     `total_slots > 1`.)
   - **`-c 16384`** is comfortable headroom — grading prompts are ~1.3k tokens;
     the KV cache is ~2 GB for the 8B, trivial on 24 GB. `-c 8192` is also fine.
   - `--api-key` protects `/v1/chat/completions` (note: `/v1/models` and `/props`
     stay public by design — a 200 there does not mean the key is unset).
4. Deploy the app with `DEPLOY_ENV=hosted` and either set the Oracle backend's
   `base_url` to the instance address or inject it at runtime via `LLAMA_BASE_URL`.
   The app now grades every answer with that one model, and /models shows it
   read-only. The grader pins `temperature: 0`, `top_k: 1`, `seed`, and a
   `max_tokens` cap (overridable via `LLAMA_SEED` / `LLAMA_MAX_TOKENS` /
   `LLAMA_TIMEOUT_MS`) so grades are reproducible regardless of server defaults.

**Securing the model + secrets.** The endpoint should not stay open. Generate a
key, restart `llama-server` with `--api-key "<key>"`, and give the same key to the
grader as `LLAMA_API_KEY`. Secrets live in a gitignored `secrets/secrets.env`
locally, or as real environment variables outside GitHub (CI, the instance) —
externally-set values always win. See [utils/README.md](utils/README.md) for the
key generator (`npm run gen-api-key`) and the loader (`npm run secrets:check`).

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
  **Multiple web replicas REQUIRE `STORE=pg`.** The file store (`STORE=file`) keeps
  progress on the instance's local disk, so replica B never sees the progress a
  user saved on replica A — use it only for single-instance/local. The Postgres
  store shares state across all replicas.
- **Sandbox:** the only tier facing untrusted code. Run it under
  gVisor/Firecracker with **no network egress**, dropped capabilities, a
  read-only + ephemeral filesystem, and CPU/memory/wall-clock limits (see
  `services/sandbox/Dockerfile`). Scale it independently of grading concurrency.

## Progress writes are concurrency-safe

Every request handler mutates progress through the store's atomic
`update(userId, topicId, mutator)` (read-modify-write), never a blind
load-then-overwrite — so two in-flight writes for the same user+topic (two tabs,
a double-submit, or two web replicas) can't lose each other's accumulation:

- **`STORE=pg` (hosted, multi-node):** the update runs in a transaction that
  `SELECT … FOR UPDATE` row-locks the `lesson_progress` row, so writes across
  *any* number of web instances serialize on the row. This is the correct choice
  for a hosted multi-user deploy.
- **`STORE=file` (single node):** the update serializes on a process-global
  per-key lock and writes atomically (temp file + `rename`), so a crash or
  concurrent write never leaves a torn JSON file that would silently reset
  progress. Single-node only — see the Web scaling note above.

## Local-first still holds

Hosting is additive — nothing above is required to run or author:

- **Zero-setup:** `npm run begin-lesson` uses the file store and `topics/` on
  disk. No Postgres, no Docker, no secrets.
- **Hosted stack on a laptop:** run `web` against `docker compose up -d db` (the
  unchanged dev `docker-compose.yml`) with `STORE=pg`/`CONTENT=db`/`QUEUE=db`, or
  bring up the full stack with `docker-compose.prod.yml`.

Content always lives, diffable and eval-gated, in `topics/` under git; the DB is
a projection, never the source of truth.
