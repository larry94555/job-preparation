/**
 * Per-claim grounding check: is a claim supported by the retrieved sources?
 *
 * A grounding/faithfulness eval is per-claim: an answer is grounded only if each
 * of its claims is entailed by some retrieved source. This is a deliberately
 * literal substring version of that check.
 *
 * Normalize the claim and each source by:
 *   - lowercasing,
 *   - trimming leading/trailing whitespace,
 *   - collapsing every run of internal whitespace to a single space.
 *
 * Return `true` iff the normalized claim appears as a substring of ANY normalized
 * source (supported), else `false` (fabricated / unsupported). Empty `sources`
 * → false.
 */
export function isGrounded(claim: string, sources: string[]): boolean {
  throw new Error("not implemented");
}
