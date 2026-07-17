---
title: "What a call and a run actually cost"
order: 2
covers:
  - mc-track-spend
  - mc-output-token-cost
  - fe-token
---
## What a call and a run actually cost

**In brief.** Tokens are the currency of both the bill and the clock. Turning that into a real dollar
figure means knowing that input and output are metered separately, why output is the expensive side, and
that a run's cost is a sum over every call it makes.

**The mechanics.**

- **Input and output are priced separately** — providers almost always charge different rates for the two, and output usually costs more, because decoding tokens one at a time is more compute-intensive than ingesting the prompt. So a call is never one flat number and never a single blended price: you track both counts against both prices, or you cannot see where the money goes.
- **The cost of one call** — `in_tokens / 1000 * price_in_per_1k + out_tokens / 1000 * price_out_per_1k`. Two calls with an identical prompt do not cost the same if one asks for a much longer answer: output tokens are billed, and often at the higher rate.
- **The cost of a run** — that same figure summed over every call. This one number, cost per run, is what lets you attribute spend to a step, compare tiers, and justify a routing change with evidence instead of a hunch. Call count, wall-clock latency, and the model's parameter count all describe a run without pricing it.
- **Output drives the clock as well as the bill** — the model decodes autoregressively, one token per step, so a longer answer costs more money and more wall-clock time at once. Neither effect is a flat surcharge, and neither comes from re-reading the prompt.

**Why it matters.** Dollars come from tokens, not requests — pricing input and output separately and
summing across the run is what makes a cost claim measurable, and what turns a proposed routing or
trimming change into an evidence-backed decision.
