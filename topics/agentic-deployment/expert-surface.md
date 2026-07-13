# Expert Surface — agentic-deployment

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why "it works on my machine" is not a product and an agent must become a service — `lessons/async-api.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: async job API, job id, queued/running/done/failed, poll, token bucket, canary, rollback — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (the "never block the request thread" rule ↔ the submit → job id → poll flow) — `lessons/async-api.md`, `lessons/jobs.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** Background jobs vs. blocking and FastAPI BackgroundTasks as the smallest async job pattern — `lessons/async-api.md`, `lessons/expert-context.md`.
- ✅ **[L3]** Celery / RQ and worker pools as the Python-standard distributed task queue — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Token-bucket rate limiting and canary / blue-green deploys as the operability canon — `lessons/operability.md`, `lessons/rollout.md`, `questions/mcq.yaml`.
- ✅ **[L4]** Frontier open problems: progressive delivery / feature flags, autoscaling agent workers, deploy-time eval gates — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** The async job API as an architecture: submit is a fast write, poll is a fast read, the worker runs the agent between them — `lessons/async-api.md`, `lessons/jobs.md`, `questions/mcq.yaml`.
- ✅ **[L3]** A job as a state machine (queued → running → done | failed) and the atomic claim behind a worker pool — `lessons/jobs.md`, `lessons/expert-context.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Rate limiting as multi-tenant fairness — a hard cap (bucket) that permits bursts but bounds the average — `lessons/operability.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a blocking endpoint under load and prescribe an async job API with a job id — `lessons/async-api.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose a bad new version and choose canary → watch errors → one-command rollback over roll-forward — `lessons/rollout.md`, `questions/mcq.yaml`, `essay.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement an async job queue with submit/run_next/status (`JobQueue`) — `exercises/job-queue`, `questions/code.yaml`.
- ✅ **[L3]** Implement a deterministic token-bucket rate limiter with an injected clock (`TokenBucket`) — `exercises/rate-limit`, `questions/code.yaml`.
- ✅ **[L3]** Implement deterministic, sticky canary routing with a stable hash (`route`) — `exercises/canary-route`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** FastAPI BackgroundTasks + Celery/RQ + a worker pool + per-tenant rate limits + canary/rollback as the practical deployment stack — `lessons/expert-context.md`, `lessons/operability.md`, `lessons/rollout.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the deployment frontier moves (progressive delivery, autoscaling workers, deploy-time eval gates) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard turning an agent into a service and defend the deployment checklist under questioning — `questions/essay.yaml` (`essay-deploy`, `essay-operability`).

## Coverage summary
18 items · ✅ 18 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (metric-gated progressive delivery for agents, eval gates trusted enough to auto-promote a deploy).

<!-- coverage: items=18 covered=18 partial=0 gap=0 -->
