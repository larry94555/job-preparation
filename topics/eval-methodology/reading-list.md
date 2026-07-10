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

## Reception & what aged
- **LLM-as-judge became the dominant reference-free scoring pattern — and its biases are now textbook.**
  Zheng et al.'s finding that GPT-4 agreed with humans ~85% (above human-human ~81%) legitimized the method,
  and it is now deployed across hundreds of production pipelines. But the *biases they flagged* — position,
  verbosity, self-enhancement — aged into the central caveat: 2025-26 stress tests (JudgeBiasBench, "Reliability
  without Validity") show frontier judges failing 50%+ of bias tests and flipping under trivial formatting
  changes, so "calibrate against humans before trusting a judge" is now standard advice, not a nice-to-have.
- **Chatbot Arena / Elo became the de-facto frontier leaderboard — then drew serious methodological fire.**
  It rebranded to LMArena and spun out as a company (2024), and billions in investment now track its scores. The
  2025 "Leaderboard Illusion" paper (Cohere Labs, AI2, Princeton, Stanford, Waterloo, UW) documented selective
  disclosure and private-variant testing; the Llama 4 launch exposed a leaderboard-vs-released model mismatch.
  What aged well: pairwise preference + Bradley-Terry. What aged poorly: treating one Overall number as
  procurement-grade truth.
- **HELM's "matrix, not one number" thesis held up and generalized.** The multi-metric, multi-scenario framing
  (accuracy + calibration + robustness + bias + toxicity + efficiency) is now the assumed shape of a serious
  eval, and CRFM keeps HELM alive as a living framework with refreshed scenarios (MMLU-Pro, GPQA, IFEval).
- **Contamination and construct validity moved from footnote to headline.** The concern that benchmarks leak into
  training data and that a benchmark may not measure what it claims is now a first-order reason teams build
  private, rotating golden sets rather than chase public leaderboards.
- **Sources:** [Zheng et al. 2023 (arXiv:2306.05685)](https://arxiv.org/abs/2306.05685);
  [Simon Willison — criticism of the Chatbot Arena](https://simonwillison.net/2025/Apr/30/criticism-of-the-chatbot-arena/);
  [LMArena response to "The Leaderboard Illusion"](https://lmarena.ai/blog/our-response/);
  [Reliability without Validity (arXiv:2606.19544)](https://arxiv.org/html/2606.19544v1);
  [stanford-crfm/helm](https://github.com/stanford-crfm/helm).
