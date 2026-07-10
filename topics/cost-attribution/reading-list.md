# Reading list & staying current — cost-attribution

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **FrugalGPT — Chen et al. (2023).** The paper that made LLM *cost* a first-class engineering target via
  cascades (cheap model first, escalate on low confidence). Notice the framing: quality-per-dollar, not
  quality alone — the same lens that makes per-model cost the wrong granularity for attribution.
- **FinOps-for-LLM practice.** The operating model behind SOTA attribution: tag, attribute, optimize
  *continuously* rather than read one monthly invoice. Notice it treats cost as a live signal owned by
  engineering, which is why tags must propagate through the call graph, not sit on the bill.

## Go deeper (mechanism & unit economics)
- **Tagged attribution (feature / workflow / tenant).** The load-bearing technique: attach a dimension you
  can *act* on to every billed call and roll tokens up to it. Notice the failure mode — a broken tag through
  an async job or retry lands spend in the unattributed bucket instead of on the feature that caused it.
- **Cost-per-successful-task unit economics.** The metric that replaces cost-per-token. Notice the
  denominator is *successes*, not attempts: retries, abandonment, and over-retrieval are hidden costs the
  per-token view hides, and a zero-success feature exposes a divide-by-zero you must guard.

## Frontier — what to watch
- **Cost-per-successful-outcome vs. per-token unit economics.** The open question is pricing on business
  outcomes rather than raw tokens. Watch for teams that can defend a per-outcome number end-to-end, hidden
  costs included — that is where the frontier is moving.
- **Predicting per-feature cost before ship.** Still an open problem: estimating what a feature will cost in
  production before it exists. Notice this is forecasting, not accounting — watch for methods that survive
  contact with real traffic mixes.
- **Fair per-tenant / per-feature attribution at scale.** The hard open problem: allocating *shared*,
  *cached*, and *async* cost fairly across tenants and features. Notice there is no single correct policy —
  watch for allocation rules that are explicit and defensible, not silently baked into a cache key.

## Tools & implementations worth reading
- **Helicone, LiteLLM cost tracking, Langfuse cost, and custom aggregators.** The per-request cost-tracking
  stacks. Reading how each attaches metadata and rolls costs up is the fastest way to see why a
  group-by-feature aggregator with a cost-per-success guard is the unit of real code.

## How to stay current on this topic
- Follow the **Helicone / LiteLLM / Langfuse** repos and release notes — attribution and cost features land
  in code first.
- Track **FinOps Foundation** material and provider pricing/billing changes — the unit economics move when
  pricing does.
- When a new attribution or pricing idea appears, ask the three canon questions: *what dimension can you act
  on, what does the unit metric hide (retries/abandonment/shared cost), and does it survive shared/cached/
  async cost?* — the same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
