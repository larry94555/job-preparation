# Expert Surface — agentic-memory-state

**SOTA snapshot: 2026-07-12.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain why an agent with no memory repeats itself forever, and that a model call is stateless — `lessons/four-memories.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: short-term buffer, working state/scratchpad, long-term vector store, episodic history, token budget, summary, retrieve-then-inject, relevance/top-k — `lessons/*`, `questions/missing-term.yaml`, `free-entry.yaml`.
- ✅ **[L2]** Translate between altitudes (the four-memories mental model ↔ in-context vs external storage) — `lessons/four-memories.md`, `lessons/memory-types.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** MemGPT / Letta virtual context management: paging memory between context and an external store — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Vector databases (FAISS, pgvector, Pinecone, Chroma) as the standard long-term semantic memory — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Memory as context engineering over time; cross-links to `context-engineering`, `rag-architecture`, `kv-cache-management`, `prompt-vs-semantic-caching` — `lessons/expert-context.md`, `reading-list.md`.
- ✅ **[L4]** Frontier open problems: eviction/forgetting policy, context poisoning from stale memories, cross-session conflict/consistency, evaluating memory quality — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L3]** The four memories as an architecture: recent buffer, working scratchpad, long-term store, episodic log, and what each is for — `lessons/four-memories.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Choosing a memory type by lifetime and access pattern; in-context vs external tradeoffs (latency, capacity, staleness) — `lessons/memory-types.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Compression as budget-triggered consolidation: keep decisions/facts/open tasks, drop chit-chat, accept lossiness — `lessons/compression.md`, `questions/mcq.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a buffer overflowing the context window and prescribe budget-triggered summarization — `lessons/compression.md`, `questions/mcq.yaml`, `essay.yaml`.
- ✅ **[L3]** Diagnose "dump the whole store into context" and prescribe retrieve-then-inject with relevance-ranked top-k recall — `lessons/recall.md`, `questions/mcq.yaml`, `free-entry.yaml`.

## D5 — Engineering & code craft
- ✅ **[L3]** Implement a capped rolling short-term buffer with FIFO eviction (`ShortTermBuffer`) — `exercises/memory-buffer`, `questions/code.yaml`.
- ✅ **[L3]** Implement budget-triggered history compression that keeps recent messages under budget (`compress_history`) — `exercises/context-compress`, `questions/code.yaml`.
- ✅ **[L3]** Implement a relevance-ranked recall store (`MemoryStore.recall`) — `exercises/recall-store`, `questions/code.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** MemGPT/Letta + vector stores + summarization/consolidation as the practical memory stack — `lessons/expert-context.md`, `lessons/compression.md`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the memory frontier moves (forgetting policy, context poisoning, cross-session consistency, memory evals) and how to track it — `reading-list.md`, plus pointers in `lessons/frontier-ops.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Whiteboard the four memories and defend budget-triggered compression + relevance-ranked recall under questioning — `questions/essay.yaml` (`essay-four-memories`, `essay-compression-recall`).

## Coverage summary
18 items · ✅ 18 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
This surface is fully covered as of the snapshot; it will revert to partial as the field's frontier
expands (learned forgetting policies, memory-quality evals, multi-agent shared-memory consistency).

<!-- coverage: items=18 covered=18 partial=0 gap=0 -->
