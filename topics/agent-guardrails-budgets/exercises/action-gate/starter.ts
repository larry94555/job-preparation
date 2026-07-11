/**
 * Action gating for a guarded agent runner: HITL confirmation + circuit breaker.
 *
 * Before an agent takes an action, a gate decides whether to let it through.
 * Two guardrails combine here:
 *   - Circuit breaker: if `ctx.breakerOpen` is set, the runner has tripped its
 *     failure-containment breaker and NOTHING is allowed to run — the breaker
 *     wins over everything else. Return `"deny"`.
 *   - Human-in-the-loop confirmation: a `"high"`-risk action may only proceed
 *     once a human has confirmed it. If it is high-risk and not yet confirmed,
 *     return `"needs_confirmation"`.
 *   - Otherwise the action is allowed. Return `"allow"`.
 *
 * Implement `gateAction(action, ctx)` returning one of
 * `"allow" | "deny" | "needs_confirmation"`, checking the breaker FIRST.
 */
export function gateAction(
  action: { risk: "low" | "high" },
  ctx: { confirmed: boolean; breakerOpen: boolean },
): "allow" | "deny" | "needs_confirmation" {
  throw new Error("not implemented");
}
