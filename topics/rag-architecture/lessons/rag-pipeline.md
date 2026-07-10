# RAG architecture — the pipeline

## What RAG is and when to use it

**Retrieval-augmented generation (RAG)** grounds the model in data it was never trained on. Instead
of relying on what's baked into the weights, the harness fetches relevant documents at query time
and puts them in the model's context, so the answer is grounded in *your* data.

Reach for RAG when the knowledge is:

- **Private** — internal wikis, contracts, tickets the model never saw.
- **Current / changing** — docs that update faster than you could ever retrain.
- **Citable** — you need to point the answer back at a specific source.

RAG is the **wrong** tool when you need a *behavior* change rather than *facts*. Retrieval supplies
context; it does not teach the model new skills, tone, or reasoning. Those call for fine-tuning or
prompting, not a vector index.

## The query-time pipeline

A classic RAG query flows through fixed stages:

1. **Embed the query** into the same vector space as your chunks.
2. **Retrieve candidates** — pull the most similar chunks (dense), and often keyword matches (sparse).
3. **Rerank** (optional) — reorder the candidates for precision.
4. **Assemble context** — take the top-k chunks, with their metadata, into the prompt.
5. **Generate** — the model answers grounded in that context.

Everything before generation is *offline* preparation: the corpus is split into chunks, each chunk is
embedded, and the vectors are stored in an index. The retrieval quality of the whole system is set by
those upstream choices — chunking and embeddings — long before any prompt is written.
