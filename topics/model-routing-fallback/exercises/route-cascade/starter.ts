/**
 * Cheap→strong routing cascade with a tuned quality gate.
 *
 * `models` are ordered cheap→strong. Given a `minQuality` gate, pick the FIRST
 * model whose `quality >= minQuality` and report whether we had to escalate past
 * the cheapest option.
 *
 * Rules:
 *   - Return the first model (in cheap→strong order) with `quality >= minQuality`.
 *   - `escalated` is `false` if that model is the first (cheapest) one, else `true`.
 *   - If NO model clears the gate, return the LAST (strongest) model with
 *     `escalated: true`.
 */
export interface Model {
  name: string;
  quality: number;
}

export function route(models: Model[], minQuality: number): { name: string; escalated: boolean } {
  throw new Error("not implemented");
}
