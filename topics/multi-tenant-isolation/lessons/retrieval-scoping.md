# Multi-tenant isolation — retrieval scoping & contamination

## Retrieval scoping and authorization filters

When many tenants' documents live in **one shared vector index**, similarity search alone does not
respect tenant boundaries — the nearest chunks to a query may belong to anyone. Isolation must be
enforced at **query time**:

- **Authorization filter** — attach a `tenant_id` (and access-control) to every chunk's metadata, and
  make every search apply a filter so it only ever considers the caller's documents.
- **Per-tenant namespace / partition** — give each tenant its own slice of the store, keyed by tenant
  id, so a query physically cannot reach another tenant's vectors.
- **Row-level security (RLS)** — enforce the same rule in the backing datastore.

Do **not** rely on the embedding space to keep tenants apart, on the reranker to "drop" foreign chunks,
or on the UI to hide them — any of those can leak another tenant's data into the model's context.

A subtle mistake is **post-filtering**: run an unfiltered top-k search, then remove other tenants'
chunks afterward. This is unsafe. Another tenant's more-similar chunks can crowd out the caller's,
leaving too few (or zero) valid results, and their data has already been fetched into the process.
**Pre-filtering** — a filtered ANN search or a per-tenant namespace — keeps the scope *inside* the
search. Choosing a per-tenant index over a filtered shared index trades higher cost for stronger,
simpler isolation.

## Cross-user context contamination vectors

Beyond cache and index, context can bleed through **stateful** surfaces:

- **Reused session / conversation objects** — history from a prior user leaks into the next user's
  prompt. Scope session and memory per user and **reset state between users**.
- **Shared caches** — covered above: namespace keys by tenant/user scope.
- **Unscoped retrieval** — covered above: authorization filters or per-tenant namespaces.
- **Logs and traces** — pooled logs capture one tenant's prompts and outputs and can expose them to
  operators or tooling serving other tenants. Scope and access-control logs.

Because contamination can enter through any of these, you verify the whole boundary with **isolation /
leak tests** — adversarial probes that try to surface one tenant's data in another's session, with a
target cross-tenant leak rate of zero.
