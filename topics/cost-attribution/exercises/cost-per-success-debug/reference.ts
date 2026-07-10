// Reference fix — the denominator becomes the count of SUCCESSFUL calls, not
// calls.length, and zero successes returns Infinity as a documented sentinel
// instead of dividing by zero. (Kept out of the repo's starter; used only to
// sandbox-verify the exercise.)
export function costPerSuccess(
  calls: { costUsd: number; success: boolean }[]
): number {
  const totalCost = calls.reduce((sum, c) => sum + c.costUsd, 0);
  const successes = calls.filter((c) => c.success).length;
  if (successes === 0) return Infinity; // cost-per-success is undefined with no successes
  return totalCost / successes;
}
