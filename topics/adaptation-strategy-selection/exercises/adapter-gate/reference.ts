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
  return candidates
    .filter(
      (c) =>
        c.qualityGain >= gates.minQuality &&
        c.costPerReq <= gates.maxCost &&
        c.latencyMs <= gates.maxLatency,
    )
    .sort((a, b) => b.qualityGain - a.qualityGain)
    .map((c) => c.lever);
}
