/**
 * Cohen's kappa for two binary raters (judge vs. human) over paired judgments.
 *
 * `a` and `b` are equal-length arrays of boolean verdicts on the same items:
 * a[i] and b[i] are the two raters' calls on item i. Kappa measures agreement
 * *corrected for chance* — the honest number behind "calibrated LLM-as-judge".
 *
 * Compute:
 *   - po = fraction of indices where a[i] === b[i]  (observed agreement)
 *   - pTrue  = (fraction of a that is true)  * (fraction of b that is true)
 *   - pFalse = (fraction of a that is false) * (fraction of b that is false)
 *   - pe = pTrue + pFalse                            (chance agreement)
 *   - return (po - pe) / (1 - pe); if pe === 1, return 1.
 *
 * Assume a.length === b.length > 0.
 */
export function cohenKappa(a: boolean[], b: boolean[]): number {
  throw new Error("not implemented");
}
