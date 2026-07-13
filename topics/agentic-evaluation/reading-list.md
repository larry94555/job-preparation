# Reading list & staying current — agentic-evaluation

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" (2023).** The paper that
  popularized using a strong model as an automated judge for open-ended output. Notice both halves: the
  method *works* (high agreement with human preference) **and** it has documented biases — position,
  verbosity, and self-preference — which is why you validate the judge before trusting it.
- **G-Eval and rubric/criteria-based grading.** Framing grading as scoring against explicit, named
  criteria rather than a single "is this good?" call. Notice that explicit criteria plus a strict-JSON
  verdict are what make a judgment reproducible and *aggregatable* into a pass-rate.

## Go deeper (suites, regressions & gates)
- **Eval suites & regression testing for LLM systems.** Treat the eval suite as the agent's test suite:
  a fixed set of cases run on every change, summarized by a pass-rate, with the failed inputs reported.
  Notice the discipline is the same as software regression testing — you run it *before* you ship and gate
  the release on it, not after an incident.
- **"Never deploy below X" — the deploy-gate pattern.** The operational rule that turns a number into a
  guardrail: a mechanical threshold check that blocks a sub-bar release with no discretionary bypass.
  Notice why the bypass is the whole danger — an exception that can be waved through under deadline always
  gets taken.
- **Judge bias & position bias.** The literature on how LLM judges can be gamed or skewed (favoring the
  first option, longer answers, or their own model family). Notice the mitigations: randomize order,
  normalize length, prefer a judge from a different model family, and re-check against human labels.

## Frontier — what to watch
- **Agent benchmarks: SWE-bench, τ-bench, and tool-use suites.** The shift from grading a single response
  to grading whether an agent *completed a real task* end to end. Notice what a final-state pass/fail
  *hides* — the path the agent took — which is why trajectory evaluation exists.
- **Trajectory evaluation.** Grading the *sequence* of tool calls a multi-step agent takes, not just its
  last message. Notice it is much harder than scoring an answer and is an active research edge, not a
  settled metric.
- **Judge reliability at scale.** Keeping a calibrated LLM judge honest across the long tail of real
  outputs — re-calibrating, de-biasing, and sampling for human review. Notice that agreement on 200
  calibration cases does not guarantee agreement on the next 20,000.

## How to stay current on this topic
- Follow new **agent benchmarks** (SWE-bench and successors, tool-use / trajectory suites) — task-completion
  scoring is where the eval frontier moves first.
- Track work on **judge bias and calibration** — position/verbosity/self-preference mitigations and how to
  audit a judge against human labels at scale.
- When a new eval technique appears, ask: *what does it actually measure, how is the judge validated, and
  does it catch regressions?* — the same lens the frontier lesson uses.
- This repo's own **meta-eval gate** is a live worked example: LLM-as-judge + calibration sets + a CI
  threshold. Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your
  next reads.
