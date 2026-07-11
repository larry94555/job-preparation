/**
 * DEBUGGING EXERCISE — this Reciprocal Rank Fusion is BROKEN.
 *
 * Context: our hybrid retriever runs a dense search and a BM25 search, then
 * fuses their ranked id lists with Reciprocal Rank Fusion (RRF). RRF is supposed
 * to score each id by the sum over lists of 1/(k + rank), with rank counted from
 * 1 and k a smoothing constant (default 60). Higher score = better; ids come back
 * sorted by descending score.
 *
 * Symptom reported in production: the fused ranking is wrong. An id that both
 * retrievers rank near the top ends up BELOW an id that only one list ranked #1,
 * and debugging shows some scores come out as `Infinity`, so ordering is nonsense
 * whenever a list's first element is involved.
 *
 * There is exactly ONE bug in reciprocalRankFusion(). Find it and fix it so that:
 *   - no score is ever Infinity or NaN,
 *   - an id broadly agreed across lists outranks a single-list top hit,
 *   - the smoothing constant k actually dampens the top ranks.
 *
 * Do NOT rewrite the function — make the minimal correct fix.
 */
export function reciprocalRankFusion(rankings: string[][], k = 60): string[] {
  const scores = new Map<string, number>();

  for (const list of rankings) {
    for (let rank = 0; rank < list.length; rank++) {
      const id = list[rank];
      // BUG: this drops the k smoothing constant AND uses a 0-based rank, so the
      // #1 item in every list divides by zero and scores Infinity.
      const contribution = 1 / rank;
      scores.set(id, (scores.get(id) ?? 0) + contribution);
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}
