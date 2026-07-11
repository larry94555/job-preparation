export interface Metrics {
  recallAtK: number;
  precisionAtK: number;
  mrr: number;
}

/**
 * Compute retrieval metrics for one query.
 *
 * TODO:
 *   hits         = number of `relevant` ids that appear in retrieved.slice(0, k)
 *   recallAtK    = hits / relevant.length      (return 0 if relevant is empty — don't divide by 0)
 *   precisionAtK = hits / k
 *   mrr          = 1 / (1-based rank of the FIRST relevant id anywhere in `retrieved`), or 0 if none
 *
 * Use a Set for O(1) membership; only MRR cares about position.
 */
export function retrievalMetrics(relevant: string[], retrieved: string[], k: number): Metrics {
  throw new Error("not implemented");
}
