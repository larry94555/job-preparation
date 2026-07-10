// Reference solution — per-tenant admitted-count quota. Each tenant carries its
// own running tally; only admitted requests increment it, so one tenant's burst
// is capped at quotaPerTenant while others keep their full quota (availability
// isolation). (Kept out of the repo's starter; used only to sandbox-verify.)
export function admitByQuota(requests: { tenantId: string }[], quotaPerTenant: number): boolean[] {
  const admitted = new Map<string, number>();
  return requests.map((req) => {
    const used = admitted.get(req.tenantId) ?? 0;
    if (used < quotaPerTenant) {
      admitted.set(req.tenantId, used + 1); // count only admitted requests
      return true;
    }
    return false; // over quota → reject, does not consume quota
  });
}
