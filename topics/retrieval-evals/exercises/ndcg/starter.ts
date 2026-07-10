/**
 * Graded, position-discounted nDCG@k.
 *
 * `gains[i]` is the graded relevance of the result at rank `i` (0-based).
 *
 *   DCG@k  = sum over i in [0, min(k, gains.length)) of gains[i] / Math.log2(i + 2)
 *   IDCG@k = the same formula applied to `gains` sorted DESCENDING
 *
 * Return DCG@k / IDCG@k. If IDCG@k === 0, return 0.
 */
export function ndcgAtK(gains: number[], k: number): number {
  throw new Error("not implemented");
}
