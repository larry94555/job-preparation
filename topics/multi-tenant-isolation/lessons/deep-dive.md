# Multi-tenant isolation — architecture, tradeoffs, and reviewing a design

You already know the dimensions where tenants leak (caches, retrieval, memory, logs), why a
prompt-only cache key is unsafe, and how to scope retrieval. This lesson zooms out to the **design
space**: the levers an application engineer actually pulls to keep tenants apart on shared
infrastructure, what each one trades away, and how to judge someone else's isolation design the way
a security-minded staff engineer would in a review.

## The multi-tenant-isolation design space

Every isolation decision is really a decision about **where the tenant boundary lives** — how far
down the stack you push "this data belongs to tenant A" so that a query, a cache hit, or a log write
*cannot* cross it, even when app code forgets. This is a security tradition (SaaS multi-tenancy,
row-level security), not a topic with one seminal LLM paper — the LLM twist is that new shared
surfaces (semantic caches, vector indexes, conversation memory) each reopen an old isolation problem.
There are five roughly independent levers, and real systems combine them:

- **Data partitioning** — one **shared table/index with a tenant column** vs. **per-tenant
  partitions/namespaces** vs. a **database (or index) per tenant**. Sharing is cheapest and scales to
  many small tenants; hard partitioning is the strongest isolation but multiplies operational cost.
- **Boundary enforcement** — enforce the tenant predicate in **application `WHERE` clauses** vs. in
  the **engine** via **row-level security (RLS)**. RLS moves the check where a developer cannot
  forget it; app-only checks are one missed clause away from a leak.
- **Retrieval scoping** — **pre-filter** the ANN search to the tenant's namespace/authorized set, or
  **post-filter** after an unscoped top-k. Pre-filtering keeps the scope *inside* the search;
  post-filtering fetches other tenants' data and can crowd out the caller's valid results.
- **Cache keying** — fold **tenant (and user) identity into the cache key**, or key on prompt
  content alone. A tenant-blind key — especially on a **semantic** (similarity) cache — serves one
  tenant's answer to another and enables cache poisoning.
- **Session & state scope** — scope conversation memory, sessions, and logs **per tenant/user**, or
  pool them. Reused session objects and pooled logs are quiet contamination channels that never show
  up in a functional demo.

## A tradeoff table for multi-tenant-isolation

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Shared table + tenant column | Cheapest, scales to many small tenants, one schema to run | Every query must carry the predicate; one missed clause leaks | Many small tenants, low blast-radius data |
| Row-level security (RLS) | Engine-enforced predicate app code can't forget | Policy authoring/testing; some query-planning overhead | Any shared store holding regulated or sensitive tenant data |
| Per-tenant namespace / partition | Strong retrieval isolation, simple mental model, per-tenant tuning | More partitions to manage; cold-start and cost per tenant | Vector search where cross-tenant hits are unacceptable |
| Database / index per tenant | Hardest isolation, per-tenant blast-radius and compliance story | Highest operational + $$$ cost; poor for the long tail | Few large tenants, strict compliance / contractual isolation |
| Tenant-scoped cache keys | Safe reuse of exact-prompt hits without cross-tenant leaks | No sharing of identical answers across tenants (lower hit rate) | Any shared response/prompt cache in a multi-tenant app |
| Authz-filtered (pre-filtered) retrieval | Search only ever considers the caller's chunks | Filtered-ANN complexity; index must carry tenant metadata | Shared index serving many tenants at once |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just add a tenant column" without naming the missed-`WHERE`
failure mode — or who reaches for a database-per-tenant for a long tail of tiny tenants — is
signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any isolation subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** a shared store with a **tenant column**, application-layer
  `WHERE tenant_id = ?` on every query, a per-tenant **namespace** in the vector DB, and cache keys
  that include the tenant. This is a perfectly reasonable baseline for many small tenants.
- **SOTA (frontier, worth reaching for under real pressure):** **tenant-scoped cache keys +
  authorization-filtered retrieval + per-tenant partitions** — isolation enforced at *every* shared
  surface, backed by **RLS** so the database itself refuses cross-tenant rows, plus **isolation/leak
  tests** in CI that assert a **zero cross-tenant leak rate**. The frontier is treating the tenant
  boundary as an invariant the engine and the test suite enforce, not a convention app code follows.
- **Antipattern (looks fine, fails in production):** a **tenant-blind cache key** (or a shared
  **semantic** cache) that serves A's answer to B; **post-filtering** an unscoped vector search;
  trusting hand-written `WHERE` clauses with no RLS backstop; and **reused sessions/pooled logs** that
  carry one user's context or prompts to another. Each passes a single-tenant demo and leaks the
  moment a second tenant shares the surface.

## Scaling, performance, and the token budget

The concerns that make this concrete:

- **Isolation strength trades against cost and scale.** Database/index-per-tenant is the strongest
  boundary but its per-tenant fixed cost makes a long tail of small tenants uneconomic; a shared
  store with RLS gives most of the safety at a fraction of the cost. Pick the partitioning grain to
  match tenant size distribution, not the most-isolated option by reflex.
- **Cache scoping is a hit-rate/safety trade.** Tenant-scoping the key means two tenants asking the
  identical question don't share a hit — you trade some cache efficiency for confidentiality. On a
  **semantic** cache the stakes are higher: a similarity hit across tenants is a leak *and* a
  poisoning vector, so cross-tenant reuse is off by default for anything non-public.
- **Pre-filtering protects both safety and recall.** Post-filtering an unscoped top-k can return too
  few valid rows once another tenant's more-similar chunks are stripped out, and their data has
  already entered the process. Filtered-ANN / per-tenant namespaces keep recall *and* the boundary.
- **The token budget is a leak surface too.** Anything that flows into the context window — retrieved
  chunks, cached completions, reused conversation memory — must already be tenant-scoped *before* it
  reaches the prompt. Isolation that only guards storage but lets contaminated content into the token
  budget has moved the leak, not closed it.

## Reviewing a multi-tenant-isolation design

When you are handed an isolation design to critique — in a review or an interview — walk the same
checklist:

1. **Where does the tenant boundary actually live?** If it lives only in app-layer `WHERE` clauses
   with no RLS or partition backstop, stop there; one missed clause is a leak.
2. **Are cache keys tenant-scoped?** A prompt-only key — and especially a shared **semantic** cache —
   is an immediate flag for cross-tenant hits and poisoning.
3. **Is retrieval pre-filtered?** Post-filtering an unscoped search is unsafe; the design should scope
   the search itself (namespace or authz filter).
4. **Is per-user/per-tenant state reset?** Reused sessions, shared conversation memory, and pooled
   logs are quiet contamination channels — check each is scoped.
5. **How is isolation verified?** A real design names an isolation/leak test asserting a **zero
   cross-tenant leak rate**, not "it works in the demo."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy ignores tenancy entirely; a prototype adds a tenant column; a demo scopes
cache keys and retrieval; a production-ready design also enforces the boundary in the engine (RLS /
partitions), resets per-user state, and gates every release behind a cross-tenant leak test.
