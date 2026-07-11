# Multi-tenant isolation — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
multi-tenant isolation from someone who *runs* it: where the research edge sits, and the operational
signals you watch once it's live and a second tenant is sharing the surface.

## The multi-tenant-isolation frontier

Multi-tenant isolation is a SaaS/security tradition, not a topic with a single seminal LLM paper — but
the LLM stack reopened several old problems on new shared surfaces, and that is where the frontier
lives.

- **Embedding-space leakage as a similarity side channel.** This is the genuinely open problem. Even
  with tenant-scoped cache keys and pre-filtered retrieval, the *geometry* of a shared embedding space
  can carry information across tenants: similarity scores, nearest-neighbor structure, and reconstructed
  content can expose one tenant's data through the space itself, not through a forgotten `WHERE` clause.
  The frontier question is whether anyone can **prove** isolation rather than assert it — nobody ships a
  proof of embedding-space non-leakage, so this stays an active research edge alongside *safe
  cross-user reuse* (when, if ever, it is acceptable to share a cached result).
- **Noisy-neighbor and quota isolation.** This is the *availability* face of the problem, distinct from
  confidentiality. One tenant's load — a burst of expensive long-context requests, a hot retrieval loop —
  can starve every other tenant of shared capacity. The frontier here is bounding the blast radius with
  **per-tenant quotas, rate limits, and partitions** so noisy neighbors degrade *their own* service, not
  the whole pool. Note the reframe: there is no data crossing the boundary, so a confidentiality lens
  misses it entirely — you reason about it as capacity and fairness.
- **OWASP LLM08 — vector and embedding weaknesses.** The field's own checklist caught up: OWASP's LLM
  Top 10 added **Vector and Embedding Weaknesses (LLM08)** (and Sensitive Information Disclosure, LLM02),
  which names embedding-store and cross-tenant retrieval leakage as an acknowledged production surface
  rather than a footnote. Being able to point to LLM08 is how you signal this is a recognized class of
  weakness, not a hunch.
- **Semantic-cache cross-tenant leakage.** The modern LLM twist on the oldest cache bug. A similarity-
  keyed (semantic) cache can serve tenant A's answer to tenant B's *near-duplicate* query because
  embedding similarity — not tenant identity — decided the hit. The live frontier questions are the
  **safe similarity threshold** and **invalidation**: cross-tenant reuse is off by default for anything
  non-public, because a similarity hit across tenants is a leak *and* a poisoning vector at once.

The reason to track these together: three of them (embedding leakage, LLM08, semantic-cache leakage)
attack the same shared surface — the embedding/retrieval/cache path — from different angles, while
noisy-neighbor isolation is the reminder that *availability* is a second, separate isolation axis an
expert names without being prompted.

## Operating multi-tenant isolation in production

Once it's live, you don't watch "isolation" — you watch a handful of signals that tell you whether the
tenant boundary is still holding and whether one tenant is degrading the rest.

- **Cross-tenant leak-test pass rate.** The headline gauge. A CI/canary suite seeds tenant A, queries as
  tenant B across every shared surface (cache, index, sessions, logs), and asserts a **zero cross-tenant
  leak rate**. This is the release gate: any leak, ever, fails the build. A design that names this test
  is production-grade; one that says "it works in the demo" is not.
- **Per-tenant quota and rate-limit hits.** How often each tenant bumps its quota or rate limit. This is
  your noisy-neighbor signal: a single tenant pinning its limit is the system *working* (its blast radius
  is contained); shared-pool saturation with no per-tenant attribution means you have no isolation on the
  availability axis at all.
- **Cache-key-scope audits.** A periodic assertion that every cache entry's key actually carries tenant
  (and user) scope — the cheapest lever and the one most often botched. A key that regressed to
  tenant-blind won't fail a functional test; it only shows up as a leak once two tenants collide, so you
  audit the key shape directly rather than waiting for the collision.
- **Noisy-neighbor latency variance.** Per-tenant tail-latency spread under shared load. Rising variance
  across tenants — some fast, some starved — is the leading indicator that quota/partition isolation is
  too coarse and one tenant's load is bleeding into another's latency *before* it shows up as quota
  errors.

The operational discipline: gate every release on the **cross-tenant leak-test pass rate** and
**cache-key-scope audits** (the confidentiality boundary), and watch **per-tenant quota hits** and
**noisy-neighbor latency variance** (the availability boundary). Isolation that only guards storage but
never tests whether a second tenant can read across a shared surface — or whether one tenant can starve
another — has documented the boundary, not verified it.
