/**
 * Number of tokens produced in one speculative-decoding verification step.
 *
 * TODO: count the leading `true` values in draftMatches, stopping at the first `false`, then add 1
 * for the token the target always emits.
 *   [true, true, false] → 3
 *   [false, ...]        → 1
 *   [true, true, true]  → 4
 *   []                  → 1
 */
export function acceptedTokens(draftMatches: boolean[]): number {
  throw new Error("not implemented");
}
