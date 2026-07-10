/**
 * A cache that must isolate tenants.
 *
 * TODO:
 *   - set(tenant, key, value): store an entry scoped to (tenant, key).
 *   - get(tenant, key): return the value for THIS tenant+key, or null.
 *   Another tenant's entry stored under the same `key` must NOT be returned — include the tenant in
 *   the internal key so identical keys across tenants never collide.
 */
export class TenantCache {
  set(tenant: string, key: string, value: unknown): void {
    throw new Error("not implemented");
  }

  get(tenant: string, key: string): unknown {
    throw new Error("not implemented");
  }
}
