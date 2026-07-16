# Retrieval evals — metrics

## Why measure retrieval on its own

A RAG answer can be wrong for two very different reasons: the system never **fetched** the right
context, or it fetched it and then **ignored** it. End-to-end-only evals blur the two together. The
first job of retrieval evals is to score the retrieval stage in isolation, so a bad answer points you
at the *right* fix. That requires a labeled set: for each query, which documents are actually relevant.

## Recall@k, precision@k, and MRR

Three metrics do most of the work, all computed against the top-k retrieved results:

- **recall@k** = (relevant docs found in the top-k) / (total relevant docs). "Did we catch enough of
  what mattered?" If a query has 10 relevant docs and 4 land in the top-k, recall@k = 0.4.
- **precision@k** = (relevant docs in the top-k) / k. "How much of what we returned was useful?" It is
  the noise cost of the window.
- **MRR** (mean reciprocal rank) = the average of 1/(rank of the *first* relevant result) across
  queries. A relevant doc at rank 1 scores 1.0; at rank 2, 0.5; at rank 4, 0.25. MRR rewards getting a
  good result to the **top**, not just somewhere in the list.

The **recall/precision tradeoff** is structural: raise k and you can only find more of the relevant set
(recall rises or holds), but you usually admit more junk too (precision falls). recall@k and precision@k
are blind to *order* — a relevant doc at rank 1 and at rank k score identically. When the complaint is
"the right passage is there but buried," reach for an order-sensitive metric like **MRR** (or nDCG), and
the fix is often **reranking**.

These three metrics are the vocabulary every retrieval eval is built on: getting them right is what lets
you blame a bad answer on the *right* stage instead of guessing.
