/**
 * Layered cache lookup: an exact (lossless) map in front of a guarded semantic layer.
 *
 * `layeredGet(key, vec, exact, semantic, threshold)`:
 *   1. LOSSLESS PATH FIRST: if `exact` has `key`, return { value, source: "exact" }
 *      immediately — do not consult the semantic layer, even if a closer semantic
 *      entry exists. The exact hit is byte-identical and always wins.
 *   2. Otherwise, compute COSINE similarity between `vec` and each semantic entry's
 *      `vec`, take the best, and if best similarity >= threshold return
 *      { value, source: "semantic" }.
 *   3. If nothing meets the threshold, return null (a miss).
 *
 * Implement cosine similarity in this module.
 */
export function layeredGet(
  key: string,
  vec: number[],
  exact: Map<string, string>,
  semantic: { vec: number[]; value: string }[],
  threshold: number,
): { value: string; source: "exact" | "semantic" } | null {
  throw new Error("not implemented");
}
