# Expert Surface — rag-architecture

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L2]** Explain what RAG is and when to reach for it vs. fine-tuning/prompting — `lessons/rag-pipeline.md`, `questions/mcq.yaml`, `questions/essay.yaml`.
- ✅ **[L3]** Walk the query-time pipeline (embed → retrieve → rerank → assemble → generate) in order — `lessons/rag-pipeline.md`, `questions/mcq.yaml`.
- ✅ **[L3]** Command the vocabulary: chunk, overlap, dense/sparse/hybrid, RRF, reranker, freshness — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** RAG (Lewis et al., 2020) as the origin of retrieval-augmented generation — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** ColBERT (Khattab & Zaharia, 2020) late interaction; RRF (Cormack et al., 2009) rank fusion — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Anthropic Contextual Retrieval (2024) as chunk-context enrichment — `lessons/expert-context.md`, `lessons/deep-dive.md`.
- ✅ **[L4]** GraphRAG / retrieval-for-reasoning frontier (multi-hop, structured retrieval); Contextual Retrieval and agentic/iterative retrieval as the frontier directions — `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five RAG levers (chunking, retrieval method, reranking, context enrichment, freshness) and their tradeoffs — `lessons/deep-dive.md` tradeoff table.
- ✅ **[L4]** common → SOTA → antipattern taxonomy for a RAG design — `lessons/deep-dive.md`.
- ✅ **[L4]** Review a RAG design and rate it toy/prototype/demo/production — `questions/deep-dive.yaml` (code-review MCs + design-review essay).
- ✅ **[L3]** Context is a ranked budget: precision at small k over raw recall — `lessons/deep-dive.md`, `questions/deep-dive.yaml`.

## D4 — Problem solving
- ✅ **[L3]** Diagnose a dense-only pipeline missing exact IDs/rare terms and choose hybrid + fusion — `lessons/retrieval.md`, `questions/deep-dive.yaml`.
- ✅ **[L3]** Choose a chunking strategy for a corpus and justify size/overlap/structure — `lessons/chunking.md`, `questions/essay.yaml`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement Reciprocal Rank Fusion (1/(k+rank), sum across lists, sort desc, deterministic ties) — `exercises/rrf`, `questions/code.yaml`, `lessons/build-rrf.md`.
- ✅ **[L4]** Debug a broken RRF fusion (raw-score normalization / dropped items) — `exercises/rrf-debug`, `questions/deep-dive.yaml`.
- ✅ **[L4]** Implement a cross-encoder rerank funnel over a first-stage candidate set — `exercises/rerank-funnel`, `questions/frontier-ops.yaml` (`code-rag-rerank-funnel`), taught in `lessons/retrieval.md`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Vector/index stacks (FAISS, pgvector, Elastic/OpenSearch, Qdrant/Weaviate) and rerankers (bge, Cohere Rerank) — `lessons/expert-context.md`.
- ✅ **[L3]** Operational signals (retrieval recall@k in prod, reranker latency, index freshness/staleness, grounding/citation rate) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the RAG frontier moves (contextual/agentic retrieval, freshness at scale, eval fidelity) and how to track it — pointers in `lessons/expert-context.md`, curated reading list in `reading-list.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags on chunking, hybrid-vs-dense, and the reranker's role — `lessons/expert-context.md` (interview section), `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend an end-to-end RAG pipeline design under questioning — `questions/deep-dive.yaml` design-review essay, `questions/expert.yaml` interview essay.

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
The D5 cross-encoder rerank funnel now has a dedicated sandbox-verified exercise. This surface will
revert to partial as the field's frontier expands.

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
