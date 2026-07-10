# Expert context: papers, frontier & interview

## Papers people and the frontier

Eval methodology has a compact canon you should be able to name and summarize in an interview:

- **LLM-as-judge, MT-Bench, and Chatbot Arena** (Zheng et al., LMSYS, 2023) popularized using a
  strong model to grade open-ended answers, plus two evaluation vehicles: **MT-Bench** (curated
  multi-turn questions scored by an LLM judge) and **Chatbot Arena** (crowd-sourced **pairwise**
  battles with Elo-style rankings). This work also documented judge **biases** — position,
  verbosity, and self-preference — that you must control for.
- **HELM** (Liang et al., **Stanford CRFM**, 2022) — Holistic Evaluation of Language Models — argued
  for **holistic** measurement across many scenarios and metrics (accuracy, robustness, calibration,
  bias, efficiency) rather than a single leaderboard number.
- Practitioner writing to know by name: **Hamel Husain** and **Eugene Yan**, who push the discipline
  of looking at your data, building domain-specific golden sets, and calibrating judges against human
  labels instead of trusting "vibes."

Tools you'd reference: **promptfoo, OpenAI Evals, LangSmith, Braintrust, Inspect**. Current SOTA is
curated **golden sets + CI regression gates + adversarial suites + a calibrated LLM-as-judge**. Open
problems experts still argue about: **trustworthy cheap judges**, **contamination** (test data leaking
into training), and **benchmark construct validity** (whether a benchmark measures what it claims).

## Interviewing on eval methodology

What a strong interviewer probes here:

- Can you say **when LLM-as-judge is appropriate** — and when it is not? A judge is fine for
  open-ended quality comparisons but must be **calibrated** against human labels and checked for
  position/verbosity/self-preference bias.
- Do you treat evals as the **core discipline** — curated golden sets, **CI regression gates** that
  block a merge on a metric drop, adversarial suites for known failure modes?
- Can you distinguish **MT-Bench-style** absolute scoring from **Chatbot Arena** pairwise/Elo
  ranking, and name **HELM** as the holistic-benchmark reference?

**Red flags** that sink candidates: shipping on **vibes** with no golden set, **teaching to the test**
(overfitting the eval set), trusting an **uncalibrated judge**, or letting golden sets go **stale**.
Asked to design an eval strategy, lead with a **golden set + regression gate**, add **adversarial
coverage**, then reach for a **calibrated LLM-as-judge** for the open-ended slices — and name
**MT-Bench/Chatbot Arena (Zheng et al./LMSYS)** and **HELM (Liang et al., Stanford CRFM)** as the
canon. Showing you know the literature *and* can gate a regression is what reads as senior.
