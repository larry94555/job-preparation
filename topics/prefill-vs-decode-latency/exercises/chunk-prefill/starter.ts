/**
 * Chunked-prefill scheduling.
 *
 * Split a prompt of `promptTokens` into consecutive prefill chunks of at most
 * `chunkSize` tokens each, so no single prefill step monopolizes the GPU
 * (Sarathi-style interleaving). Return the array of chunk sizes.
 *
 * Invariants (assume promptTokens >= 0 and chunkSize > 0):
 *   - the chunks sum to promptTokens
 *   - every element is <= chunkSize
 *   - only the LAST element may be smaller (the remainder); all earlier chunks
 *     are exactly chunkSize
 *   - promptTokens === 0 → []
 *
 * E.g. planChunks(2500, 1000) → [1000, 1000, 500]
 *      planChunks(1000, 1000) → [1000]
 *      planChunks(0, 1000)    → []
 */
export function planChunks(promptTokens: number, chunkSize: number): number[] {
  throw new Error("not implemented");
}
