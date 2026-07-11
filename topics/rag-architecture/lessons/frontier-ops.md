# RAG architecture — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
RAG from someone who *runs* it at the frontier: the current research edge, and the operational signals
you watch when it's live.

## The rag-architecture frontier

Four research directions are where RAG work is actually moving right now.

- **GraphRAG / retrieval-for-reasoning.** Classic RAG retrieves a flat top-k of passages and hopes the
  answer is spread across them. The frontier replaces that with **structured, multi-hop retrieval over
  a graph** — entities and relations extracted from the corpus — so a query that spans documents can be
  *assembled* rather than hoped for. The load-bearing point: this targets questions a single retrieval
  step cannot answer, where the evidence lives in the *connections* between passages, not in any one
  passage. The open question is exactly when the structure earns its build-and-maintenance cost — a
  graph you extract and keep current is a real recurring bill, so GraphRAG wins on genuinely multi-hop,
  cross-document reasoning and is over-engineering on lookup-style queries.

- **Contextual Retrieval as the index-time frontier.** Anthropic's **Contextual Retrieval** (2024)
  attacks the chunking problem *at index time*: prepend a short document-situating summary to each chunk
  before embedding, so a fragment retrieves on its own meaning instead of stranding a fact from what
  explains it. The mental model to carry: the failure it fixes is chunks that lost their referents, and
  it pays for that with **one LLM call per chunk at index time** — a cost you spend once at build, not
  per query. It is the counterpart to graph structure: enrich the chunk vs. connect the chunks.

- **Agentic / iterative retrieval.** The frontier is moving from **one-shot** retrieval toward loops
  that **rewrite the query, retrieve, inspect, and retrieve again**. Instead of a single vector lookup,
  the system issues multiple queries and iterates until it has enough evidence. This buys recall on hard
  queries the first query phrases badly, at the cost of extra latency and retrieval calls per answer.

- **Freshness and eval fidelity at scale.** Keeping large indexes current, and *proving* these newer
  techniques actually win, are open problems the field explicitly flags. The hard part of agentic and
  graph retrieval is rarely demoing that they run — it is eval fidelity: showing they beat plain hybrid
  + rerank on a labelled set, and separating a retrieval miss from a grounding failure when they don't.

The reason to track this line specifically: GraphRAG, Contextual Retrieval, and agentic loops all attack
the *same* limitation of flat top-k retrieval — that a single lookup often can't assemble the answer —
from different angles (**connect the chunks**, **enrich each chunk**, **retrieve again**). An expert can
say which one a given workload should reach for first, and can name the eval that would prove it.

## Operating RAG in production

When it's live, you don't watch "RAG" — you watch a handful of signals that tell you whether retrieval
is healthy and where the next quality wall is.

- **Retrieval hit rate / recall@k in production.** The headline gauge: on real traffic, is the
  gold/relevant passage actually landing in the top-k the generator sees? A falling recall@k is the
  leading indicator of a retrieval-side regression — a bad re-index, an embedding-model swap, or drifting
  queries — and it shows up *before* users complain, if you measure it. This is the signal that separates
  a retrieval miss from a generation problem.
- **Reranker latency.** The cross-encoder is the slow stage, and its latency scales with the
  **candidate-set size**, not the corpus. Watch p95 rerank latency and the candidate-set width together:
  widening the first stage buys recall but taxes latency, and a rerank latency creep is usually someone
  quietly enlarging k. This is the knob you alert on when TTFT drifts.
- **Index freshness / staleness.** How far behind the live corpus the index has fallen — re-index lag,
  TTL expiry, incremental-update backlog. A stale index serves confidently wrong answers that **no eval
  on the model will catch**, because the model is faithfully grounding on out-of-date passages. Freshness
  is a signal you must monitor explicitly; it is invisible in generation-quality metrics.
- **Grounding / citation rate.** The share of answers actually supported by (and citing) the retrieved
  passages. A low grounding rate with *good* retrieval means the generator is going off-context — a
  faithfulness failure, not a retrieval one. Tracking grounding alongside recall@k is how you tell the
  two apart in production instead of guessing.

The operational discipline: alert on **recall@k and reranker latency** (leading indicators of retrieval
regressions), monitor **index freshness explicitly** because model-side evals are blind to it, and use
**grounding rate vs. recall@k together** to localize a bad answer to retrieval or to generation — never
reason about RAG quality from a single end-to-end score that hides which stage failed.
