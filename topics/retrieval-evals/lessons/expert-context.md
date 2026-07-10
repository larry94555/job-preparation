# Expert context: papers, frontier & interview

## Papers people and the frontier

Retrieval evals is where you prove that retrieval actually helped — and the canon here is a short list
of frameworks and benchmarks you should be able to name and place in an interview:

- **RAGAS** (Exploding Gradients, 2023) provides **RAG-specific evaluation metrics** — faithfulness,
  answer relevance, context precision/recall — so you can score a RAG pipeline's components rather than
  only its final answer. It's the framework people reach for when they want grounding/faithfulness
  numbers.
- **BEIR** (Thakur et al., 2021) is the standard **heterogeneous retrieval benchmark**: a suite of
  diverse IR tasks used to test how well a retriever generalizes zero-shot across domains.
- **MTEB** (Muennighoff et al., 2022) is the **embedding benchmark** — the massive text-embedding
  leaderboard people cite when comparing embedding models across many tasks.
- **TREC** is the classic **IR relevance methodology**: the pooled-judgment, human-labeled relevance
  tradition that modern retrieval evaluation inherits (qrels, graded relevance, pooling).

Tools you'd reference: **RAGAS, TruLens, promptfoo**, and custom harnesses. Current SOTA is
**component-isolated evals** — measuring retrieval (recall@k, precision@k, MRR/nDCG) separately from
generation, plus **grounding/faithfulness** checks and **attribution** correctness. Open problems experts
still argue about: **faithful grounding metrics**, getting **cheap reliable labels**, and **attribution
correctness at scale**.

## Interviewing on retrieval evals

What a strong interviewer probes here:

- Can you **separate a retrieval miss from a grounding failure**? If the answer is wrong, is it because
  the right passage was never retrieved (a recall@k problem) or because the model ignored/contradicted a
  passage that *was* in context (a grounding problem)? Diagnosing the layer is the core skill.
- Can you **pick the right metric** for the question — recall@k vs. precision@k vs. MRR/nDCG for
  retrieval, faithfulness/grounding for generation, and attribution for citation correctness?
- Do you know where the canon fits — **RAGAS** for RAG-specific metrics, **BEIR** for retrieval
  benchmarking, **MTEB** for embedding comparison, **TREC** for relevance methodology?

**Red flags** that sink candidates: relying on **end-to-end-only evals** (a single pass/fail on the final
answer), **conflating retrieval and generation errors**, and grading on unlabeled **"vibes"** with no
golden set. Asked to design a retrieval eval, lead with **component isolation** — score retrieval and
generation separately — then add **grounding/faithfulness** and **attribution** checks over a **labeled**
set, and name **RAGAS/BEIR/MTEB** as the prior art. Showing you can localize a failure to the right
layer *and* choose the metric that catches it is what reads as senior.
