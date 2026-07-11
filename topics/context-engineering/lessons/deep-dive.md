# Context engineering — architecture, tradeoffs, and reviewing a design

You already know that the context window is a ranked token budget, that position matters ("lost in
the middle"), and that selection means rank-then-fit. This lesson zooms out to the **design space**:
the levers an engineer actually pulls when assembling context, what each one trades away, and how to
judge someone else's context pipeline the way an interviewer or a staff engineer in a design review
would.

## The context-engineering design space

Every context decision is really a decision about **which tokens earn a place in a fixed window, in
what order, so the model can actually use them**. There are five independent levers, and real
systems combine them:

- **Budget allocation** — how you carve the fixed window into slices: system prompt, retrieved
  evidence, conversation history, and reserved headroom for reasoning and output. The window is a
  cap; over-spend one slice and you starve another. Spending the whole budget on retrieval leaves no
  room for the model to think.
- **Selection / retrieval** — how candidates get ranked and admitted. Embedding similarity, a
  retrieval score, or a reranker orders the candidates; you greedily admit the top ones while budget
  remains. The alternative — returning "as many chunks as the store gives back" — is unranked
  concatenation.
- **Position / ordering** — where admitted content lands. Retrieval accuracy over position is roughly
  U-shaped (primacy and recency strong, the middle weak), so ordering is a lever, not an
  afterthought. The most important evidence belongs near the **start** or the **very end**.
- **Compaction** — what you do with content that is relevant but does not fit: **summarize** it, or
  **drop** it, rather than force it in. Compaction is what lets long histories survive without
  crowding out fresh signal, at the cost of lossy summaries.
- **Structure / reuse** — a **stable prefix** (system prompt, standing instructions) with the
  per-request content in a **variable suffix**. A stable prefix can be reused by **prompt caching**,
  turning a per-call cost into a shared one.

## A tradeoff table for context-engineering

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Dump-everything / unranked concat | Trivial to build, nothing to rank | Dilution (context rot), high cost/latency, mid-context facts go unused | Never in production; only a throwaway prototype |
| Rank-then-fit-to-budget | High-signal window, bounded cost, dropped noise | Needs a scorer/reranker and token accounting | Any pipeline with more candidates than budget |
| Deliberate ordering (edges) | Recovers "lost in the middle" facts for free at serve time | Ordering logic; must re-order as history grows | Long contexts where key evidence would sink to the middle |
| Compaction (summarize/drop) | Fits long histories, reclaims budget | Lossy — summaries can drop the detail the task needed | History or candidates exceed the budget |
| Stable prefix + variable suffix | Prompt-cache reuse cuts cost and latency | Bookkeeping to keep the prefix truly stable | Fixed system prompt reused across many calls |

The table is the interview answer in miniature: **name the lever, name what it costs, name the
regime where it wins.** A candidate who says "just retrieve more chunks" without naming dilution, the
token accounting, or the position effect is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** rank candidates by embedding similarity, fit the top ones to
  a token budget, put the most important near the edges, and keep a stable system prefix. This is
  what a default LangChain / LlamaIndex context builder gives you and it is a perfectly good
  baseline.
- **SOTA (frontier, worth reaching for under real pressure):** the common baseline **plus** a
  reranker over the initial candidates, **plus** a **retrieval + compaction pipeline** that
  summarizes overflow and older history instead of dropping it, **plus** measuring **effective**
  (not advertised) context with a long-context eval so you know the window is actually usable. The
  frontier is treating the window as a ranked budget you continuously curate, not a bucket you fill
  once.
- **Antipattern (looks fine, fails in production):** **dump-everything** prompts that concatenate
  every document and hope the model sorts it out; ignoring **context rot** as stale, low-value
  content crowds out signal; dropping the most important fact into the **middle** of a large
  concatenation where it is effectively invisible; and trusting the **advertised** context length as
  if it were the effective one. Each passes a demo and degrades quietly under real, long traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **More context plateaus, then reverses.** Adding marginally-relevant tokens buys a little recall
  but pays dilution, cost, and latency. Past a point, extra tokens *lower* task quality — so
  throughput and quality planning must be done in *useful* tokens, not raw window size.
- **Cost and latency scale with tokens spent.** You pay per token and longer inputs process slower,
  so padding the window raises the bill and slows every call. Token **accounting** — knowing what
  each candidate costs and what remains — is the core discipline.
- **Position is a free multiplier on the same tokens.** The identical evidence retrieves far more
  reliably at the edges than in the middle. Re-ordering costs nothing at inference time yet recovers
  facts a naive concatenation would waste.
- **Prefix reuse scales with prompt sharing.** If a 2,000-token system prompt is reused across a
  thousand calls, a stable prefix lets prompt caching pay it effectively once instead of a thousand
  times — the same logic as prefix sharing in serving, applied to context assembly.

## Reviewing a context-engineering design

When you are handed a context pipeline to critique — in a review or an interview — walk the same
checklist:

1. **Is the window treated as a ranked budget?** If content is concatenated unranked "to be safe,"
   stop there; it will dilute and rot.
2. **Where does the budget accounting live?** A design with no token accounting — no notion of what
   fits and what gets dropped — has no real budget.
3. **Is position handled?** No deliberate ordering means the most important fact can sink into the
   middle and go unused, even though it is present.
4. **What happens to overflow?** A real design names its policy — compress, drop, or re-surface —
   never "it all just fits."
5. **Advertised vs. effective context?** A design that trusts the advertised window without measuring
   effective context (needle-in-a-haystack, RULER) is claiming capacity it has not verified.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy dumps everything; a prototype ranks and fits to a budget; a demo also orders
for position; a production-ready design compacts overflow deliberately, reuses a stable prefix for
caching, and has measured its effective context rather than trusting the number on the box.
