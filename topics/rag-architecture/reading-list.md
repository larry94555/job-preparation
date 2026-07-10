# Reading list & staying current — rag-architecture

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **RAG — Lewis et al. (FAIR, 2020).** The paper that named retrieval-augmented generation: condition
  generation on retrieved passages instead of baking knowledge into weights. Notice the core bet —
  volatile facts live in an index you can update, not in a model you have to retrain.
- **Reciprocal Rank Fusion — Cormack et al. (2009).** The rank-fusion primitive underneath hybrid
  retrieval: sum 1/(k+rank) across lists, no score normalization required. Notice that it combines
  dense and sparse results using only *positions*, which is why it is robust to incomparable score scales.

## Go deeper (mechanism & retrieval structure)
- **ColBERT — Khattab & Zaharia (2020).** Late-interaction retrieval: keep per-token embeddings and
  match at query time instead of collapsing to one vector. Notice the tradeoff — more expressive matching
  bought with a larger index and heavier scoring, the reason single-vector dense retrieval stays common.
- **Anthropic "Contextual Retrieval" (2024).** Chunk-context enrichment: prepend document-level context
  to each chunk before embedding so a fragment retrieves on its own meaning. Notice this attacks the
  chunking problem at index time, not query time — the failure mode is chunks that lost their referents.
- **Cross-encoder rerankers (bge, Cohere Rerank).** The second stage that rescores a first-stage
  candidate set by jointly encoding query+passage. Notice the funnel shape: cheap recall-oriented
  retrieval first, expensive precision-oriented rerank over a small k — you do not rerank the whole corpus.

## Frontier — what to watch
- **GraphRAG / retrieval-for-reasoning.** Structured, multi-hop retrieval over graphs instead of flat
  top-k passages. Watch this where a single retrieval step cannot assemble an answer that spans documents;
  the open question is when the structure earns its build-and-maintenance cost.
- **Contextual / agentic retrieval and freshness at scale.** The frontier is moving from one-shot
  retrieval toward iterative, query-rewriting loops and keeping large indexes fresh. Watch for eval
  fidelity to keep up — the hard part is proving these win, not demoing that they run.

## Tools & implementations worth reading
- **Vector/index stacks — FAISS, pgvector, Elastic/OpenSearch, Qdrant/Weaviate.** Reading how each does
  dense ANN vs. sparse BM25 (and whether it does both) is the fastest way to see why *hybrid* retrieval
  is a stack decision, not just an algorithm choice.
- **Rerankers — bge, Cohere Rerank.** Wiring a reranker over a first-stage candidate set turns the
  funnel from a diagram into real latency/quality numbers you can feel.

## How to stay current on this topic
- Follow the **vector-DB and reranker** projects (FAISS, pgvector, Qdrant/Weaviate, bge, Cohere Rerank) —
  hybrid + fusion + rerank features land in these stacks first.
- When a new retrieval technique appears, ask the three canon questions: *what does it trade
  (precision/recall/latency/freshness), what regime does it win in, and what eval proves it?* — the same
  lens the deep-dive lesson uses to separate a retrieval miss from a grounding failure.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items — a GraphRAG drill,
  a cross-encoder rerank exercise, freshness metrics — are your next reads.

## Reception & what aged
- **RAG (Lewis et al., FAIR, NeurIPS 2020) named the paradigm that became the default architecture** for
  knowledge-grounded LLM apps. What aged: the original RAG-Sequence/RAG-Token formulation is now historical
  — production RAG looks nothing like it — but the core bet (volatile facts in an updatable index, not in
  weights) is more entrenched than ever.
- **"Naive RAG" became a term of criticism.** Fixed-size chunking + dense-only retrieval + no reranker is
  now the widely-cited straw man; the field moved decisively to hybrid (dense + BM25) + fusion + cross-
  encoder rerank as the expected baseline. Canon's red-flag list matches how practitioners actually
  critique pipelines today.
- **Reciprocal Rank Fusion (Cormack, Clarke & Buettcher, SIGIR 2009) became *the* default hybrid-fusion
  baseline.** Its position-only, score-normalization-free combination is what vector DBs and search stacks
  ship as their built-in hybrid fusion — a 2009 IR method that aged into the modern RAG default.
- **Anthropic "Contextual Retrieval" (2024) landed as a concrete, widely-adopted fix for lost-referent
  chunks:** prepend document context before embedding + BM25, and its reported failure-rate reductions
  (~35% contextual embeddings, ~49% adding contextual BM25, ~67% adding reranking) are frequently cited.
  It reinforced that chunking quality, not just the retriever, is often the bottleneck.
- **ColBERT (Khattab & Zaharia, SIGIR 2020) aged as the reference for late interaction** — more expressive
  matching at the cost of a larger, heavier index. That storage/latency tradeoff (partly addressed by
  ColBERTv2) is exactly why single-vector dense retrieval stayed the common default. Verified: all four
  named papers/venues (Lewis 2020, ColBERT 2020, RRF 2009, Contextual Retrieval 2024) check out — no canon
  corrections.
