# 4. KV cache management, eviction, reuse, memory pressure at scale — Lesson-Plan Breakdown

**Slug:** `kv-cache-management` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** Per-request key/value tensors dominate serving memory and cap concurrency. Managing
allocation, reuse, and eviction is what lets a server hold many sequences without OOM.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** KV cache size drivers; memory pressure (weights/activations/KV); fragmentation; paged blocks; prefix reuse; eviction/preemption (recompute vs. swap); quantized KV.
- **Key terms:** KV cache, block table, paged attention, preemption, recompute vs. swap, prefix sharing, memory pressure.
- **Tradeoffs:** batch/concurrency vs. KV memory; recompute (compute) vs. swap (bandwidth); KV-quant quality vs. capacity.
- **Patterns:** paging + block tables; prefix sharing; priority eviction. **Antipatterns:** contiguous KV allocation (fragmentation); ignoring KV in capacity planning.
- **Architectures:** paged-attention KV manager (vLLM-style); host-swap tiers; radix/prefix-tree caches (SGLang).
- **Papers/posts:** vLLM / PagedAttention (Kwon 2023); SGLang RadixAttention; KV-quant work. *(verify)*
- **People/canon:** Woosuk Kwon et al. (vLLM); SGLang authors.
- **Benchmarks/metrics:** max concurrent sequences, KV bytes/token, throughput vs. context length, OOM rate.
- **Tools/OSS/models:** vLLM, SGLang, TensorRT-LLM, TGI.
- **Open problems:** optimal eviction under mixed SLOs; lossless KV compression; cross-request reuse safety.
- **Interview signals:** can you compute KV memory and explain why long contexts throttle concurrency.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | What the KV cache is & why it dominates memory | T1 | L2→L3 | C1.1, C1.3 | MC, Cloze, FE |
| LP2 | Sizing KV: the memory formula (parameterized) | T1 | L3 | C4.2, C6.2 | Cloze, FE, Code |
| LP3 | Fragmentation & paged attention | T1 | L3 | C3.1, C3.2 | MC, Essay |
| LP4 | Prefix reuse & sharing | T2 | L3 | C3.3, C5.1 | MC, Code |
| LP5 | Eviction & preemption: recompute vs. swap | T2 | L3 | C3.3, C4.3 | Essay, Code |
| LP6 | Build a paged KV allocator + eviction policy | T2 | L3 | C5.2, C5.4 | Code |
| LP7 | Quantized KV & mixed-SLO eviction (frontier) | T3 | L3→L4 | C2.4, C4.4 | Essay |

**Prereqs:** LP1–2 gate; links to topics 3, 5, 6.
