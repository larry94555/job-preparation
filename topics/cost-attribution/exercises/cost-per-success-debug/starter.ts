/**
 * DEBUGGING EXERCISE — this cost metric is BROKEN.
 *
 * `costPerSuccess` is supposed to report the TRUE unit economics: the total
 * dollars spent across every attempt, divided by the number of calls that
 * actually SUCCEEDED. That charges the cost of failures and retries to the
 * outcomes they were spent chasing.
 *
 * Symptom reported by finance: whenever a workload has failed or retried
 * attempts, the reported cost-per-success comes out too LOW — it flatters the
 * feature and understates what a delivered success really costs. On an
 * all-successful workload the number looks fine, which is why it shipped.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - the denominator is the number of SUCCESSFUL calls, not every attempt,
 *   - a workload with failures reports a higher (honest) cost-per-success,
 *   - a workload with zero successes is handled deliberately (see below).
 *
 * When there are zero successful calls the true cost-per-success is undefined;
 * return Infinity as a documented sentinel rather than dividing by zero.
 *
 * Do NOT rewrite the function — make the minimal correct fix.
 */
export function costPerSuccess(
  calls: { costUsd: number; success: boolean }[]
): number {
  const totalCost = calls.reduce((sum, c) => sum + c.costUsd, 0);
  // BUG: divides total spend by ALL attempts (calls.length) instead of by the
  // number of SUCCESSFUL calls, so failed/retried attempts drag the reported
  // cost-per-success below its true value.
  return totalCost / calls.length;
}
