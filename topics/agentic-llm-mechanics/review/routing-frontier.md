---
title: "The routing frontier: learned routers and cascades"
order: 3
covers:
  - mc-router-cost
  - frontier-routing
---
## The routing frontier: learned routers and cascades

**In brief.** The hand-written mapping — task `classify` goes to the cheap tier — is the solid ground.
The frontier is where a static rule stops being enough and the routing decision itself becomes a
learned, evaluated component.

**Where the edge is.**

- **Learned routers** — a small classifier trained to predict which tier can handle a request. It generalizes past the task names you hard-coded, but it is now a model in its own right: it must be trained, calibrated, and evaluated, and it can misroute, sending a hard task to a tier too weak for it. That is why it is not automatically better than a one-line rule — the static rule is simple and predictable, the learned one buys coverage by taking on new failure modes.
- **Model cascades** — try the cheapest tier first; keep the answer if it clears a quality check, otherwise escalate to a stronger tier. This is the pattern popularized by **FrugalGPT** (Chen et al., 2023): a cascade plus a scoring step that decides whether the cheap answer is good enough. It captures most of the savings while protecting quality on the hard tail.
- **Confidence-based escalation** — use a confidence signal (self-consistency, a verifier model, or a calibrated score) to decide when to spend on the expensive tier, rather than routing blindly up front.
- **The honest read** — this is a real cost-versus-quality lever, not a solved problem. The router or verifier is itself fallible, so you evaluate it like any other model. Neither "send everything to the biggest model, it is cheapest and best" nor "routing is only a latency problem a faster network solves" nor "tiers no longer differ, so stop routing" survives contact with the tradeoff.

**Why it matters.** It is the same cost-versus-quality tradeoff the routing roadmap is built on, pushed
to where the decision is learned and measured instead of assumed — and being able to name what it costs
you, a new fallible component to train, calibrate, and evaluate, is what separates a frontier-aware
answer from hype.
