export interface Action {
  tool: string;
  provenance: "trusted" | "untrusted";
  confirmed?: boolean;
}
export interface Policy {
  highRisk: string[];
}
export interface AuthzResult {
  allowed: boolean;
  reason?: string;
}

/**
 * TODO: block with { allowed:false, reason:"untrusted_high_risk" } when the tool is in policy.highRisk
 * AND action.provenance === "untrusted" AND not action.confirmed. Otherwise return { allowed:true }.
 */
export function authorize(action: Action, policy: Policy): AuthzResult {
  throw new Error("not implemented");
}
