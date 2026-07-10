/**
 * DEBUGGING EXERCISE — this eval gate is BROKEN.
 *
 * `passesGate` decides whether a batch of eval results clears a release gate.
 * The gate should pass only when the PASS RATE (passed / total) is at least
 * `threshold` — e.g. a 0.8 threshold means "at least 80% of cases must pass".
 *
 * Symptom reported in CI: the gate is green on every release, even the ones
 * where reviewers later find that many cases regressed and failed. A batch that
 * is clearly below the required pass rate still sails through the gate, so the
 * gate never catches a regression.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - a batch whose pass rate is below `threshold` FAILS the gate,
 *   - a batch whose pass rate is exactly `threshold` PASSES the gate,
 *   - an all-pass batch PASSES.
 *
 * Do NOT rewrite the function — make the minimal correct fix.
 */
export function passesGate(
  results: { passed: boolean }[],
  threshold: number,
): boolean {
  const passed = results.filter((r) => r.passed);
  // BUG: the pass rate is computed over the PASSED items only, so the
  // denominator excludes every failure. The rate is always ~1.0 and the gate
  // can never drop below the threshold — regressions slip straight through.
  const rate = passed.length / passed.length;
  return rate >= threshold;
}
