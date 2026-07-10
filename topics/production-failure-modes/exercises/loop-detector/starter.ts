/**
 * Loop / no-progress detector — a standalone production guard.
 *
 * An agent that keeps emitting the same action is stuck: it is burning budget
 * without making progress. `isStuck` inspects the recent action history and
 * decides whether to trip the guard.
 *
 * Spec:
 *   isStuck(actions, k) → true  if the LAST `k` actions exist and are ALL
 *                               identical to each other (the agent has repeated
 *                               itself `k` times running).
 *                         false if there are fewer than `k` actions, or the
 *                               last `k` are not all identical.
 *   Assume k >= 1. (With k = 1, any non-empty history trips — a single action
 *   is trivially "all identical".)
 *
 * Only the tail matters: a different action earlier in the history does not
 * clear the guard if the last `k` are identical.
 */
export function isStuck(actions: string[], k: number): boolean {
  throw new Error("not implemented");
}
