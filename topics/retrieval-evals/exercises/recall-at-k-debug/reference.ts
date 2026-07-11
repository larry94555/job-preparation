// Reference fix — recall@k divides by the number of RELEVANT docs, not by `k`,
// and guards the empty-relevant case to avoid dividing by zero. (Kept out of the
// repo's starter; used only to sandbox-verify the exercise.)
export function recallAtK(
  retrieved: string[],
  relevant: string[],
  k: number
): number {
  if (relevant.length === 0) return 0;
  const topK = retrieved.slice(0, k);
  const relevantSet = new Set(relevant);
  const hits = topK.filter((id) => relevantSet.has(id)).length;
  // Denominator is the total number of relevant docs, so the ratio stays in [0, 1].
  return hits / relevant.length;
}
