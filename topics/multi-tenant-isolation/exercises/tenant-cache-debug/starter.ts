/**
 * DEBUGGING EXERCISE — this cache is BROKEN.
 *
 * Symptom reported in production: tenants are seeing each other's data. After
 * tenant "acme" caches a value under key "profile", tenant "globex" calls
 * get("globex", "profile") and is handed back ACME'S value instead of a miss —
 * a cross-tenant data leak. Two tenants that happen to use the same key end up
 * sharing one cache entry.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - set/get for the SAME tenant round-trips correctly,
 *   - one tenant can NEVER read another tenant's value for the same key,
 *   - different keys within a tenant do not collide.
 *
 * Do NOT rewrite the class — make the minimal correct fix.
 */
export class TenantCache {
  private store: Map<string, unknown>;

  constructor() {
    this.store = new Map();
  }

  set(tenantId: string, key: string, value: unknown): void {
    // BUG: the internal cache key is built from `key` ALONE, ignoring tenantId,
    // so every tenant writes into the same slot for a given key.
    const cacheKey = `${key}`;
    this.store.set(cacheKey, value);
  }

  get(tenantId: string, key: string): unknown {
    const cacheKey = `${key}`;
    return this.store.get(cacheKey);
  }
}
