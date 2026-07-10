# Build it: a tenant-scoped cache

## The cache key must carry the tenant

A cache is a lookup by key. The subtle, dangerous bug in a multi-tenant system is keying the cache by
the **request alone** (the prompt, or its embedding) and forgetting *who asked*. Then two tenants who
send the same request collide on the same key — and tenant B receives **tenant A's cached answer**.
That's a cross-user data leak, and it's silent: nothing errors, the wrong data just flows.

The fix is one line of discipline: **the cache key must include the tenant scope.** `get(tenant, key)`
namespaces every entry by its tenant, so identical `key`s from different tenants never map to the same
slot.

## Why identical keys must not collide

Make the requirement concrete. Tenant `A` caches `"A's private balance"` under key `"balance"`. Tenant
`B` then asks with key `"balance"`. The correct behavior is a **miss** — `get("B", "balance")` returns
`null`, *not* A's data. A tenant-blind cache returns A's secret to B; a tenant-scoped cache returns
null.

The same principle extends beyond this simple cache:

- **Semantic caches** leak the same way — the similarity key must be namespaced per tenant.
- **Retrieval** must apply an authorization/tenant filter so a vector search can't return another
  tenant's documents.
- **Memory / sessions** must never be reused across users.

The unit test that matters most here isn't "does a hit work" — it's the **cross-tenant miss**: prove
that one tenant can never read another's entry under the same key.
