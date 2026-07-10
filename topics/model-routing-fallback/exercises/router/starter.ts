export interface Provider {
  name: string;
  call: () => any;
}
export type RouteResult = { ok: true; provider: string; value: any } | { ok: false; error: string };

export class Router {
  constructor(failureThreshold: number) {
    throw new Error("not implemented");
  }

  /**
   * TODO:
   *   Try providers in order. Skip any whose consecutive-failure count has reached the threshold
   *   (breaker open). Call the provider:
   *     - on success: reset its failure count and return { ok:true, provider, value }
   *     - on throw:   increment its failure count and try the next
   *   If none succeed, return { ok:false, error:"all_failed" }.
   */
  run(providers: Provider[]): RouteResult {
    throw new Error("not implemented");
  }
}
