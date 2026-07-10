/**
 * Simulate continuous (in-flight) batching and return the makespan (step count).
 *
 * TODO:
 *   - lengths[i] = output tokens for request i; all are available at the start.
 *   - Keep an active set of at most batchSize requests (fill it from the waiting queue, in order).
 *   - Each step: every active request emits one token (remaining--). Requests at 0 finish and free
 *     their slot. Then refill the active set from the waiting queue up to batchSize.
 *   - Return the step at which the last request finishes.
 */
export function continuousBatchMakespan(lengths: number[], batchSize: number): number {
  throw new Error("not implemented");
}
