---
title: "Keeping the tail visible — aggregates and sampling"
order: 2
covers:
  - mc-p99-vs-avg
  - mc-sampling-scale
  - frontier-sampling
---
## Keeping the tail visible — aggregates and sampling

**In brief.** The metric you compute and the traces you keep both decide what you are able to see, and
both fail in the same way: an average and a uniform sample each discard the rare bad run — which is the
only run you needed.

**The two ways the tail disappears.**

- **The aggregate you pick** — every metric is a roll-up over span attributes, and the roll-up you choose either exposes the outlier or averages it away. A sum over a window is right for cost. For latency the mean lies: a few very slow requests are hidden by many fast ones, so the mean can sit perfectly still while the tail balloons. Two deployments can share a mean and differ several-fold at p99.
- **Why the tail is what counts** — users feel the run that hangs, not the average run. That is why latency is watched as a percentile (p95, p99) rather than a mean, and why cutting the mean can leave the same users complaining about the same multi-second hangs.
- **Sampling at scale** — many concurrent agents over long horizons emit more spans than anyone can store or read, so you keep only a subset. Which subset is the whole question.
- **Why uniform sampling is the wrong subset** — it keeps traces in proportion to how often they occur, so the one-in-a-thousand failing trajectory — a low-frequency event by definition — is usually the one thrown away. That is the opposite of what observability is for.
- **Error-biased and tail-aware sampling** — keep every error, sample the rest. This is the direction the open work points, alongside propagating trace context across sub-agent boundaries and keeping the signal affordable. It is not settled, and it is not addressed by recording fewer attributes per span: that changes what each kept trace holds, not which whole traces you keep.

**Why it matters.** Both moves are one discipline — pick the aggregate and the sample that preserve the
outlier. Average it away or sample it away and the incident is invisible behind a dashboard that looks
perfectly healthy.
