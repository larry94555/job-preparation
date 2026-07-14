# Evaluation & quality — expert context

## Is the judge any good?

An LLM-as-judge is only useful if you can trust its verdicts, and the senior move is to be *skeptical of
the judge itself*. A judge is a model, so it inherits the failure modes of models: it can be biased,
inconsistent, and confidently wrong — and if it is, every pass-rate built on it is quietly corrupted.
Before you gate deploys on a judge, you validate the judge.

- **Agreement with human labels.** The judge is trustworthy to the extent its verdicts *match a set of
  human-labeled examples*. You measure this the way you measure any classifier: label a sample by hand,
  run the judge on the same sample, and report agreement (accuracy against the human labels, or a
  correlation with human scores). A judge that disagrees with humans is not a judge — it is noise.
- **Known biases.** LLM judges have documented, reproducible biases: **position bias** (favoring the
  first answer in a pairwise comparison), **verbosity bias** (rating longer answers higher regardless of
  quality), and **self-preference** (a model rating its own family of outputs more highly). Naming these
  is what lets you control for them — randomize answer order, cap or normalize length, and prefer a judge
  from a different model family than the agent.
- **Calibration.** You pin the judge to a fixed model and check it against a **calibration set** of
  labeled exemplars — clear passes and clear fails — so a change to the judge (a new model, a reworded
  rubric) is caught when it stops reproducing the known verdicts. This is exactly what this repo's
  meta-eval gate does: every eval skill ships a calibration file of labeled cases, and the gate fails if
  the pinned judge no longer reproduces them. LLM-as-judge for open-ended outputs was popularized by
  **Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023)**, which both
  established the method and documented its biases.

Reliability at scale is the harder edge: a judge that agrees with humans on 200 calibration cases can
still drift on the long tail of real outputs. Knowing that a judge must be *measured, de-biased, and
calibrated* — not just trusted — is what separates a real eval harness from a number generator.
