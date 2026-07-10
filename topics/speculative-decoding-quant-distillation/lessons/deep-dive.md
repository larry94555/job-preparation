# Inference optimization — architecture, tradeoffs, and reviewing a design

You already know the three levers — speculative decoding, quantization, distillation — what each
targets, and which one is lossless. This lesson zooms out to the **design space**: how a systems
engineer combines the levers under a real SLO, what each combination trades away, and how to judge
someone else's inference-optimization plan the way an interviewer or a staff engineer in a design
review would.

## The speculative-decoding-quant-distillation design space

Every optimization decision here is really a decision about **which axis you are buying down — latency,
memory/cost, or model size — and how much quality risk you will pay for it**. The levers are not
interchangeable, and the senior move is to name the goal before naming the tool.

- **Speculative decoding** buys **latency** and nothing else. A small draft model proposes several
  tokens; the target verifies them in one parallel pass and accepts the longest correct prefix. It is
  **lossless** — the output is exactly what the target would have produced. Its whole economics ride on
  **acceptance rate**: a poor draft yields little speedup or even a slowdown, because verifying rejected
  drafts is wasted work.
- **Self-speculative heads** (Medusa, EAGLE) fold the drafter into the target model — extra decoding
  heads or feature-level drafting — so you avoid serving and aligning a separate draft model. Still
  lossless, still latency-only, but easier to operate and often higher-acceptance in-domain.
- **Quantization** buys **memory and compute cost** by storing weights (and sometimes activations) in
  lower precision (INT8, INT4). It is **lossy**: rounding perturbs the model, so it needs a task eval,
  not a vibe check.
- **Distillation** buys a **permanently smaller model** by training a student to mimic a teacher
  (Hinton et al., 2015). It is lossy and **upfront** — a training project, not a config flag — and the
  student freezes what it learned at training time.
- **Composition.** The levers attack different axes, so they stack: a common frontier order is
  **distill → quantize → speculate**. Each stage compounds the win, but each also compounds the
  quality risk of every lossy stage before it.

## A tradeoff table for speculative-decoding-quant-distillation

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Speculative decoding (separate draft) | Lower latency, losslessly | Extra draft model to serve/align; win rides on acceptance rate | Latency-bound decode, cost is fine, quality untouchable |
| Self-speculative heads (Medusa/EAGLE) | Latency win without a separate draft model | Training/attaching heads; acceptance still domain-dependent | Latency-bound and you want one model to serve |
| Quantization (INT8/INT4) | Smaller footprint, cheaper compute, model fits | Quality drift; must be validated with a task eval | Memory/cost-bound; the model barely fits |
| Distillation (student model) | A permanently smaller, cheaper model | Upfront training cost; student freezes training-time knowledge | Cost-bound long-term, knowledge is stable |
| Distill → quantize → speculate | Compounded latency + cost + size wins | Compounded quality risk; more moving parts to eval | You are past single-lever wins and have an eval budget |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just add speculative decoding" to a cost problem — or "just
quantize" without naming the eval — is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold this subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** pick the *one* lever that matches the stated goal — speculative
  decoding for a latency SLO, quantization for a footprint problem — validate any lossy change with a
  task eval, and ship. A single well-matched lever is a perfectly good baseline.
- **SOTA (frontier, worth reaching for under real pressure):** **stack** the levers in the right order —
  distill to a smaller student, quantize it to fit, then speculate for latency — with self-speculative
  heads to avoid operating a separate draft model, and an eval gate between stages so each lossy step is
  measured before the next lands. The frontier is treating the stack as a *joint* latency/cost/quality
  problem and sustaining **high acceptance across domains**, not tuning one axis in isolation.
- **Antipattern (looks fine, fails in production):** reaching for the **wrong lever for the goal** —
  speculative decoding to fix a memory problem, or quantizing to "fix" a latency-bound decode;
  **distilling volatile knowledge** so the student goes stale the moment facts change (that is a
  retrieval problem); shipping **speculative decoding with poor acceptance** so you pay draft + verify
  overhead for a token or two; or applying any lossy lever **with no eval** and shipping silent quality
  regressions. Each of these passes a demo and degrades under real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Speculative speedup is acceptance-bound, not draft-speed-bound.** Effective speedup scales with the
  number of tokens accepted per verification pass. A draft that is fast but frequently rejected advances
  one or two tokens per expensive verify — the win collapses. Plan the speedup in *accepted tokens per
  verification*, not in "the draft is 10× smaller."
- **Acceptance is domain-dependent.** A draft matched to code may accept well there and poorly on prose.
  A single acceptance number from one workload does not generalize; the frontier open problem is
  **high acceptance across domains**, so measure per-workload.
- **Quantization error is real and non-linear in bit-width.** INT8 usually holds quality; INT4 can drop
  it sharply on reasoning-heavy or long-context tasks. The footprint win is roughly linear in bits, but
  the *quality* cost is not — which is exactly why it must be gated by a task eval, not perplexity alone.
- **Stacking compounds risk multiplicatively.** Distill (some quality loss) then quantize (more) then
  speculate (none) can be a large win, but the two lossy stages compound. Budget an eval *between*
  stages so you can attribute a regression to the lever that caused it.

## Reviewing a speculative-decoding-quant-distillation design

When you are handed an inference-optimization design to critique — in a review or an interview — walk
the same checklist:

1. **What goal are we actually chasing?** If the plan names a lever before naming latency vs.
   memory/cost vs. size, stop there — that is the wrong-lever antipattern in the making.
2. **Does the lever match the goal?** Speculative decoding on a memory problem, or quantization on a
   latency-bound decode, is an immediate flag.
3. **For speculative decoding: what is the acceptance rate, and on which workload?** No acceptance
   number, or one measured on a single domain, means the speedup claim is unbacked.
4. **For every lossy lever: where is the eval?** Quantization or distillation with no task eval — or a
   short-prompt smoke test standing in for a real one — is a silent-regression risk.
5. **If levers are stacked, is the order right and each stage measured?** Distill → quantize →
   speculate, with an eval gate between stages; no gate means you cannot attribute a regression.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy names a lever with no goal; a prototype matches one lever to the goal; a demo backs
it with an acceptance number or an eval; a production-ready design stacks the levers in the right order,
gates every lossy stage behind a task eval, and reports acceptance across the domains it actually
serves.
