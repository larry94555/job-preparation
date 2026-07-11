/**
 * Per-tenant quota admission — availability isolation against a noisy neighbor.
 *
 * A shared service processes a stream of `requests` in order. Each request names
 * the `tenantId` it belongs to. To stop one noisy tenant from starving the
 * others, admit a request only while that tenant is still UNDER its quota.
 *
 * Rules:
 *   - Process requests strictly in order.
 *   - Admit (`true`) a request only if its tenant has FEWER than `quotaPerTenant`
 *     already-admitted requests so far; otherwise reject it (`false`).
 *   - Only ADMITTED requests count toward a tenant's quota — a rejected request
 *     does not consume quota.
 *   - Return the per-request admit/reject decisions in the original order.
 *
 * So a burst from one tenant is capped at `quotaPerTenant` (its later requests
 * are rejected) while other tenants keep getting admitted; interleaved tenants
 * each get their own independent quota.
 */
export function admitByQuota(requests: { tenantId: string }[], quotaPerTenant: number): boolean[] {
  throw new Error("not implemented");
}
