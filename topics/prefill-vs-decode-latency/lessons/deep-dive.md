# Prefill vs. decode latency — architecture, tradeoffs, and reviewing a design

You already know the two phases, their opposite hardware profiles, and the metrics that track them
(TTFT for prefill, TPOT/ITL for decode). This lesson zooms out to the **design space**: the levers a
serving engineer actually pulls to hit latency SLOs, what each one trades away, and how to judge
someone else's prefill/decode design the way an interviewer or a staff engineer in a review would.

## The prefill-vs-decode-latency design space

Every prefill/decode decision is really a decision about **how to hit two different latency targets at
once** — a TTFT budget set by prefill and a TPOT budget set by decode — on a workload where the two
phases fight for the same GPU. Prefill is compute-bound; decode is memory-bandwidth-bound; they
optimize differently, so a single scheduler serving both is serving two workloads. There are a handful
of independent levers, and real systems combine them:

- **How you schedule the two phases together.** The naive design runs a whole prompt's prefill as one
  GPU step. That step is large and it **stalls every in-flight decode**, so one user's long prompt
  spikes everyone else's TPOT. The alternative is **chunked prefill (Sarathi)**: split the prompt into
  chunks and interleave them with ongoing decode so no single prefill monopolizes a step.
- **Whether the phases share hardware at all.** **Prefill/decode disaggregation (DistServe,
  Splitwise)** puts prefill and decode on *different* resources so each is scheduled and scaled for its
  own SLO, removing cross-phase interference entirely at the cost of moving KV state between them.
- **How you set targets.** Reporting **one latency number** hides the TTFT/TPOT split. The lever here
  is simply *measuring and budgeting the two separately* — you cannot optimize what you have averaged
  away.
- **How you route by phase.** Longer prompts load prefill (and TTFT); longer outputs load decode (and
  TPOT). Knowing which phase a workload stresses tells you which lever to reach for — and prevents the
  classic mistake of optimizing decode to fix a prefill-bound workload.

## A tradeoff table for prefill-vs-decode-latency

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Single latency SLO | Simple dashboard, one number to watch | Hides the TTFT/TPOT split; you can't tell which phase regressed | Never for real serving — only a toy demo |
| Separate TTFT + TPOT SLOs | Each phase measured and budgeted on its own terms | Two targets to track and schedule against | Any product with both prompt-heavy and generation-heavy traffic |
| One-shot (monolithic) prefill | Simplest scheduler; fine when prompts are short | A long prefill stalls all in-flight decode, spiking others' TPOT | Short, uniform prompts; low concurrency |
| Chunked prefill (Sarathi) | Interleaves prefill with decode, keeps TPOT low under load | Chunk-scheduling complexity; slightly higher TTFT per request | Mixed traffic where big prompts arrive during active decode |
| P/D disaggregation (DistServe/Splitwise) | Each phase scaled to its own SLO; no cross-phase interference | KV transfer between tiers; more moving parts and hardware | High load where prefill and decode SLOs conflict on shared GPUs |
| Decode batching | Amortizes the bandwidth-bound weight read across requests → throughput | Can raise TTFT if a big prefill blocks the batch | Decode-bound, throughput-limited steady state |

The table is the interview answer in miniature: **name the phase the change affects, name what it
costs, name the regime where it wins.** A candidate who says "just batch it" or "add chunked prefill"
without naming which SLO moves and which phase is bound is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold this subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** continuous batching with monolithic prefill and separate
  TTFT/TPOT dashboards. Prompts get prefilled in one step, decode runs batched, and you watch the two
  metrics. For short, fairly uniform prompts this is a perfectly good baseline and it is what a default
  vLLM/TensorRT-LLM deployment gives you.
- **SOTA (frontier, worth reaching for under real pressure):** **chunked prefill (Sarathi)** so a large
  prompt never stalls in-flight decode, **plus** **prefill/decode disaggregation (DistServe,
  Splitwise)** when the two SLOs genuinely conflict on shared GPUs — scheduling prefill and decode on
  separate resources tuned for compute-bound vs. bandwidth-bound work. The frontier is treating the two
  phases as two schedulable workloads with two SLOs, benchmarked with a tool like GenAI-Perf, rather
  than one blob.
- **Antipattern (looks fine, fails in production):** reporting a **single latency number** that hides
  the TTFT/TPOT split; letting a **monolithic prefill of one long prompt stall everyone's decode**;
  and **optimizing the wrong phase** — throwing decode batching at a prefill-bound (long-prompt)
  workload, or shrinking prompts to "fix" a decode-bound (long-output) one. Each passes a single-user
  demo and degrades the moment mixed, concurrent traffic arrives.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Prefill cost scales with prompt tokens; decode cost scales with output tokens.** TTFT grows with
  prompt length (more to prefill in that first step); total latency grows with output length through
  TPOT (more sequential decode steps). Doubling the prompt barely moves TPOT; doubling the output barely
  moves TTFT. Capacity planning must be done per phase, in the right token count.
- **A big prefill is a TPOT tax on everyone else.** Because a monolithic prefill occupies a whole GPU
  step, in-flight decode requests wait behind it and their inter-token latency spikes. Chunked prefill
  converts that one large step into several small ones interleaved with decode, spreading the cost so no
  single user stalls the batch.
- **Batching amortizes a bandwidth cost, not a compute cost.** Decode re-reads the full weights to emit
  one token, so batching many requests reuses that single read and lifts decode throughput near-linearly
  until bandwidth saturates. Prefill is already compute-bound, so adding requests just queues more
  compute — batching does little for it. This is why the two phases scale so differently.
- **Disaggregation trades interference for transfer.** Splitting prefill and decode onto separate tiers
  removes cross-phase stalls and lets each scale independently, but the KV state built during prefill
  must be shipped to the decode tier. The win holds when the interference you remove costs more than the
  transfer you add — i.e., under high, mixed load.

## Reviewing a prefill-vs-decode-latency design

When you are handed a serving design to critique — in a review or an interview — walk the same
checklist:

1. **Is there one latency number or two?** A single latency SLO hides the TTFT/TPOT split; stop there
   and ask which phase each target governs.
2. **Which phase does the workload stress?** Prompt-heavy (prefill/TTFT) or output-heavy
   (decode/TPOT)? A fix aimed at the wrong phase is an immediate flag — decode batching does nothing for
   a prefill-bound workload.
3. **What happens to in-flight decode when a long prompt arrives?** If prefill is monolithic, one big
   prompt stalls everyone's TPOT. Named chunked prefill (Sarathi) is the tell of a real design.
4. **Do the two phases interfere on shared hardware?** Under high mixed load, ask whether P/D
   disaggregation (DistServe/Splitwise) is warranted to scale each SLO independently, and whether the KV
   transfer cost is accounted for.
5. **How is it measured?** A real design benchmarks TTFT and TPOT separately (e.g., GenAI-Perf) under
   realistic concurrency — never "it feels fast" on a single-user demo.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A **toy** reports one latency number and ignores the phase split; a **prototype** measures
TTFT and TPOT separately; a **demo-ready** design adds chunked prefill so long prompts don't stall
decode; and a **production-ready** design also decides — with data — whether P/D disaggregation is
warranted, benchmarks both SLOs under real concurrency, and routes each workload to the phase-correct
lever.
