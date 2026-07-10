# Reading list & staying current — eval-methodology

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **LLM-as-judge, MT-Bench & Chatbot Arena — Zheng et al. (LMSYS, 2023).** The paper that made "use a strong
  model to grade outputs" a measurable method, paired with a curated multi-turn benchmark (MT-Bench) and a
  crowd-preference arena (Chatbot Arena). Notice the *documented judge biases* — position, verbosity,
  self-preference — and that this is the single most important read for the topic.
- **HELM — Liang et al. (Stanford CRFM, 2022).** The holistic-evaluation reference: score models across many
  scenarios and metrics, not one leaderboard number. Notice the move from a single accuracy figure to a
  *matrix* of scenario × metric, and why breadth exposes construct-validity gaps.

## Go deeper (mechanism & method)
- **Practitioner canon — Hamel Husain, Eugene Yan.** The working-engineer counterweight to benchmarks:
  *look at your data*, build domain golden sets, and calibrate a judge against humans before trusting it.
  Notice that most real eval wins come from data inspection, not a fancier judge.
- **Curated golden sets + CI regression gates.** The core production loop: a versioned golden set turns
  quality into a repeatable number, and a regression gate fails the build when the number drops. Notice the
  gate placement and the pass-rate denominator — the details that decide whether the gate is honest.

## Frontier — what to watch
- **Trustworthy cheap judges (calibrated LLM-as-judge).** The open question is whether a small/cheap judge can
  match a strong one after rubric decomposition and κ-agreement checks. Watch for *calibration evidence*, not
  raw judge scores.
- **Eval-set drift & contamination.** As benchmarks leak into training data, static sets go stale and
  "improvements" can be memorization. Watch for held-out/rotating sets and contamination audits.
- **Benchmark construct validity.** The frontier is asking whether a benchmark measures the capability it
  claims to. Watch for adversarial suites and scenario coverage over a single headline score.

## Tools & implementations worth reading
- **promptfoo, OpenAI Evals, LangSmith, Braintrust, Inspect** — the harnesses that run golden sets, wire up
  LLM-as-judge, and gate regressions in CI. Reading how one of them structures a test case + assertion is the
  fastest way to turn the method into real code.

## How to stay current on this topic
- Follow the **LMSYS / Chatbot Arena** leaderboard and the **Stanford CRFM / HELM** releases — the benchmark
  frontier moves there first.
- Track **promptfoo / OpenAI Evals / Inspect** repos and release notes — new judge and gating features land in
  code before they land in papers.
- Read **Hamel Husain** and **Eugene Yan** for the practitioner view on data-first evals and judge calibration.
- When a new eval or benchmark appears, ask the three canon questions: *what does it trade (cost/fidelity/
  coverage), what regime does it win in, and is its judge calibrated?* — the same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
