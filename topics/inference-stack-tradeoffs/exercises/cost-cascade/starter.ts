/**
 * FrugalGPT-style cost/quality cascade.
 *
 * `tiers` are candidate models in cheap→strong order. Run them in order,
 * accumulating each tier's `cost` as you go. STOP at the first tier whose
 * `confidence >= threshold` and return that tier's `name` with `totalCost`
 * equal to the cumulative cost through (and including) that tier.
 *
 * If NO tier reaches the threshold, fall back to the LAST tier: return its
 * `name` with `totalCost` equal to the sum of ALL tiers' costs (you paid to
 * run the whole cascade).
 *
 * This mirrors a cost/quality cascade: most requests are answered cheaply, and
 * spend follows the difficulty of the request as it escalates.
 */
export interface Tier {
  name: string;
  cost: number;
  confidence: number;
}

export function runCascade(tiers: Tier[], threshold: number): { name: string; totalCost: number } {
  throw new Error("not implemented");
}
