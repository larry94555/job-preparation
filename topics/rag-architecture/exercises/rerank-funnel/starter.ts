/**
 * Cross-encoder rerank funnel over a first-stage candidate set.
 *
 * A retriever hands you `candidates`, each with a cheap first-stage `score`.
 * A rerank model is expensive, so you only run it on a shortlist:
 *
 * TODO:
 *   1. Take the top `k` candidates by first-stage `score` DESCENDING (if fewer
 *      than k candidates exist, use all of them).
 *   2. Apply the expensive `rerank(id)` scoring function to ONLY those k.
 *   3. Return their ids sorted by rerank score DESCENDING.
 *
 * Do NOT rerank candidates outside the top-k: a candidate with a low first-stage
 * score never reaches the reranker even if it would have scored highly.
 */
export function rerankFunnel(
  candidates: { id: string; score: number }[],
  k: number,
  rerank: (id: string) => number,
): string[] {
  throw new Error("not implemented");
}
