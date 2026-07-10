# Multi-tenant isolation — cache-key safety & poisoning

## Cache-key safety and cross-tenant hits

A response cache cuts cost and latency by returning a stored answer when a request repeats. In a
multi-tenant system the danger is the **key**. If the key is a hash of the prompt text alone, it is
**tenant-blind**: when two tenants send the same request, the second one hits the first one's entry and
is served *another tenant's answer*.

The fix is to **namespace the key by tenant scope**. A robust key combines:

- **Tenant/user scope** — so identical requests from different tenants never collide.
- **Normalized request** — so matching is correct and stable.
- **Model / version** — so a stale answer from a different model isn't reused.

A per-request UUID would technically avoid collisions, but it would also never *hit*, defeating the
cache. Scope is the right axis to add, not randomness.

## Semantic caches and cache poisoning

A **semantic cache** returns a stored answer when a new query is merely *similar* (by embedding
distance), not identical. That widens the leak surface: a paraphrased query from Tenant B can retrieve
Tenant A's entry without any identical request. Semantic caches must be **namespaced per tenant** just
like exact-match caches — the similarity match runs *within* a tenant's namespace, never across.

The other threat a collidable key namespace enables is **cache poisoning**: an attacker writes a chosen
(malicious) entry under a key that a victim tenant will later read, so the victim is served
attacker-controlled content. Scoping keys per tenant closes both doors at once: no cross-tenant read,
and no cross-tenant write into a key the victim will hit.
