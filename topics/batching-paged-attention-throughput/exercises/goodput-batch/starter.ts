/**
 * SLO-aware (goodput) batch admission: size the running batch to the latency knee.
 *
 * A goodput scheduler does not just batch as much as it can — it sizes the batch so the
 * work still completes within the latency SLO. A batch of `n` items spends `n * msPerItem`
 * ms, so the SLO caps the batch at `floor(targetLatencyMs / msPerItem)` items.
 *
 * Return the largest batch that satisfies every constraint:
 *   - `waiting`  — you cannot batch more than are queued.
 *   - `maxBatch` — the hard batch-size cap.
 *   - the SLO cap `floor(targetLatencyMs / msPerItem)` — the latency knee.
 * i.e. `min(waiting, maxBatch, floor(targetLatencyMs / msPerItem))`, never negative (min 0).
 */
export function batchSize(
  waiting: number,
  maxBatch: number,
  targetLatencyMs: number,
  msPerItem: number,
): number {
  throw new Error("not implemented");
}
