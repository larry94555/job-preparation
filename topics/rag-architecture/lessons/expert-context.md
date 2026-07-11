# Expert context: papers, frontier & interview

## Papers people and the frontier

RAG architecture has a compact canon you should be able to name and summarize on demand:

- **RAG** (Lewis et al., FAIR, 2020) coined *retrieval-augmented generation* — pairing a parametric
  generator with a non-parametric retriever so the model conditions on fetched passages instead of
  relying on weights alone. This is the paper the term comes from.
- **ColBERT** (Khattab & Zaharia, 2020) introduced **late interaction**: instead of collapsing a query
  and document into one vector each, it keeps per-token embeddings and scores them with a fine-grained
  MaxSim interaction — more expressive than single-vector dense retrieval, cheaper than a full
  cross-encoder.
- **Reciprocal Rank Fusion** (Cormack et al., 2009) is the classic **rank-fusion** method that merges
  several ranked lists by summing `1/(k + rank)`. It needs no score calibration, which is why it's the
  default way to combine dense and BM25 (sparse) results in a hybrid pipeline.
- **Contextual Retrieval** (Anthropic, 2024) enriches each chunk with a short LLM-generated blurb
  situating it in its source document *before* embedding/indexing, reducing retrieval misses caused by
  chunks that lost their context.

Tools you'd reference: **FAISS, pgvector, Elastic/OpenSearch, Qdrant/Weaviate** for the index, and
rerankers like **bge** or **Cohere Rerank**. Current SOTA is **hybrid (dense + BM25) + fusion +
cross-encoder rerank**, plus contextual/agentic retrieval. Open problems experts still argue about:
**optimal chunking**, **retrieval for reasoning**, **freshness at scale**, and **eval fidelity**.

## Interviewing on RAG architecture

What a strong interviewer probes here:

- Can you **justify your chunking** — size, overlap, and structure-aware splitting — rather than
  defaulting to fixed-size naive chunks?
- Do you know **when hybrid beats dense**? Dense embeddings miss exact-keyword and rare-term matches
  that BM25 nails; fusing the two (via RRF) covers both, which is why dense-only pipelines underperform.
- Can you explain the **reranker's role** — that first-stage retrieval optimizes recall cheaply, and a
  cross-encoder reranker then reorders the top-k for precision?

**Red flags** that sink candidates: **fixed-size naive chunking**, a **dense-only** retriever, **no
reranker**, and a **stale index**. Asked to design a RAG system, lead with structure-aware chunking,
then **hybrid dense + BM25 retrieval fused with RRF**, then a **cross-encoder reranker** over the
top-k — and name **RAG (Lewis et al.)**, **ColBERT**, **RRF (Cormack)**, and Anthropic's **Contextual
Retrieval** as the prior art. Naming the canon *and* defending each pipeline choice is what reads as
senior.
