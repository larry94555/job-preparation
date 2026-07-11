# Reading list & staying current — inference-stack-tradeoffs

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **FrugalGPT — Chen et al. (2023).** The canonical read for trading cost against quality: an LLM
  cascade that sends easy requests to cheap models and escalates only when needed. Notice that it makes
  the four-way tradeoff concrete — you buy cost savings with latency and complexity, gated by a quality bar.
- **The four coupled axes — latency, throughput, cost, quality (with reliability as the fourth pillar).**
  The load-bearing frame of the whole topic: there is no free lunch, every lever moves at least two axes.
  Notice that a change is only "good" once you name what it *costs* on the other axes, not just what it wins.

## Go deeper (the levers & how they interact)
- **PagedAttention / vLLM — Kwon et al. (2023).** The memory/KV lever in the stack: paging the KV cache
  raises the concurrency ceiling. Notice how a capacity win becomes a throughput and cost win — one lever,
  several axes moved at once.
- **Orca: iteration-level (continuous) batching — Yu et al. (OSDI 2022).** The throughput lever: scheduling
  per decode step keeps the batch full. Notice the latency bill — higher throughput can lengthen an
  individual request's tail, which is exactly the four-way coupling in miniature.
- **Sarathi (chunked prefill) — Agrawal et al. (MSR).** The phase-scheduling lever: interleaving prefill
  chunks with decode smooths the TTFT/TPOT tension. Notice that the same stack tunes for *different* SLOs
  depending on which phase dominates the workload.
- **The roofline model.** The diagnostic underneath every lever choice: is this workload compute-bound or
  memory-bandwidth-bound? Notice that the answer tells you which levers can help *at all* before you tune anything.

## Frontier — what to watch
- **Joint multi-objective optimization.** The open problem: the levers interact, so optimizing one axis in
  isolation silently taxes the others. Watch for methods that optimize latency/throughput/cost/quality
  *together* rather than one metric at a time.
- **Predictable SLOs under load.** The frontier is making the stack's behavior stable as concurrency and
  interference climb — p99 that holds under pressure, not just at idle. Watch for load-aware, SLO-anchored
  scheduling rather than best-effort tuning.

## Tools & implementations worth reading
- **vLLM, TensorRT-LLM, SGLang** — the serving engines where these levers actually live. Reading their
  scheduler and config surfaces is the fastest way to see the four-way tradeoff as knobs, not prose.
- **Load-testing harnesses and combined eval + cost + observability stacks.** The instrumentation that lets
  you *measure* all four axes at once. Notice that a lever you cannot measure across every axis is a lever
  you cannot honestly claim improved the stack.

## How to stay current on this topic
- Follow the **vLLM / TensorRT-LLM / SGLang** repos and release notes — new levers and scheduling policies
  land in code first.
- Track **MLSys, OSDI/SOSP, and NeurIPS/ICML systems tracks** for the next serving/scheduling/routing idea.
- When a new technique appears, ask the three canon questions: *what does it trade across the four axes,
  what SLO regime does it win in, and what eval + cost measurement proves it?* — the SLO-anchored lens the
  deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **vLLM/PagedAttention and continuous batching became table stakes.** Orca's iteration-level batching (Yu
  et al., OSDI 2022) and PagedAttention (Kwon et al., 2023) aged into the *baseline* every serving engine now
  ships; the interesting debates moved up-stack to scheduling and disaggregation, not whether to page the KV cache.
- **Chunked prefill vs. prefill/decode disaggregation is a live, unsettled debate.** Sarathi's chunked-prefill
  (Agrawal et al., MSR; Sarathi-Serve at OSDI 2024) and DistServe/Splitwise's physical P/D split (2024) are
  competing answers to the same TTFT/TPOT tension — recent work (2025) even argues for unifying both, so the
  "which wins" question aged as genuinely open.
- **FrugalGPT's cascade idea aged well and productized.** Chen, Zaharia & Zou (Stanford, 2023,
  arXiv:2305.05176) framed the cost-vs-quality cascade that now underlies routing gateways (LiteLLM,
  OpenRouter, RouteLLM), confirming cost as a first-class axis rather than an afterthought.
- **The "no free lunch / four coupled axes" frame held up; joint multi-objective SLO optimization stayed open.**
  The load-bearing claim that every lever moves at least two axes remains true in practice, and predictable p99
  under load / joint latency-throughput-cost-quality optimization is still the acknowledged frontier.

