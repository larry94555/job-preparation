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

## Reception & what aged
- **FrugalGPT's framing — quality-per-dollar via cascades — aged into standard practice; its exact numbers are
  period pieces.** The paper (Chen, Zaharia & Zou, Stanford, 2023) reported matching GPT-4 at up to ~98% cost
  reduction on its benchmarks. That headline was model- and price-specific and shouldn't be quoted as a general
  law, but the *idea* — route cheap-first, escalate on low confidence, measure cost as a first-class target —
  became the default lens for LLM cost engineering.
- **The cascade pattern generalized and kept being reinvented.** Later work (calibrated model cascades, task
  cascades for unstructured data) confirms the direction rather than overturning it; FrugalGPT reads as the
  origin point, not the last word.
- **Provider prompt/prefix caching turned "tag and attribute" into a harder, more valuable problem.** Cached
  reads now bill at ~10% of input on flagship models, and real deployments report 59–70% cost cuts from raising
  cache-hit rates — which is exactly why attributing *shared and cached* cost fairly (a canon open problem) got
  more urgent, not less: the cheap tokens still belong to *some* feature.
- **Cost-per-successful-task over cost-per-token held up as the honest unit; per-model cost aged out.** The
  argument that retries, abandonment, and over-retrieval hide in a per-token view is now conventional FinOps-for-
  LLM wisdom, and the divide-by-zero on zero-success features remains a real guard to implement.
- **Predicting per-feature cost before ship stayed genuinely open.** It is still forecasting against unknown
  traffic mixes, not accounting — the canon's "open problem" label held.
- **Sources:** [FrugalGPT (arXiv:2305.05176)](https://arxiv.org/abs/2305.05176);
  [stanford-futuredata/FrugalGPT](https://github.com/stanford-futuredata/FrugalGPT);
  [Prompt Caching with OpenAI, Anthropic, and Google (PromptHub)](https://www.prompthub.us/blog/prompt-caching-with-openai-anthropic-and-google-models).
