export interface StackConfig {
  name: string;
  latency: number;
  cost: number;
  quality: number;
}
export interface SLO {
  maxLatency: number;
  maxCost: number;
  minQuality: number;
}

/**
 * TODO:
 *   1. Keep configs meeting ALL SLOs: latency <= maxLatency AND cost <= maxCost AND quality >= minQuality.
 *   2. Among survivors, return the highest quality; break ties by lowest cost, then lowest latency.
 *   3. Return null if no config meets the SLOs.
 */
export function selectConfig(configs: StackConfig[], slo: SLO): StackConfig | null {
  throw new Error("not implemented");
}
