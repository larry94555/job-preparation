# Build it: an SLO-aware config selector

## Filter first then rank

You have several candidate stack configurations, each with a `latency`, `cost`, and `quality`, and a
set of **SLOs**: `maxLatency`, `maxCost`, `minQuality`. Selecting the right config is a **two-step**
process, and the order is the whole point:

1. **Filter.** Keep only configs that meet **all three** SLOs (`latency <= maxLatency` **and**
   `cost <= maxCost` **and** `quality >= minQuality`). A config that violates *any* SLO is
   disqualified — no matter how good its other numbers look.
2. **Rank** the survivors and pick the best — e.g. highest `quality`, breaking ties by lowest `cost`,
   then lowest `latency`.

The classic mistake is to skip step 1 and pick by a blended "score." That will happily choose a
gorgeous-quality config that blows the latency budget — a config you can't actually ship.

## Why all three constraints

Latency, cost, and quality trade off against each other; an SLO is a **hard** floor or ceiling on
each. Meeting an SLO is a **gate, not a weighted score** — you do not average a latency violation away
with high quality. That's why filtering comes first: a violation isn't a small penalty, it's a
disqualification. Only once every candidate is *feasible* does it make sense to compare them, and if
**no** config is feasible the honest answer is `null` — you need to relax an SLO or improve the stack,
not pretend a violating config is fine.
