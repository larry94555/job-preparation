# Memory & state — expert context

## The memory canon

Agent memory has a short, nameable canon — the work that turned "just keep appending to the prompt"
into a memory *hierarchy* you can design and reason about.

- **MemGPT / Letta (2023–).** The load-bearing idea is **virtual context management**: treat the
  finite context window like RAM and an external store like disk, and **page** memory between them.
  When the context fills, older content is evicted to the external store; when it becomes relevant
  again, it is paged back in. MemGPT reframed the context window as one tier of a **memory
  hierarchy** the agent manages itself, and Letta is its productionized successor. This is the direct
  ancestor of the buffer-plus-external-store split this topic teaches.
- **Vector databases for long-term semantic memory.** Systems like FAISS, and hosted stores such as
  pgvector, Pinecone, or Chroma, are where the **long-term store** actually lives: text is embedded
  and looked up by semantic similarity, so an agent can recall a fact from a past session by *meaning*
  rather than by its position in a transcript. The vector store is the standard implementation of the
  "recall across sessions" memory.
- **The connection to context engineering.** All of this is one half of a larger discipline: deciding
  *what occupies the finite context window at each step*. Memory management (what to keep in context,
  what to evict, what to page back in) is context engineering applied over time. Knowing that memory
  and context engineering are the same problem viewed from different angles is what reads as senior.

See also the core curriculum topics **context-engineering** (what fills the window), **rag-architecture**
(retrieval that feeds long-term recall), **kv-cache-management** (the cost of a long context), and
**prompt-vs-semantic-caching** (reusing prior work) — memory is where those threads meet in an agent.
