# Expert Surface — model-routing-fallback

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain routing (pick the cheapest capable model) vs. fallback (reroute when the chosen provider fails) as distinct decisions — `lessons/routing.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: router, cascade, quality gate, escalation, circuit breaker, backoff/jitter, hedged request, degraded mode — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Translate a routing/fallback idea between altitudes (analogy ↔ concrete gateway mechanism) — `lessons/routing.md`, `lessons/degraded.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** FrugalGPT (Chen et al., Stanford 2023) as the cost-cutting LLM-cascade origin — `lessons/expert-context.md`, `questions/expert.yaml` `[canon]`.
- ✅ **[L3]** RouteLLM (LMSYS, 2024) as learned, difficulty-based request routing — `lessons/expert-context.md`, `lessons/deep-dive.md`, `questions/expert.yaml`.
- ✅ **[L4]** Open frontier: FrugalGPT cost cascades vs. RouteLLM learned routing, accurate difficulty prediction, quality-preserving routing / consistency under model swaps — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five routing/fallback levers (routing policy, cascade depth, failure handling, latency shaping, degraded-mode UX) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a routing/fallback design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a routing/fallback design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** The quality gate as the cost/quality knob: pay `cheap + X·strong`, tune X on held-out traffic — `lessons/deep-dive.md`, `lessons/routing.md`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a retry storm on a struggling provider and choose backoff+jitter plus a breaker — `lessons/resilience.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Choose the resilience pattern for a symptom: outage → fallback/breaker, tail latency → hedging, transient blip → bounded retry — `lessons/resilience.md`, `questions/free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a fallback-chain Router with a per-provider circuit breaker (try in order, skip open, structured `all_failed`) — `exercises/router`, `questions/code.yaml`.
- ✅ **[L4]** Debug a broken consecutive-failure counter so a breaker actually trips open — `exercises/circuit-breaker-debug`, `questions/deep-dive.yaml`.
- ✅ **[L4]** Implement a cheap→strong cascade with a tuned quality gate — `exercises/route-cascade`, `questions/frontier-ops.yaml` `code-route-cascade`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** LiteLLM / OpenRouter / gateway proxies as the multi-model routing layer — `lessons/deep-dive.md`, `lessons/expert-context.md`.
- ✅ **[L3]** Honest degraded mode and the fallback-rate metric on a dashboard — `lessons/degraded.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Operational signals beyond fallback rate (per-route hit rate, fallback/escalation rate, circuit-breaker open rate, cost-per-request by route) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the routing frontier moves (learned routers, quality-preserving routing) and how to track it — pointers in `lessons/expert-context.md`; curated reading list in `reading-list.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (silent substitution, no breaker, retry storms) — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a fallback chain with breakers and an honest degraded-mode UX under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
No remaining open work: the cheap→strong cascade coding exercise (D5) is now covered by
`exercises/route-cascade` / `questions/frontier-ops.yaml`, and the frontier drill (D2) and the
routing-metrics operational drill (D6) are covered by `lessons/frontier-ops.md` and
`questions/frontier-ops.yaml`.

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
