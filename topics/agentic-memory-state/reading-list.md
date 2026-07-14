# Reading list & staying current — agentic-memory-state

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **MemGPT — Packer et al. (2023).** Virtual context management: treat the finite context window like
  RAM and an external store like disk, and page memory between them. Notice the reframing — the context
  window is one tier of a *memory hierarchy* the agent manages itself, evicting and paging back in as
  relevance shifts. This is the direct ancestor of the buffer-plus-external-store split this topic
  teaches.
- **Letta (the MemGPT successor project).** The productionized memory framework: persistent agent
  memory with a managed context window and an external store. Notice how "short-term buffer + long-term
  store + what to page in" becomes a concrete system, not just a diagram.

## Go deeper (long-term memory & compression)
- **Vector databases for semantic memory (FAISS; pgvector; Pinecone; Chroma).** The standard home for
  long-term memory: embed text and retrieve by meaning. Notice that recall across sessions is a
  *semantic-lookup* problem, and that the store is far larger than any context window — which forces
  retrieve-then-inject rather than reloading everything.
- **Conversation summarization / memory consolidation (summary-buffer memory patterns).** The
  budget-triggered compression this topic teaches: collapse old turns into a running summary when the
  buffer would overflow. Notice the lossiness tradeoff — a good summary keeps decisions, facts, and
  open tasks, but you can still summarize away something you later need.
- **Episodic memory for agents.** A durable log of past runs/episodes the agent can refer back to.
  Notice it is queried by time or run id, not by semantic similarity — a different access pattern from
  the vector store, and the source of "have I done this before?".

## Frontier — what to watch
- **Forgetting / eviction policies.** What an agent should *drop* as its store grows. Notice there is
  no settled rule; recency, importance, and access-frequency heuristics all trade recall against noise.
- **Context poisoning from stale or wrong memories.** A once-true fact recalled after it changed makes
  the model reason from a falsehood. Notice detecting and quarantining stale memories is unsolved.
- **Evaluating memory quality.** We can measure whether a retrieval returned nearby items; measuring
  whether an agent's memory as a whole *helps* is much harder. Notice that without an eval, memory
  quality is judged by vibes — an active research edge.

## See also — the core curriculum
This agentic topic points one-way into the core track, where the same questions recur:
- **context-engineering** — what fills the finite context window at each step (memory is this over time).
- **rag-architecture** — the retrieval that feeds long-term recall.
- **kv-cache-management** — the cost of carrying a long context.
- **prompt-vs-semantic-caching** — reusing prior work instead of recomputing it.

## How to stay current on this topic
- Follow **Letta / MemGPT** releases — the memory-hierarchy standard is where new paging and
  consolidation affordances land first.
- Track **vector-store** changelogs (pgvector, FAISS, hosted stores) for retrieval quality and hybrid
  ranking features that change how recall is scored.
- When a new agent-memory technique appears, ask: *what does it keep vs. forget, how does it decide
  relevance, and what eval proves it helps?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
