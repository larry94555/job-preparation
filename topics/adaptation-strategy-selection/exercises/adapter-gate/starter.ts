/**
 * Per-lever eval gating for a RAG-vs-PEFT hybrid pipeline.
 *
 * A hybrid adaptation pipeline has several candidate "levers" (e.g. a RAG
 * retriever, a PEFT/LoRA adapter, a distilled student). Each candidate has been
 * benchmarked and carries a measured `qualityGain`, a `costPerReq`, and a
 * `latencyMs`. Before a lever is allowed into the serving path it must clear
 * per-lever eval gates: a minimum quality, a maximum cost, and a maximum
 * latency.
 *
 * Return the `lever` names of every candidate that passes ALL gates:
 *   - `qualityGain >= gates.minQuality`, AND
 *   - `costPerReq <= gates.maxCost`, AND
 *   - `latencyMs <= gates.maxLatency`.
 *
 * The returned names are sorted by `qualityGain` DESCending (highest gain
 * first). If no candidate passes, return an empty array.
 */
export interface Candidate {
  lever: string;
  qualityGain: number;
  costPerReq: number;
  latencyMs: number;
}

export interface Gates {
  minQuality: number;
  maxCost: number;
  maxLatency: number;
}

export function selectAdapters(candidates: Candidate[], gates: Gates): string[] {
  throw new Error("not implemented");
}
