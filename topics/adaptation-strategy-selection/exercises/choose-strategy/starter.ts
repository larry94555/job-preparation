export interface Requirements {
  freshness?: boolean;
  attribution?: boolean;
  behaviorChange?: boolean;
  lowLatency?: boolean;
}
export type Strategy = "rag" | "fine-tuning" | "distillation" | "in-context";

/**
 * TODO — return the recommended strategy in this precedence order:
 *   freshness OR attribution → "rag"
 *   else behaviorChange      → "fine-tuning"
 *   else lowLatency          → "distillation"
 *   else                     → "in-context"
 */
export function chooseStrategy(req: Requirements): Strategy {
  throw new Error("not implemented");
}
