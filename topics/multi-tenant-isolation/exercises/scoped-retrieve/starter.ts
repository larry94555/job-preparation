/**
 * Authz-filtered (pre-filtered) retrieval scope.
 *
 * A single shared vector index holds documents for many tenants. `docs` are the
 * candidate hits for a query, each carrying the `tenantId` that owns it and a
 * relevance `score`. Implement `scopedRetrieve` so the caller only ever sees
 * their OWN tenant's documents:
 *
 *   1. Authorization PRE-filter: keep only docs whose `tenantId` matches the
 *      caller's `tenantId`. This happens BEFORE ranking — never rank first and
 *      strip foreign docs afterward.
 *   2. Rank the surviving docs by `score` descending and return the top-`k` ids.
 *
 * A more-similar document belonging to another tenant must NEVER appear in the
 * result, even if its score is the highest overall. If fewer than `k` docs match
 * the caller's tenant, return all of them.
 */
export interface Doc {
  id: string;
  tenantId: string;
  score: number;
}

export function scopedRetrieve(docs: Doc[], tenantId: string, k: number): string[] {
  throw new Error("not implemented");
}
