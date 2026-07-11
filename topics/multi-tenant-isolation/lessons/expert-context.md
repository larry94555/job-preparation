# Expert context: papers, frontier & interview

## Papers people and the frontier

Multi-tenant isolation is a **security-tradition-led** topic more than an LLM-paper topic: there is no
single landmark paper the way `vLLM` anchors KV-cache management. The canon here is the accumulated
**SaaS and application-security tradition** — multi-tenant isolation patterns, plus the more recent
discussions of **semantic-cache leakage** in LLM systems. Say that out loud in an interview; inventing a
seminal paper is a red flag.

The patterns you should be able to name and summarize:

- **Multi-tenant isolation patterns** — the SaaS-architecture playbook for keeping tenants apart on
  shared infrastructure: per-tenant partitions, scoped keys, and authorization enforced at the data
  boundary rather than in the application layer alone.
- **Row-level security (RLS)** — the database mechanism that scopes rows to a tenant so a query can only
  ever see that tenant's data. In Postgres, RLS policies enforce the tenant predicate in the engine, not
  in hand-written `WHERE` clauses that a developer can forget.
- **Semantic-cache leakage discussions** — the LLM-specific concern: a shared **semantic cache** keyed
  on embedding similarity can serve one tenant's cached answer to another because the *prompt content*,
  not the tenant, decided the hit. This is the modern twist on an old isolation problem.

Tools you'd reference: **vector-DB namespaces** (per-tenant partitions for retrieval), **Postgres RLS**,
and **cache-key conventions** that fold the tenant (and user) identity into the key. Current SOTA is
**tenant-scoped cache keys + authorization-filtered retrieval + per-tenant partitions** — isolation
enforced at every shared surface, not just one. Open problems experts still argue about: **safe
cross-user reuse** (when, if ever, it's acceptable to share a cached result), **provable isolation**, and
**embedding-space leakage** where similarity itself becomes a side channel.

## Interviewing on multi-tenant isolation

What a strong interviewer probes here:

- Can you explain **how a semantic cache leaks across tenants** — that a similarity-keyed cache can
  return tenant A's answer to tenant B because the key ignored tenant identity?
- Do you know **correct retrieval scoping** — that vector search must be constrained to the tenant's
  namespace/partition or authorization-filtered, not post-filtered after an unscoped search?
- Can you point to the **data-boundary mechanisms** (row-level security, per-tenant partitions) rather
  than trusting application code to remember the tenant predicate every time?

**Red flags** that sink candidates: **tenant-blind cache keys**, a **shared semantic cache** across
tenants, **unscoped vector search**, and **reused sessions** that carry one user's context into another.
Asked to design tenant isolation, lead with **tenant-scoped cache keys**, then **authorization-filtered
retrieval within per-tenant partitions/namespaces**, then **RLS at the database boundary** — and be
honest that this is a **security tradition**, not a single cited paper. Naming the mechanisms *and*
knowing where the leaks actually live is what reads as senior.
