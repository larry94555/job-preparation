# Memory & state — the frontier

## The frontier of agent memory

The four memories, compression, and relevance-ranked recall are the solid ground. The frontier is
where they stop being enough — where an agent runs for weeks across many sessions and *managing* its
memory becomes the hard, unsolved part.

- **What to forget (eviction policy).** Memory that only grows eventually poisons itself with clutter
  and cost. Deciding *what to evict* — which memories are stale, superseded, or simply no longer worth
  their space — is an open problem. There is no settled policy for forgetting; recency, importance,
  and access-frequency heuristics all trade recall against noise, and none is clearly right.
- **Context poisoning from stale or wrong memories.** A memory written once and recalled forever can
  be **wrong** — a fact that has since changed, or an error the agent recorded as truth. Recalling it
  confidently **poisons** the current context and the model reasons from a falsehood. Detecting and
  quarantining stale or incorrect memories, rather than trusting the store blindly, is unsolved.
- **Memory conflict and consistency across sessions.** When many sessions (or many agents) write to a
  shared store, they disagree: two runs record contradictory facts, and a later recall surfaces both.
  Keeping memory **consistent** — resolving conflicts, ordering updates, knowing which write wins — is
  a distributed-state problem the naive "just append" store does not address.
- **Evaluating memory quality.** We can measure whether a *retrieval* returned nearby items; we do not
  have good ways to measure whether an agent's memory as a whole is *helping* — recalling the right
  things, forgetting the right things, staying correct over time. Without an eval, memory quality is
  judged by vibes, which is why this is an active research edge, not a solved one.

The reason to track this frontier: it attacks the same trust gap the topic is built on — *stored
memory is not automatically trustworthy* — but at the scale where a single relevance-ranked lookup is
no longer the whole story. See also the core topics **context-engineering** and **rag-architecture**,
where the same what-to-keep and what-to-retrieve questions recur.
