# Context engineering — selection & retrieval

## Selecting what enters the window

Given more candidate content than the budget can hold, **selection** (also called retrieval) decides
what actually enters the window. The core pattern is **rank-then-fit-to-budget**:

1. **Rank** every candidate chunk by **relevance** to the current query — typically an embedding
   similarity score, a retrieval score, or a reranker.
2. **Fit** the ranked list to the token budget: greedily admit the highest-scoring chunks while
   budget remains, then stop.
3. **Drop or compress** everything that did not fit — summarize it, or leave it out — rather than
   forcing it in.

Selection combines two constraints at once: *relevance* (rank) and *accounting* (does it still fit?).
A chunk enters the window only if it is both relevant enough and small enough for the space left. This
is the disciplined alternative to returning "as many chunks as the store gives back."

## Ordering and reuse

Selection is not finished once you have chosen the chunks — how you lay them out matters too.

- **Order for position effects.** From the position lesson, the window's edges are used best, so place
  the top-ranked chunks near the **start or the end**, not buried in the middle.
- **Keep a stable prefix, vary the suffix.** Put fixed content (system prompt, standing instructions)
  in a **stable prefix** and the per-request retrieved content in the **variable suffix**. A stable
  prefix can be reused by **prompt caching**, cutting cost and latency across calls.
- **Leave headroom.** Do not spend the entire budget on retrieval; reserve tokens for the model's
  reasoning and output.

Put together, selection is: rank by relevance, fit to budget, order for position, and structure for
caching. That is how you assemble a bounded, high-signal context instead of a long, diluted one.
