# Inference stack — the frontier and operating it in production

The deep-dive gave you the five lever families and the SLO-anchored way to compose them. This lesson
drills the two things that separate someone who *knows* the inference-stack tradeoff from someone who
*runs* it at the frontier: the research edge where the four axes are optimized *together*, and the
operational signals you watch when the stack is live.

## The inference-stack-tradeoffs frontier

The whole topic rests on one uncomfortable fact: the four axes — latency, throughput, cost, quality —
are **coupled**, so tuning any one lever in isolation silently taxes the others. The frontier is the
push to stop tuning one metric at a time and instead treat serving as a **joint multi-objective
optimization**.

- **Joint optimization over the whole Pareto frontier.** The open problem is optimizing
  latency/throughput/cost/quality *together* rather than one at a time. Continuous batching (**Orca**)
  buys throughput but lengthens the tail; quantization buys cost and memory but risks quality; a
  **FrugalGPT** cascade buys cost but stakes it on routing accuracy. Because each lever moves at least
  two axes, the frontier method is one that reasons about the *interaction effects* — how pulling one
  lever perturbs the others — instead of declaring a win on the single axis it was aimed at. The mental
  model to carry: you are not maximizing one number, you are choosing *where on the four-way frontier*
  to sit for a fixed SLO and hardware budget.

- **Predictable SLOs under load.** The second frontier direction is making the stack's behavior
  **stable as concurrency and interference climb** — a p99 that holds under pressure, not one that only
  looks good at idle. Best-effort tuning that passes a light-load benchmark routinely blows its tail
  once the batch fills, KV pressure rises, and prefill and decode contend for the same GPU. The
  frontier is **load-aware, SLO-anchored scheduling** — behavior you can *predict* under real traffic —
  rather than tuning against an idle baseline and hoping it survives contention.

The **roofline** model is the diagnostic that keeps this honest. Before you reach for any lever, ask
whether the workload is **compute-bound or memory-bandwidth-bound** — that answer tells you which levers
can move the needle *at all*. Adding compute to a memory-bandwidth-bound decode phase is effort spent on
an axis the workload isn't limited by. An expert uses the roofline to *select* the lever, then reasons
about what that lever costs on the other three axes.

Both directions attack the same failure — reasoning about one axis while an unmeasured one regresses.
Joint optimization refuses to declare a single-axis win; predictable-SLO work refuses to trust an
idle-load number. An expert can say which of the two a given stack should worry about first.

## Operating the inference stack in production

When the stack is live you don't watch "the tradeoff" — you watch a handful of signals that tell you
whether every SLO is being met and what each successful answer actually costs. The discipline is the
**eval + cost + observability triad**, read as a live dashboard rather than named as a stack.

- **Per-SLO attainment, not a single latency number.** Track TTFT, TPOT, and end-to-end p99 *each*
  against its own target, plus availability and the quality floor. A blended "average latency" hides
  exactly the tail and the phase-specific overrun the levers exist to fix. Attainment is per-SLO or it
  is meaningless.

- **Cost-per-successful-request.** The unit that actually moves is **cost per successful task**, not
  cost-per-model or cost-per-token. A **FrugalGPT** cascade routes most easy requests to a cheap model,
  so the spend follows *routed difficulty*, and failed or abandoned runs still cost money — counting
  them is what keeps the cost axis honest against the quality floor.

- **Headroom and utilization.** Sustained utilization near the ceiling means you're one traffic spike
  from blowing p99; chronically low means you over-provisioned. Because concurrency is **KV-bound**, a
  creeping average context length silently shrinks the batch and erodes headroom even at a constant
  request rate — so capacity-plan on utilization *and* context-length trend, not request count alone.

- **The eval + cost + observability triad as one dashboard.** Observability traces latency and errors,
  cost tracking rolls up spend per successful request, and a live eval watches the quality floor for the
  **silent regression** a latency graph will never show. Reading all three together is what lets you
  claim a lever improved the stack — a lever you can't measure across every axis is a lever you can't
  honestly claim improved anything.

The operational discipline: alert on **per-SLO attainment and the quality floor** (a regression on
either is the leading indicator), capacity-plan on **utilization and average context length**, and
never reason about serving health in a single blended number when the real currency is **all four axes
at once**.
