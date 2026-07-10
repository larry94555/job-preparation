/**
 * Lossless draft-and-verify emit step for speculative decoding.
 *
 * `draft` is the drafter's proposed tokens. `target(i)` returns the target
 * model's true token at position `i` (the ground truth the output must match).
 *
 * Verify the draft left to right against the target:
 *   - Accept the longest leading run where `draft[i] === target(i)`. Call that
 *     accepted length `m` (0 if the very first token already disagrees).
 *   - Emit the `m` accepted tokens PLUS exactly one correction/bonus token
 *     `target(m)` — the target's token at the first mismatch, or the next token
 *     if the whole draft was accepted.
 *   - Return the emitted array (length `m + 1`).
 *
 * This is LOSSLESS: the output always equals what the target alone would have
 * produced for those `m + 1` positions.
 */
export function speculate(draft: string[], target: (i: number) => string): string[] {
  let m = 0;
  while (m < draft.length && draft[m] === target(m)) m++;
  const out = draft.slice(0, m);
  out.push(target(m));
  return out;
}
