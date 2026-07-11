/**
 * Fuse several ranked id-lists into one via Reciprocal Rank Fusion.
 *
 * TODO:
 *   For every list, a document at 1-based rank r adds 1/(k + r) to its total score.
 *   Sum across all lists (an id present in only some lists still scores from those).
 *   Return ids sorted by total score DESCENDING, breaking ties by id ASCENDING.
 */
export function reciprocalRankFusion(rankings: string[][], k = 60): string[] {
  throw new Error("not implemented");
}
