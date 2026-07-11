export function batchSize(
  waiting: number,
  maxBatch: number,
  targetLatencyMs: number,
  msPerItem: number,
): number {
  const sloCap = Math.floor(targetLatencyMs / msPerItem);
  return Math.max(0, Math.min(waiting, maxBatch, sloCap));
}
