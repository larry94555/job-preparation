# Cost attribution — architecture, tradeoffs, and reviewing a design

You already know the cost drivers, why per-model totals are the wrong granularity, how tag
propagation attributes spend across dimensions, and why cost-per-successful-task is the honest unit
metric. This lesson zooms out to the **design space**: the levers an engineer actually pulls when
building a cost-attribution system, what each one trades away, and how to judge someone else's design
the way an interviewer or a staff engineer in a review would.

## The cost-attribution design space

Every cost-attribution decision is really a decision about **how faithfully every billed token rolls
up to a dimension the business can act on, and at what instrumentation and accuracy cost**. There are
five independent levers, and real systems combine them:

- **Attribution granularity** — cost per *model* vs. cost per *feature / workflow / tenant / user
  journey*. Per-model is one aggregate number that tells you *what* you spent but not *where* value or
  waste accrues. Attributing to business dimensions is the single biggest structural lever: it is the
  difference between "the bill went up" and "this feature's over-retrieval is half the bill."
- **Tag propagation** — set the attribution context **once at the entry point** and carry it through
  every downstream call (embeddings, retrieval, tools, generation, retries), vs. tagging only the
  top-level request. Propagation is what keeps the fan-out of a single user request from orphaning
  cost into an **unattributed** bucket.
- **Unit metric** — cost per API call vs. **cost per successful task**. Per-call flatters you because a
  single successful outcome often takes several calls, retries, and abandoned attempts; cost per
  successful task charges all that waste to the tasks that actually delivered value.
- **Cost lens for decisions** — **blended** average across all features vs. **marginal** cost a
  specific feature or change adds per task. Blended smears expensive and cheap work together and hides
  the ship/no-ship decision; marginal isolates the incremental spend a change causes.
- **Shared-cost handling** — how you attribute **cached, async, and pooled** work. A cache hit, a
  background job, or a shared system prompt serves many tenants; a design must decide whether that cost
  is dropped, dumped on one tenant, or fairly split.

## A tradeoff table for cost-attribution

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Cost-per-model dashboard | Trivial to build; matches the provider invoice | Tells you *what* not *where*; can't target a feature/tenant | A single-feature prototype where model *is* the workload |
| Tagged attribution (feature/workflow/tenant) | Cost rolls up to dimensions you can act on | Tag plumbing at every entry point; propagation discipline | Any multi-feature or multi-tenant product |
| Full tag propagation through async/retries | Nothing lands in an unattributed bucket | Context must thread through every downstream + background call | Fan-out pipelines, retries, and async jobs bill real money |
| Cost per successful task | Honest unit economics; retries/abandonment show up | Must define "success" and record failed/abandoned runs | Unit-economics and margin decisions, per-tenant pricing |
| Marginal cost per feature | Clean ship/no-ship signal for a new feature | Needs a baseline + isolation of the feature's incremental calls | Evaluating whether a new feature's value justifies its spend |
| Fair shared/cached/async allocation | Per-tenant billing that survives an audit | Allocation policy is genuinely hard; some judgment calls | Pooled work (shared prefixes, caches) crosses tenants |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just add a cost dashboard" without naming the granularity trap
and the propagation discipline is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** per-request cost tracking through a gateway or wrapper
  (Helicone, LiteLLM, Langfuse) that records tokens and price per call, tagged at least by feature and
  tenant, rolled up on a dashboard. This is a perfectly good baseline and covers most of the value.
- **SOTA (frontier, worth reaching for under real pressure):** tagged attribution across
  feature/workflow/tenant **with** propagation through retries and async work, **plus**
  cost-per-successful-task as the headline unit metric, **plus** marginal-cost analysis for new
  features, **plus** a defensible policy for allocating shared/cached/async cost — and, borrowing cloud
  **FinOps** discipline, treating spend as something you tag, attribute, and optimize continuously
  rather than read off one invoice. The frontier is treating cost as a *first-class product dimension*,
  not a monthly surprise.
- **Antipattern (looks fine, fails in production):** reporting **cost-per-model only**; **ignoring
  failed and abandoned runs** so the unit cost is understated; treating **over-retrieval / oversized
  context** as free because "chunks are cheap"; and letting **async or cached** work drop its tags into
  an unattributed bucket. Each passes a demo and then hides where the money actually goes under real
  traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Cost scales with tokens, not requests.** Input tokens (system prompt, retrieved context, tool
  schemas, history) plus output tokens times the model tier's price is the real driver — and a single
  "one request" becomes several billed calls once retrieval, tools, and retries are counted.
  Estimating from the happy-path prompt alone always undershoots.
- **Over-retrieval is a recurring tax.** Stuffing the context with more chunks than the task needs
  means paying for input tokens that add nothing, on **every** call. Doubling retrieved context roughly
  doubles the input-token bill for zero extra value — this is why oversized context is a top red flag.
- **Retries and abandonment multiply spend.** If one in five tasks retries once and one in ten is
  abandoned, per-call cost understates the true price of a delivered outcome by exactly that wasted
  spend. Cost per successful task amortizes it over real successes and surfaces the leak.
- **Attribution overhead is small; blind spots are expensive.** Tagging and recording every call adds
  negligible token cost, but the *coverage* is what matters: an untagged async job or a tenant-blind
  cache turns real spend invisible, and you optimize what you can't see by accident, not design.

## Reviewing a cost-attribution design

When you are handed a cost-attribution design to critique — in a review or an interview — walk the
same checklist:

1. **What granularity does it report?** If it stops at cost-per-model, stop there; leadership will have
   nowhere to aim when asked to cut spend.
2. **Does every call get tagged, and do tags propagate?** No propagation through retries and async work
   means an unattributed bucket that hides real money.
3. **What is the unit metric?** Cost per call flatters; cost per successful task, with failed and
   abandoned runs counted, is the honest number.
4. **Blended or marginal for decisions?** Judging a new feature on the blended average smears its real
   incremental cost — marginal is the ship/no-ship signal.
5. **How is shared/cached/async cost allocated?** A real design names its policy for pooled work and
   per-tenant fairness — never "it just averages out."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy reports per-model only; a prototype tags by feature; a demo attributes across
feature/tenant with a dashboard; a production-ready design also propagates tags through async/retries,
reports cost per successful task, uses marginal cost for feature decisions, and has a defensible
shared-cost allocation policy.
