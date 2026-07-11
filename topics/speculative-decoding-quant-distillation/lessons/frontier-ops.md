# Inference optimization — the frontier and operating it in production

The deep-dive gave you the three levers and how to stack them. This lesson drills the two things that
separate someone who *knows* speculative decoding, quantization, and distillation from someone who
*runs* them at the frontier: where the research edge actually is, and the operational signals you watch
once the speedups are live.

## The speculative-decoding-quant-distillation frontier

Two research directions are where this topic is actually moving right now.

- **Self-speculative heads — folding the drafter into the target.** The first generation of speculative
  decoding (Leviathan et al. at Google, Chen et al. at DeepMind, 2023) needed a *separate* draft model
  to serve and keep aligned with the target. The frontier removed that. **Medusa** (Cai et al., 2024)
  attaches extra prediction heads to the target so it drafts several future tokens itself; **EAGLE**
  drafts from the target's own internal features. The shared move — the drafter is *part of* the target,
  not a standalone model — changes the acceptance-vs-cost math: there is no second model to serve or
  drift out of sync, and in-domain acceptance tends to be higher. The load-bearing point to carry: the
  open question here was "where does the draft come from," and self-speculative heads are the answer the
  field converged on.

- **High acceptance across domains, and combining levers without quality loss.** Speculative decoding's
  entire speedup is **acceptance-bound** — it scales with accepted tokens per verification pass, not
  with how small the drafter is — and acceptance is **domain-dependent**: a drafter that accepts well on
  code may accept poorly on prose or long-tail reasoning. So the live open problem is holding acceptance
  *up across domains*, because a single acceptance number from one workload does not generalize. The
  second frontier thread is **combining the levers** — the common order is **distill → quantize →
  speculate** — so you compound a smaller model, cheaper memory, and lower latency *without* compounding
  degradation. The frontier discipline is eval-gated stacking: each lossy stage (distill, quantize) is
  proven behind a task eval before the next lands, so a regression can be attributed to the stage that
  caused it.

The reason to track this line specifically: both directions attack the same economics from different
angles — *make the draft cheaper and higher-acceptance* (self-speculative heads) vs. *stack the levers
without paying compounding quality* (eval-gated composition). And the anchor an expert never lets go of:
**speculative decoding is lossless** — the accepted output is exactly what the target would have produced
alone — while distillation and quantization are lossy. Stacking never changes that: the speculate stage
adds latency wins at zero quality cost; only the distill and quantize stages spend quality.

## Operating these speedups in production

When these levers are live, you don't watch "speculative decoding" — you watch a handful of signals that
tell you whether the speedup is real and whether it is holding.

- **Draft acceptance rate.** The headline gauge for speculative decoding. It is the fraction of drafted
  tokens the target verifies and accepts. A falling acceptance rate — often because traffic shifted to a
  domain the drafter is weak on — is the leading indicator that your speedup is evaporating, and it moves
  *before* wall-clock latency looks bad on aggregate.
- **Accepted tokens per verification step.** Acceptance rate times draft length: how many tokens you
  advance per expensive target pass. This is the number the speedup actually scales with — plan and
  monitor in *accepted tokens per step*, not in "the draft is 10× smaller."
- **Wall-clock speedup vs. quality delta.** The two must be read together. A speculative-only change
  should show wall-clock speedup with a **zero** quality delta (it is lossless); any measured quality
  change means a bug or a *lossy* verification relaxation crept in. For the lossy levers (quantize,
  distill), the quality delta from the task eval is the gate — a footprint win with an unmeasured quality
  delta is a silent regression waiting to ship.
- **Throughput under load.** Speculative decoding trades extra compute (verifying drafts, including
  rejected ones) for latency. Under high load that extra verify work competes for the same GPU, so the
  per-request latency win can shrink or even invert as batch pressure rises. Watch throughput and tail
  latency *at the offered load you actually serve*, not on a single idle request.

The operational discipline: alert on **acceptance rate** (the leading indicator that a speculative
speedup is decaying), read **wall-clock speedup only alongside its quality delta** (zero for the lossless
lever, eval-gated for the lossy ones), and measure **throughput under real load** rather than trusting a
single-request latency number — because the acceptance economics change once the batch fills up.
