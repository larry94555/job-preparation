# Expert Surface — kv-cache-management

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Explain why decoding caches K/V and why it is quadratic without a cache — `lessons/kv-memory.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: KV cache, block, page, eviction, prefix sharing, fragmentation — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Translate between altitudes (analogy ↔ tensor-shape mechanism) — `lessons/kv-memory.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** PagedAttention/vLLM (Kwon et al. 2023) as the paging origin — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Continuous/iteration-level batching (Orca) and its coupling to KV capacity — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- 🟡 **[L4]** KV quantization frontier (KVQuant, KIVI, fp8 KV) — named as a lever in `lessons/deep-dive.md`; no dedicated paper drill.
- ⬜ **[L4]** Cross-request KV reuse / prefix-cache research beyond vLLM copy-on-write (e.g. SGLang RadixAttention) — not yet covered.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five KV levers (layout, attention sharing, precision, placement, reuse) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a KV design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a KV design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Concurrency is KV-bound: size from per-token KV, not weights — `lessons/kv-memory.md`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Compute KV bytes for a given arch/dtype/context and derive max concurrency — `lessons/kv-memory.md`, `questions/free-entry.yaml`.
- ✅ **[L3]** Diagnose OOM-under-load to KV growth and choose paging/eviction — `lessons/paging.md`, `lessons/eviction.md`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement a paged block allocator (ceil sizing, no over-allocation, no block sharing) — `exercises/paged-allocator`, `questions/code.yaml`.
- ✅ **[L4]** Debug a KV block-reuse corruption bug (slice-vs-splice pool leak) — `exercises/paged-allocator-debug`, `questions/deep-dive.yaml`.
- 🟡 **[L4]** Implement an eviction/admission policy under pressure — taught in `lessons/eviction.md`; no dedicated coding exercise.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** vLLM / TGI / TensorRT-LLM as the serving stacks that page KV — `lessons/expert-context.md`.
- 🟡 **[L3]** Operational signals (KV utilization, preemption/eviction rate, admission rejects) — discussed in `lessons/deep-dive.md`; not drilled as metrics.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the KV frontier moves (quantized KV, disaggregated prefix caches) and how to track it — `reading-list.md` (curated papers/tools + a staying-current method), pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on KV/serving capacity — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a KV capacity + paging design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
18 items · ✅ 15 covered · 🟡 2 partial · ⬜ 1 gap. Weighted coverage (covered=1, partial=0.5) ≈ **89%**.
Open frontier work: dedicated KV-quantization paper drill, cross-request prefix-cache research (RadixAttention),
an eviction-policy coding exercise, and a KV-metrics operational drill.

<!-- coverage: items=18 covered=15 partial=2 gap=1 -->
