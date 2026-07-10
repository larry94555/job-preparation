# Retrieval evals — the frontier and operating them in production

The deep-dive gave you the five levers. This lesson drills the two things that separate someone who
*knows* retrieval evaluation from someone who *runs* it: where the research edge actually is, and the
operational signals you watch once the eval is a live release gate.

## The retrieval-evals frontier

Recall@k tells you the right passage was in the window. It says nothing about whether the answer was
actually *supported* by that passage — and that gap is where the frontier lives.

- **Faithful-grounding metrics beyond recall.** The consensus criticism of ranked-list metrics is that a
  retriever can hit recall@k and still yield an ungrounded answer, so faithfulness/grounding metrics are
  now treated as mandatory, not optional. RAGAS popularized reference-free RAG-specific metrics
  (faithfulness, answer relevance, context precision/recall) that score the *components* rather than the
  final answer. The unsettled question is *how* to score faithfulness: an **NLI/entailment** model versus
  an **LLM-as-judge**. Neither is settled, and the load-bearing warning is that a confidently-scored
  faithfulness number can be more dangerous than an honest "unsure" — false precision hides the very
  regressions the eval exists to catch.
- **Cheap reliable labels vs. synthetic-label risk.** Human qrels are the gold standard and the
  bottleneck; they scale linearly with human hours. Synthetic/LLM-generated labels and queries make evals
  cheap and broad, but they **bake in the generator's blind spots** — if you never validate them against
  a human-labeled slice, your eval is measuring the judge, not the system. The frontier method is
  explicit: validate synthetic labels against human qrels *before* trusting them. The durable claim is
  that the true bottleneck in retrieval eval is still **label quality, not compute**.
- **BEIR / MTEB generalization.** BEIR (Thakur et al., 2021) exists because a retriever that wins on one
  corpus can lose badly out-of-domain, so it measures **zero-shot generalization** across many IR tasks
  rather than a single leaderboard number. MTEB (Muennighoff et al., 2022) made "which embedding model"
  an evaluable question across tasks — but it grades the **embedding, not the end-to-end answer**, so a
  strong MTEB score is necessary, not sufficient, for a good pipeline. Both inherit TREC's pooled-qrels
  tradition and its labeling-cost problem.
- **Attribution correctness at scale.** Per-claim span/entailment checks are tractable in the small; the
  frontier is making them **cheap and reliable over large corpora with stable judge agreement**. Watch
  for eval-of-the-eval work and **judge-agreement drift**, not blanket "our judge is calibrated" claims —
  the ask is evidence that the judge agrees with humans, measured, not asserted.

The reason to track this line: every frontier item attacks the same weakness — a score that *looks*
authoritative while quietly conflating retrieval quality, grounding, and label trust. An expert can say
which of these a given eval design is silently trading away.

## Operating retrieval evals in production

When the eval is a live release gate, you don't watch "eval quality" — you watch a handful of signals
that tell you whether the gate is still measuring the system rather than lying to you.

- **Recall@k and nDCG in prod.** Track the retriever's recall@k (did we catch the relevant doc in the top
  k) and nDCG (graded, position-discounted — is the *most* relevant doc ranked first) as first-class
  release metrics, not just offline curiosities. A "buried but present" regression moves nDCG/MRR while
  recall@k sits still; watching only recall@k hides ranking rot.
- **Grounding / faithfulness rate.** The share of answers actually entailed by their retrieved context.
  This is the signal that separates a retrieval miss (recall@k drops) from a grounding failure
  (faithfulness rate drops while recall@k holds) — the two have different fixes, and a single end-to-end
  number can't tell them apart.
- **Label-quality audits.** Periodically re-check a slice of your relevance labels — especially synthetic
  ones — against human judgment, and track judge-vs-human agreement over time. Falling agreement means
  your "ground truth" is drifting and the whole eval is quietly measuring the judge.
- **Eval-set drift.** A static golden set the system silently overfits to (teaching to the test) rots:
  passing scores stop predicting production quality. Watch for a widening gap between eval-set scores and
  real-world outcomes, refresh the set, and keep an adversarial slice for known failure modes.

The operational discipline: gate on **grounding/faithfulness rate and recall@k/nDCG together** so a miss
and a grounding failure stay distinguishable, and continuously **audit labels and refresh the set** —
because an eval that isn't validated against humans and kept current is measuring its own judge, not the
system it's supposed to protect.
