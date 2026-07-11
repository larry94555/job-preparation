# Retrieval evals — architecture, tradeoffs, and reviewing a design

You already know the metrics (recall@k, precision@k, MRR, nDCG), the frameworks (RAGAS, BEIR, MTEB,
TREC), and the core split between a **retrieval miss** and a **grounding failure**. This lesson zooms
out to the **design space**: the levers an eval engineer actually pulls when building a RAG evaluation
harness, what each one trades away, and how to judge someone else's eval design the way an interviewer
or a staff engineer in a design review would.

## The retrieval-evals design space

Every retrieval-eval decision is really a decision about **how confidently, and how cheaply, you can
localize a bad answer to the right stage and catch a regression before it ships**. There are five
independent levers, and real harnesses combine them:

- **Isolation** — **end-to-end** scoring vs. **component-isolated** scoring. End-to-end gives you one
  pass/fail on the final answer; it is cheap but conflates a retrieval miss with a grounding failure so
  you cannot tell which stage to fix. Component isolation scores the retriever (recall@k, precision@k,
  MRR/nDCG) separately from generation (faithfulness, grounding) — this is the single biggest structural
  lever and the thing that reads as senior.
- **Labels** — where relevance judgments come from: **human qrels** (TREC-style pooled judgments),
  **synthetic/LLM-generated** relevance labels, or **implicit** signals (clicks, thumbs). Human labels
  are the gold standard and the bottleneck; synthetic labels scale but need spot-checking against humans.
- **Retrieval metric choice** — **recall@k** (did we catch it?), **precision@k** (how noisy is the
  window?), **MRR** (how high is the *first* hit?), **nDCG** (graded, position-discounted relevance).
  The metric must match the complaint: "buried but present" is an order problem (MRR/nDCG), not a recall
  problem.
- **Grounding & attribution judging** — how you score whether the answer used the context: an **NLI /
  entailment model**, an **LLM-as-judge**, or **human review**. Attribution adds a stricter, per-claim
  span check on top of grounding.
- **Gating** — what the eval is wired into: a one-off **report**, a **CI regression gate** on a golden
  set, or an **adversarial suite**. An eval that isn't gating anything drifts and rots.

## A tradeoff table for retrieval-evals

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| End-to-end-only eval | Cheap, one number, trivial to wire up | Conflates retrieval vs. grounding; can't localize a failure | Earliest prototype, smoke tests only |
| Component-isolated eval | Localizes the failing stage; the right fix becomes obvious | Two harnesses + a labeled relevance set to maintain | Any RAG system you intend to iterate on |
| Human-labeled golden set (TREC-style) | Trustworthy relevance judgments; a stable baseline | Slow, expensive, hard to scale coverage | High-stakes domains; the CI regression gate |
| Synthetic / LLM-generated labels | Cheap coverage across many queries fast | Judge bias and noise; needs human spot-checks | Bootstrapping labels; broad low-stakes coverage |
| Order-sensitive metric (MRR / nDCG) | Catches "right passage buried down-rank" | Needs graded/positional judgments, not just binary | The complaint is ranking, and reranking is the fix |
| Grounding/attribution judge (RAGAS/NLI) | Faithfulness + per-claim citation correctness | Judge cost and calibration; false-precision risk | Cited answers; faithfulness is a product requirement |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "we'll just check if the answer looks right" without naming
component isolation, the labeled set, and the metric they'd track is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any eval subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** a small human-labeled golden set with **component-isolated**
  retrieval metrics (recall@k, precision@k, MRR) scored separately from a generation faithfulness check,
  run as a report before releases. This is a perfectly good baseline and already beats vibes.
- **SOTA (frontier, worth reaching for):** component-isolated evals **plus** grounding/faithfulness
  **plus** per-claim attribution correctness, judged by a **calibrated** LLM-judge (or NLI model) whose
  agreement with humans is itself measured, all wired into a **CI regression gate** on a curated golden
  set with an **adversarial suite** for known failure modes. RAGAS supplies RAG-specific metrics; BEIR
  and MTEB benchmark the retriever/embedding component zero-shot. The frontier is treating the eval as
  the *release gate* of the whole pipeline, not a post-hoc report.
- **Antipattern (looks fine, fails in production):** **end-to-end-only** evals that conflate retrieval
  and generation errors; grading on unlabeled **"vibes"** with no golden set; an **uncalibrated
  LLM-judge** trusted blindly; a **static, stale** set that the system silently overfits to (teaching to
  the test); and counting citations instead of verifying that each cited span actually entails its
  claim. Each of these passes a demo and hides regressions in production.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Judge calls dominate the token budget.** An LLM-as-judge grounding/attribution check costs one (or
  more) model calls *per evaluated answer* — often more tokens than generating the answer, because the
  judge re-reads the full retrieved context plus the answer. A 10,000-query nightly suite that judges
  every answer with a large model is a real bill; sampling, caching judgments, and using a smaller
  calibrated judge are the levers.
- **Labels are the true bottleneck, not compute.** Retrieval metrics are cheap to compute but only as
  good as the relevance labels behind them. Human qrels scale linearly with human hours; synthetic
  labels scale cheaply but must be validated against a human-labeled slice or the whole eval is
  measuring the judge, not the system.
- **Component isolation costs an extra pass but saves debugging time.** Scoring retrieval and generation
  separately means maintaining a labeled relevance set *and* a faithfulness judge — roughly double the
  harness. The payoff is that a regression points at the stage to fix instead of triggering a blind hunt.
- **Adversarial and long-tail coverage scales sub-linearly with value.** A handful of well-chosen hard
  cases (multi-hop, distractor-heavy, near-duplicate contexts) catches more real regressions than
  thousands of easy queries — but they are the expensive ones to label.

## Reviewing a retrieval-evals design

When you are handed a retrieval-eval design to critique — in a review or an interview — walk the same
checklist:

1. **Is it component-isolated?** If the only signal is a single end-to-end pass/fail, stop there; it
   cannot tell a retrieval miss from a grounding failure and every fix is a guess.
2. **Where do the labels come from?** No labeled relevance set means the retrieval metrics are
   unfalsifiable "vibes." Synthetic labels with no human spot-check means you're grading the judge.
3. **Does the metric match the complaint?** "Buried but present" needs MRR/nDCG, not recall@k; a noisy
   window needs precision@k. A single metric for every failure mode is a flag.
4. **Is the grounding/attribution judge calibrated?** An LLM-judge whose human agreement is unmeasured,
   or attribution scored by *counting* citations rather than a per-claim span/entailment check, is false
   precision.
5. **What is it gating, and does it drift?** A real design wires the eval into a CI regression gate on a
   maintained golden set with an adversarial slice — never a one-off report on a stale set the system has
   overfit to.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A **toy** grades on vibes with no labels; a **prototype** has a labeled set and end-to-end
metrics; a **demo-ready** design isolates retrieval from grounding with the right per-stage metrics; a
**production-ready** design also adds calibrated grounding/attribution judging, wires it into a CI
regression gate on a maintained golden set, and covers known failure modes with an adversarial suite.
