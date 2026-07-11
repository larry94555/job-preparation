# RAG — architecture, tradeoffs, and reviewing a design

You already know what RAG is, how to chunk a corpus, and how dense, sparse, and hybrid retrieval feed
a reranker. This lesson zooms out to the **design space**: the levers a retrieval engineer actually
pulls, what each one trades away, and how to judge someone else's RAG design the way an interviewer
or a staff engineer in a design review would.

## The rag-architecture design space

Every RAG decision is really a decision about **what lands in the model's context window, how
relevant it is, and how fresh and attributable it stays** — at a fixed latency and cost budget. There
are five roughly independent levers, and real systems combine them:

- **Chunking** — fixed-size character splits vs. **structure-aware** splitting on headings, paragraphs,
  and tables, with a small overlap and useful metadata. Chunk size is a precision-vs-context dial:
  large chunks carry more surrounding context but dilute the embedding; small chunks are sharp but can
  strand a fact from what explains it. This is chosen at *index* time and is expensive to change later.
- **Retrieval method** — **dense** (embedding) vs. **sparse** (BM25) vs. **hybrid**. Dense captures
  paraphrase and semantic similarity; sparse catches exact keywords, IDs, and rare terms; hybrid runs
  both and **fuses** the ranked lists — e.g. **Reciprocal Rank Fusion (RRF)**, which combines by rank
  position rather than incomparable raw scores. Late-interaction retrieval (**ColBERT**) sits between
  the two, scoring token-level interactions.
- **Reranking** — a **cross-encoder reranker** (bge, Cohere Rerank) that jointly scores each
  query–document pair for higher precision than a single-vector comparison. It is accurate but slow,
  so it runs only on a small first-stage candidate set, not the whole corpus.
- **Context enrichment** — plain chunks vs. **Contextual Retrieval**, which prepends a short
  chunk-situating summary before embedding so an isolated chunk still carries its document context.
  This lifts recall on chunks that would otherwise be ambiguous out of context.
- **Freshness** — how the index is kept current: re-index cadence, TTLs, and incremental updates. A
  stale index silently serves wrong answers no eval on the model will catch.

## A tradeoff table for rag-architecture

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Fixed-size naive chunking | Trivial to implement, uniform chunks | Cuts through sentences/tables, strands boundary facts, poor recall | Throwaway prototypes on flat prose only |
| Structure-aware chunking + overlap | Coherent chunks, recoverable boundary facts | Parser complexity, some duplicated tokens | Any real corpus with headings, tables, structure |
| Dense-only retrieval | Semantic/paraphrase recall, simple stack | Misses exact IDs, codes, rare terms; scale-sensitive | Purely semantic queries, no exact-match needs |
| Hybrid (dense + BM25) + RRF | Best of lexical + semantic, robust recall | Two indices to run and fuse, more moving parts | Mixed queries (keywords *and* meaning) — most production |
| Cross-encoder reranker | Higher precision top-k ordering | Added latency; must cap candidate set | Precision matters and first-stage recall is decent |
| Contextual Retrieval | Better recall on context-poor chunks | One LLM call per chunk at index time, cost | Chunks are ambiguous alone; retrieval misses are recall-bound |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just use embeddings and top-k" without naming the exact-match
gap, the reranker, or freshness is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** structure-aware chunking with overlap + dense retrieval +
  top-k into context, on a periodically re-indexed store. This is a perfectly good baseline and
  handles a large fraction of real workloads.
- **SOTA (frontier, worth reaching for under real pressure):** **hybrid** dense + BM25 retrieval with
  **RRF fusion**, a **cross-encoder reranker** over a widened first-stage candidate set, **Contextual
  Retrieval** for chunk enrichment, and, increasingly, **agentic retrieval** where the system issues
  multiple queries and iterates. The frontier treats retrieval as a *precision-and-recall pipeline*
  with an explicit freshness policy, not a single vector lookup.
- **Antipattern (looks fine, fails in production):** naive fixed-size chunking that severs coherent
  units; **dense-only** retrieval that whiffs on exact IDs and rare terms; **no reranker**, so top-k
  is whatever the first stage happened to surface; and a **stale index** that serves confidently wrong
  answers. Each passes a demo and degrades quietly under real, varied traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Context is a ranked budget, not a bucket.** You retrieve top-k chunks into a finite window, so
  precision at small k matters more than raw recall. Stuffing 50 mediocre chunks both dilutes the
  answer and burns tokens; a reranker that lifts the right 5 into the top of the window is worth more
  than a bigger k.
- **Reranking cost scales with candidate-set size, not corpus size.** A cross-encoder is too slow to
  score the whole corpus, so a cheap first stage narrows to (say) top-100 and the reranker reorders
  just those. Widening the candidate set trades latency for recall; that knob is the main lever on
  rerank cost.
- **Hybrid doubles index cost but de-risks recall.** Running dense *and* sparse means two indices and
  a fusion step, but it is what stops an exact identifier query from silently returning nothing — a
  failure dense-only hides until a user hits it.
- **Freshness is a throughput/cost tax you choose.** Re-indexing more often keeps answers current but
  costs embedding compute; TTLs and incremental updates let you spend that budget where the corpus
  actually changes rather than re-embedding everything.

## Reviewing a rag-architecture design

When you are handed a RAG design to critique — in a review or an interview — walk the same checklist:

1. **How is the corpus chunked?** Fixed-size character splitting on structured docs is an immediate
   flag; look for structure-aware splitting with overlap and metadata.
2. **Dense-only or hybrid?** Dense-only in a corpus with IDs, codes, or rare terms will miss
   exact-match queries; hybrid + fusion is the production default.
3. **Is there a reranker, and over how many candidates?** No reranker means top-k is unfiltered
   first-stage output; a reranker with too small a candidate set can't recover recall the first stage
   dropped.
4. **How is context assembled and bounded?** Is k tuned, are chunks deduplicated, is anything done for
   context-poor chunks (enrichment)? Over-retrieval both dilutes and costs.
5. **How does the index stay fresh?** A real design names its re-index cadence / TTL and what happens
   when the corpus changes — never "it just works."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy dumps whole docs in the prompt; a prototype chunks and does dense top-k; a demo adds
hybrid + a reranker; a production-ready design also enriches context, bounds and tunes k, and names an
explicit freshness policy.
