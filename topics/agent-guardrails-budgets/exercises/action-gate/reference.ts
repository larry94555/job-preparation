export function gateAction(
  action: { risk: "low" | "high" },
  ctx: { confirmed: boolean; breakerOpen: boolean },
): "allow" | "deny" | "needs_confirmation" {
  // Circuit breaker wins over everything: a tripped breaker denies all actions.
  if (ctx.breakerOpen) return "deny";
  // High-risk actions require an explicit human confirmation before proceeding.
  if (action.risk === "high" && !ctx.confirmed) return "needs_confirmation";
  return "allow";
}
