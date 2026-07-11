export interface Latency {
  ttft: number;
  decode: number;
  total: number;
}

/**
 * TODO:
 *   ttft   = promptTokens / prefillRate   (prefill phase — depends only on the prompt)
 *   decode = outputTokens * tpot          (decode phase — depends only on the output)
 *   total  = ttft + decode
 */
export function estimateLatency(
  promptTokens: number,
  outputTokens: number,
  prefillRate: number,
  tpot: number,
): Latency {
  throw new Error("not implemented");
}
