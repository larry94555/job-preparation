/**
 * Cross-encoder rerank funnel over a first-stage candidate set.
 *
 * Take the top `k` candidates by first-stage `score` DESC, apply the expensive
 * `rerank` scoring function to ONLY those k, and return their ids sorted by
 * rerank score DESC. Candidates outside the top-k are never reranked.
 */
export function rerankFunnel(
  candidates: { id: string; score: number }[],
  k: number,
  rerank: (id: string) => number,
): string[] {
  const shortlist = [...candidates]
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
  return shortlist
    .map((c) => ({ id: c.id, r: rerank(c.id) }))
    .sort((a, b) => b.r - a.r)
    .map((c) => c.id);
}
