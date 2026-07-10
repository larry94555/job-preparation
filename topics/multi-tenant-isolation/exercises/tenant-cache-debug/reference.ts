// Reference fix — the internal cache key is namespaced by tenantId so each
// tenant gets its own slot. (Kept out of the repo's starter; used only to
// sandbox-verify the exercise.)
export class TenantCache {
  private store: Map<string, unknown>;

  constructor() {
    this.store = new Map();
  }

  set(tenantId: string, key: string, value: unknown): void {
    // Namespacing by tenantId keeps each tenant's entries isolated.
    const cacheKey = `${tenantId}:${key}`;
    this.store.set(cacheKey, value);
  }

  get(tenantId: string, key: string): unknown {
    const cacheKey = `${tenantId}:${key}`;
    return this.store.get(cacheKey);
  }
}
