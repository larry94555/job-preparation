export interface Tier {
  name: string;
  cost: number;
  confidence: number;
}

export function runCascade(tiers: Tier[], threshold: number): { name: string; totalCost: number } {
  let totalCost = 0;
  for (const tier of tiers) {
    totalCost += tier.cost;
    if (tier.confidence >= threshold) {
      return { name: tier.name, totalCost };
    }
  }
  const last = tiers[tiers.length - 1];
  return { name: last.name, totalCost };
}
