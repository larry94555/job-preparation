# Reading list & staying current — multi-tenant-isolation

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **Multi-tenant isolation patterns (SaaS/security tradition).** There is no single seminal LLM paper here —
  this is an old confidentiality discipline the LLM stack inherited. Notice the load-bearing frame: the leak
  lives in the *shared state around the model* (caches, indexes, sessions, logs), not in the weights.
- **The efficiency-vs-safety tradeoff.** Every isolation lever trades sharing (cheaper) against isolation
  (safer). Notice that the interesting failures happen exactly where you *wanted* to share — a semantic cache,
  a pooled index — because sharing is what creates the cross-tenant path.

## Go deeper (mechanism & isolation levers)
- **Row-level security (RLS), e.g. Postgres RLS.** The engine-enforced tenant predicate — the database itself
  refuses to return another tenant's rows. Notice why enforcement *in the engine* beats a `WHERE tenant_id`
  the application might forget: it fails closed instead of failing open.
- **Vector-DB namespaces / per-tenant partitions.** The retrieval-side analogue of RLS: scope the search space
  before you search it. Notice this is *pre-filtering* — the tenant boundary is applied to the candidate set,
  not to the results after the fact.
- **Pre-filter vs. post-filter retrieval scoping.** The single most testable distinction on this topic. Notice
  that post-filtering (retrieve globally, then drop other tenants' hits) is unsafe: it has already read the
  cross-tenant data, and any ranking, telemetry, or cache built from it can leak.
- **Tenant-scoped cache keys / cache-key conventions.** The cheapest lever and the one most often botched.
  Notice that a tenant-blind key means two tenants asking the same question collide — an identical key must
  produce a cross-tenant *miss*, never a hit.

## Frontier — what to watch
- **Semantic-cache cross-tenant leakage.** The modern LLM twist on the old problem: an embedding-similarity
  cache can serve tenant A's answer to tenant B's near-duplicate query. Watch the safe-similarity-threshold and
  invalidation questions — this is where sharing quietly defeats scoping.
- **Embedding-space leakage as a similarity side channel (open problem).** Even with scoped keys, the geometry
  of the embedding space can carry information across tenants. Watch for whether anyone can *prove* isolation
  rather than assert it — provable isolation and safe cross-user reuse are the open frontier.
- **Noisy-neighbor / quota isolation.** The availability face of the problem, distinct from confidentiality: one
  tenant's load starving another. Watch how per-tenant quotas and partitions bound the blast radius without a
  data-leak framing.

## Tools & implementations worth reading
- **Postgres RLS, vector-DB namespaces (Qdrant/Weaviate/pgvector), and cache-key conventions** — the three
  concrete places tenant scope is enforced. Reading a real RLS policy and a namespaced vector query is the
  fastest way to turn "scope the query" into a mental model of enforcement that fails closed.

## How to stay current on this topic
- Track the **vector-DB and Postgres** ecosystems — namespace, partition, and RLS features are where isolation
  guarantees land in code first.
- When a new sharing optimization appears (a cache, a shared index, a reused session), ask the three canon
  questions: *what state is now shared, which tenant boundary does it cross, and what test proves it doesn't
  leak?* — the same lens the deep-dive lesson uses.
- Treat **CI leak tests** (a zero cross-tenant leak-rate assertion) as the operational signal that your
  isolation still holds as the system changes.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
