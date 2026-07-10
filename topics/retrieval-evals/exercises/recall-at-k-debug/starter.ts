/**
 * DEBUGGING EXERCISE — this recall@k metric is BROKEN.
 *
 * `recallAtK(retrieved, relevant, k)` is supposed to answer: of all the relevant
 * documents, what fraction show up in the top-k retrieved results? So it should
 * be |relevant ∩ top-k retrieved| / |relevant|.
 *
 * Symptom reported in the eval dashboard: the recall numbers only look right when
 * k happens to equal the number of relevant docs. As soon as k differs — a big k
 * to be generous, or a small k — the score is wrong, and with a large k it can even
 * report recall GREATER THAN 1, which is impossible for a fraction of a fixed set.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - recall is (# relevant ids found in the top-k) / (total relevant),
 *   - the score never exceeds 1 regardless of how large k is,
 *   - an empty relevant set returns 0 (no division by zero).
 *
 * Do NOT rewrite the function — make the minimal correct fix.
 */
export function recallAtK(
  retrieved: string[],
  relevant: string[],
  k: number
): number {
  const topK = retrieved.slice(0, k);
  const relevantSet = new Set(relevant);
  const hits = topK.filter((id) => relevantSet.has(id)).length;
  // BUG: dividing the hit count by `k` instead of by the number of relevant docs.
  // When k differs from relevant.length the ratio is wrong, and a large k can push
  // the "recall" above 1.
  return hits / k;
}
