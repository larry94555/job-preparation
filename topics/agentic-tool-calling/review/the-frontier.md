---
title: "The frontier — long tool chains and scale"
order: 3
covers:
  - frontier-multitool
  - frontier-reliability-at-scale
---
## The frontier — long tool chains and scale

**In brief.** The tool loop, typed schemas, structured outputs, and recovery are the solid ground. The
frontier is where they stop being sufficient — where agents call **many** tools over long horizons, at
scale, and reliability becomes the hard, unsolved part.

**The open problems.**

- **Reliable multi-tool orchestration** — a frontier agent chains many tools per task and the failure
  rate compounds: each step can go slightly wrong, and by the tenth tool the sequence has drifted. The
  defining property is that orchestration failures are **silent and compound** — no single call throws,
  yet the end state is wrong. Keeping a long tool sequence correct as it grows is an open problem, not a
  solved one.
- **Robust argument grounding** — a typed schema checks that an argument has the right **shape**; it
  cannot check that the value is grounded in **real** state rather than a plausible hallucination. The
  model can emit a well-typed `order_id` that never existed. Tying each argument to reality, not just to
  the schema, is why typed contracts are **necessary but not sufficient** — and why validate-and-reject
  exists at all.
- **Reliability at scale** — running these loops across many tools, many turns, and many concurrent
  agents surfaces the distributed-systems edges: partial failures, retries that **double-apply** a side
  effect, and orchestration that has to stay correct under load. A single validated call is no longer
  the whole story, and agents do not run in perfect isolation with no shared effects.
- **The honest read** — larger schemas, more hardware, an automatic retry around every call, or a faster
  model do not close these gaps. They are the active research edge. The expert move is to say which of
  them a given agent system should invest in first, without claiming any of them is solved.

**Why it matters.** This frontier attacks the same trust gap the whole topic is built on — **the model
is an untrusted caller** — but at the scale where one validated call no longer covers it, so answering
"is this solved?" with a confident yes is the tell that you have not run agents at length.
