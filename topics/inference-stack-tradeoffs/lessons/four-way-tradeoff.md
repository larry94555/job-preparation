# Inference-stack tradeoffs — the four-way tradeoff

## The four axes and no free lunch

An inference stack is not tuned along one dimension. Every serving decision moves you along **four
axes at once**:

- **Latency** — how fast a request returns (TTFT, TPOT, and the tail — p99, not just the mean).
- **Quality** — how good the outputs are, measured by your evals.
- **Cost** — dollars per request or per token, driven by hardware utilization.
- **Reliability** — availability and how gracefully the system degrades under load or failure.

The integrative truth of the stack is that there is **no free lunch**: almost every lever that
improves one axis costs you on at least one other. Bigger batches raise throughput but push latency
up; quantization cuts cost but risks quality; a fallback path buys reliability but adds cost. Gains
are **traded, not created**.

The picture to hold in your head is a **Pareto frontier**: a set of configurations where you cannot
improve one axis without giving up another. Real work is choosing a point on that frontier, not
escaping it.

## Why single-metric optimization fails

The classic **antipattern** is optimizing a **single metric** in isolation. Minimize cost alone and
you may pick the cheapest config that quietly misses the latency SLO or degrades quality. Minimize
latency alone and cost explodes. Because the axes are coupled, a config chosen to win one number
almost always pushes an **unmeasured** axis past its limit.

Two more traps follow from the same reasoning:

- **"Free lunch" claims** — "this just makes serving faster and cheaper" — are a smell. Ask what it
  gives up; there is almost always a hidden axis paying for the win.
- **Reliability as an afterthought** — availability and graceful degradation are a first-class axis,
  not something bolted on at the end for free.

The right frame is **multi-objective**: optimize jointly against all your constraints, and reason
explicitly about a change's effect on **all four** axes before you ship it.
