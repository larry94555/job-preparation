# 13. RAG architecture: chunking, embeddings, hybrid search, reranking, freshness — Lesson-Plan Breakdown

**Slug:** `rag-architecture` · **Depth:** light draft · See [Goals.md](../Goals.md) · [TOPIC_PLANS.md](../TOPIC_PLANS.md)

**Scope:** The end-to-end retrieval pipeline that grounds generation: split, embed, search
(dense+sparse), rerank, keep fresh.

## Expert Surface (light — living; verify before authoring)
- **Concepts:** chunking (size/overlap/structure); embeddings; dense vs. sparse vs. hybrid; fusion (RRF); reranking (cross-encoder); freshness/indexing; grounding assembly.
- **Key terms:** chunk/overlap, embedding, BM25, ANN/HNSW, hybrid search, RRF, cross-encoder reranker, top-k, freshness/TTL.
- **Tradeoffs:** chunk size (context vs. precision); dense vs. sparse; rerank quality vs. latency; freshness vs. index cost.
- **Patterns:** structure-aware chunking; hybrid + rerank; metadata filtering; incremental reindex. **Antipatterns:** fixed-size naive chunking; dense-only; no reranker; stale index.
- **Architectures:** classic RAG; hybrid+rerank; graph/parent-child; agentic retrieval.
- **Papers/posts:** RAG (Lewis 2020); ColBERT (Khattab 2020); RRF (Cormack 2009); "lost in the middle" (Liu 2023); Anthropic contextual retrieval. *(verify)*
- **People/canon:** Lewis et al.; Khattab (ColBERT/DSPy); practitioner writing.
- **Benchmarks/metrics:** recall@k, precision@k, nDCG, end-to-end answer quality; BEIR, MTEB.
- **Tools/OSS/models:** FAISS, pgvector, Elastic/OpenSearch, Qdrant/Weaviate; embedding models; rerankers (bge, Cohere).
- **Open problems:** optimal chunking; retrieval for reasoning; freshness at scale; eval fidelity.
- **Interview signals:** can you justify chunking, when hybrid beats dense, and the reranker's role.

## Lesson Plans (value-tiered, sequenced)
| # | Lesson plan | Tier | Target | Certifies | Modes |
|---|---|---|---|---|---|
| LP1 | RAG pipeline overview & when to use it | T1 | L2→L3 | C1.1, C3.1 | MC, Cloze, FE |
| LP2 | Chunking strategies & pitfalls | T1 | L3 | C3.2, C3.3 | MC, Essay |
| LP3 | Embeddings & vector search basics | T1 | L3 | C1.3, C6.1 | MC, Code |
| LP4 | Dense vs. sparse vs. hybrid (+RRF) | T1 | L3 | C3.3, C5.1 | MC, Code |
| LP5 | Reranking & the latency tradeoff | T2 | L3 | C3.3, C6.2 | Essay, Code |
| LP6 | Freshness, indexing & invalidation | T2 | L3 | C3.4, C5.5 | Essay |
| LP7 | Build hybrid retrieval + rerank | T2 | L3 | C5.2, C5.4 | Code |
| LP8 | SOTA: contextual/agentic retrieval | T3 | L3→L4 | C2.4, C4.4 | Essay |

**Prereqs:** LP1 gates; tightly paired with topic 14 (retrieval evals).
