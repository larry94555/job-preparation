# Reading list & staying current — retrieval-evals

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **Recall@k / precision@k / MRR — the ranked-list metric family.** The load-bearing distinction: same
  numerator (relevant docs retrieved), different denominators. Notice recall@k asks "did we get them all
  in the top k," precision@k asks "how much of the top k was signal," and MRR asks "how high was the
  first hit" — a "buried but present" complaint is an MRR problem, not a recall one.
- **nDCG — graded, position-discounted relevance.** The metric to reach for when relevance is not binary
  and rank order matters. Notice it rewards putting the *most* relevant doc first, unlike recall@k which
  is blind to order within the top k — this is the single most important read for grading retrieval quality.

## Go deeper (benchmarks & RAG-specific metrics)
- **BEIR — Thakur et al. (2021).** The zero-shot retrieval benchmark spanning many tasks/domains. Notice
  it exists because a retriever that wins on one corpus can lose badly out-of-domain — generalization,
  not a single leaderboard number, is the point.
- **MTEB — Muennighoff et al. (2022).** The massive embedding benchmark that made "which embedding model"
  an evaluable question across tasks. Notice it evaluates the embedding, not the end-to-end RAG answer —
  a strong MTEB score is necessary, not sufficient, for a good pipeline.
- **RAGAS — Exploding Gradients (2023).** The source of RAG-specific metrics: faithfulness, answer
  relevance, context precision/recall. Notice it splits the eval by *component* — retrieval quality and
  grounding are measured separately, which is exactly how you tell a retrieval miss from a grounding failure.
- **TREC — the classic IR relevance methodology.** The pooled-qrels tradition underneath all of the above.
  Notice how relevance judgments (qrels) are built and why pooling matters — modern benchmarks inherit
  both the method and its labeling-cost problem.

## Frontier — what to watch
- **Faithful grounding metrics as an open problem.** Measuring whether an answer is actually supported by
  the retrieved context, without false precision. Watch the NLI-entailment vs. LLM-judge tension — neither
  is settled, and a confidently-scored faithfulness number can be more dangerous than an honest "unsure."
- **Attribution correctness at scale.** Per-claim span checks are tractable in the small; the frontier is
  cheap, reliable labels and stable judge agreement over large corpora. Watch for eval-of-the-eval work
  and judge-agreement drift, not blanket "our judge is calibrated" claims.
- **Synthetic-label quality and validation.** Generated labels/queries make evals cheap but can bake in the
  generator's blind spots. Watch for methods that validate synthetic labels against human qrels before
  trusting them — the true bottleneck in retrieval eval is still label quality, not compute.

## Tools & implementations worth reading
- **RAGAS, TruLens, promptfoo** — the eval stacks that operationalize component-isolated retrieval and
  grounding metrics. Reading RAGAS's metric definitions is the fastest way to turn faithfulness/context-
  precision from words into concrete, wired-up scores.
- **Custom harnesses + a CI regression gate.** The most instructive read is often your own golden set plus
  the gate that fails a PR when recall@k or faithfulness regresses — that wiring is where eval theory
  meets production.

## How to stay current on this topic
- Track **BEIR / MTEB** leaderboards and their task additions — new domains and retrievers land there first,
  and shifts tell you where "generalization" is currently breaking.
- Follow **RAGAS / TruLens / promptfoo** repos and release notes — new RAG-specific metrics and judge
  calibration features ship in code before they're written up.
- When a new eval metric or judge appears, ask the three canon questions: *what does it measure that the
  old metric missed, what labels does it require, and what proves the judge agrees with humans?* — the same
  lens the deep-dive lesson uses. Above all, keep asking whether a score is separating retrieval from
  grounding or quietly conflating them.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **"Recall@k alone is insufficient" became the consensus criticism.** The field converged on the view that
  a retriever can hit recall@k and still produce ungrounded answers — which is why grounding/faithfulness
  metrics (not just ranked-list metrics) are now considered mandatory for RAG eval. Canon's "separate a
  retrieval miss from a grounding failure" is the standard framing.
- **BEIR (Thakur et al., 2021) aged into the default zero-shot retrieval benchmark** and MTEB (Muennighoff
  et al., 2022; note the paper carries a 2023 venue date) into the default embedding leaderboard — later
  extended by MMTEB (multilingual). The durable lesson held: a strong MTEB score is necessary but not
  sufficient, because it grades the embedding, not the end-to-end answer.
- **RAGAS (Exploding Gradients, 2023) popularized component-isolated, reference-free RAG metrics**
  (faithfulness, answer relevance, context precision/recall) and became the most-cited RAG eval framework.
  What aged into criticism: its LLM-judge-based faithfulness scoring inherits judge bias and cost, so it is
  now treated as a signal to validate, not a ground truth.
- **The judge tension (NLI-entailment vs. LLM-judge) stayed unresolved,** as canon claims. Faithfulness
  measurement, cheap reliable labels, and judge-agreement drift remain open; "our judge is calibrated"
  claims are met with demands for eval-of-the-eval evidence.
- **TREC's pooled-qrels methodology aged as the acknowledged ancestor** of all the above — modern benchmarks
  inherited both its pooling method and its labeling-cost problem, which is why synthetic-label quality is
  now the live bottleneck. Verified: RAGAS 2023, BEIR 2021, MTEB (Muennighoff), and TREC framing all check
  out — no canon corrections.
