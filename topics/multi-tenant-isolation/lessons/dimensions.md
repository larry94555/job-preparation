# Multi-tenant isolation — dimensions & the threat

## Isolation dimensions and the threat

When many tenants (or users) share one LLM system, the goal of **isolation** is simple to state and
easy to get wrong: *one tenant's data must never surface in another's session or answer.* The leak
almost never comes from the model weights — it comes from the **shared state** around the model.

The dimensions you have to isolate:

- **Caches** — a shared response or semantic cache can serve Tenant A's answer to Tenant B.
- **The retrieval index** — a shared vector store can return one tenant's chunks to another's query.
- **Conversation memory / session** — reused session state bleeds one user's history into the next.
- **Logs and traces** — prompts and completions carry tenant data; pooled logs expose it to others.

Every one of these is a place where tenants share memory, storage, or compute — and therefore a place
a leak can happen. Treating any single surface as "the" risk leaves the rest open.

## The sharing versus isolation tradeoff

Sharing resources is what makes multi-tenancy efficient: one index, one cache, one fleet. But sharing
is exactly what creates the leak surface. The central tradeoff is **efficiency (sharing) versus safety
(isolation)**:

- A **pooled** design (filtered shared index, namespaced shared cache) is cheap but relies on the
  filter/namespace being correct *everywhere*.
- A **siloed** design (per-tenant index, per-tenant cache) gives hard isolation at higher resource and
  operational cost.

A related but distinct concern is the **noisy neighbor**: shared capacity means one tenant's load spike
can degrade latency or throughput for others. That is an *availability* problem, not a *confidentiality*
leak — but it is another reason isolation boundaries matter. Whichever design you pick, you verify it
with **isolation tests** that probe for cross-tenant leaks, targeting a cross-tenant leak rate of zero.
