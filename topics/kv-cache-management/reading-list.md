# Reading list & staying current — kv-cache-management

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **PagedAttention / vLLM — Kwon et al. (2023).** The paper that reframed the KV cache as *paged* memory.
  Notice the analogy to OS virtual memory: fixed-size blocks kill internal fragmentation and enable
  copy-on-write prefix sharing. This is the single most important read for the topic.
- **Orca: iteration-level (continuous) batching — Yu et al. (OSDI 2022).** Why KV capacity, not compute,
  bounds concurrency: scheduling per decode step lets finished sequences leave and waiting ones join.
  Notice how batching and KV management are the same problem viewed from two sides.

## Go deeper (mechanism & attention structure)
- **FlashAttention — Dao et al.** The IO-aware attention kernel underneath modern serving. Notice it
  changes *how* attention is computed (tiling, no materialized N×N matrix), which interacts with KV layout.
- **Multi-Query / Grouped-Query Attention (MQA/GQA).** The structural lever that shrinks the *number* of KV
  heads — a 4–8× cut in KV bytes chosen at training time. Notice this is the biggest capacity lever and it
  is not a serving-time knob.

## Frontier — what to watch
- **KV-cache quantization (int8/fp8, and research like KVQuant / KIVI).** Roughly doubles capacity; the open
  question is quality drift on long contexts. Watch for eval-gated adoption, not blanket claims.
- **Cross-request / disaggregated prefix caches (e.g. SGLang RadixAttention; prefill/decode disaggregation).**
  The frontier is treating shared prefixes and the KV cache as cluster-level state, not per-replica.

## Tools & implementations worth reading
- **vLLM, TGI, TensorRT-LLM, SGLang** — the serving stacks that page the KV cache. Reading vLLM's block
  manager is the fastest way to turn the paper into a mental model of real code.

## How to stay current on this topic
- Follow the **vLLM / SGLang / TensorRT-LLM** repos and release notes — KV features land in code first.
- Track **MLSys, OSDI/SOSP, and NeurIPS/ICML systems tracks** for the next batching/paging/quantization idea.
- When a new KV technique appears, ask the three canon questions: *what does it trade (quality/latency/
  memory), what regime does it win in, and what eval proves it?* — the same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **PagedAttention became the default serving primitive.** What was a 2023 SOSP idea is now the bedrock of
  essentially every production engine — vLLM, TGI, SGLang, and TensorRT-LLM (as paged KV / inflight
  batching) all page the KV cache. Contiguous KV allocation is now the anti-pattern, exactly as the canon
  red flag says. This is the entry that aged *best*: the analogy to OS virtual memory held.
- **The 2–4× throughput number held up.** Independent 2025/2026 write-ups still quote ~3–4× larger batch
  sizes and throughput on the same hardware from paging + continuous batching — the original claim was not
  marketing that decayed, it's a stable baseline others are measured against.
- **KV quantization matured from frontier to shipping feature, but stayed eval-gated.** int8/fp8 KV (and
  research like KVQuant/KIVI) is now common, yet the long-context quality-drift caveat in the frontier
  section aged correctly: it's adopted *behind evals*, not as a blanket win.
- **Prefix/radix sharing generalized outward.** SGLang's RadixAttention-style prefix reuse and cross-request
  / disaggregated KV (KV transfer between prefill and decode pools, cluster-level KV as in LMCache/MoonCake)
  moved from "watch this" to standard practice — the frontier bullet on treating KV as cluster state was on
  the right trajectory.
- **What to watch next:** the open problems the canon named — optimal eviction under mixed SLOs and lossless
  KV compression — are still genuinely open; new 2026 work (angle-domain / rate-distortion KV retention) is
  attacking compression, so this is the live edge, not settled.
