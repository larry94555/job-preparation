# Eval methodology — architecture, tradeoffs, and reviewing a design

You already know the pieces: golden sets as ground truth, regression gates in CI, adversarial suites
for coverage, and calibrated LLM-as-judge for open-ended outputs. This lesson zooms out to the
**design space**: the levers an eval engineer actually pulls, what each one trades away, and how to
judge someone else's eval design the way an interviewer or a staff engineer in a design review would.

## The eval-methodology design space

Every eval decision is really a decision about **how trustworthy a quality signal you get, and at
what labeling cost, latency, and risk of gaming**. There are five independent levers, and real
eval suites combine them:

- **Scoring method** — **deterministic checks** (exact match, regex, schema, unit assertions) vs.
  **model-graded** (LLM-as-judge) vs. **human labels**. Deterministic is cheap, unbiased, and
  repeatable but only works where correctness is a string or a predicate. Judges scale to open-ended
  text but introduce bias and cost. Humans are ground truth but don't scale to every commit.
- **Dataset composition** — a happy-path **golden set** vs. **adversarial/edge-case** suites vs.
  **held-out** rotation. The golden set anchors typical behavior; adversarial suites sample the
  failure modes production actually hits (injection, ambiguity, boundaries); held-out cases detect
  teaching-to-the-test.
- **Gate placement** — where the eval runs: **local**, a **CI regression gate**, or a **canary** in
  production. Earlier gates are cheaper and block bad changes; canaries catch what offline sets miss.
- **Judge calibration** — treating an LLM judge as an *opinion* vs. a *measured instrument*. The
  lever is whether you've measured judge-vs-human agreement (e.g. κ) before letting it gate.
- **Freshness** — a **static** set frozen at authoring time vs. **living** data fed from real
  production failures. Static sets go stale and stop reflecting usage; living sets stay honest but
  need curation and de-duplication.

## A tradeoff table for eval-methodology

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Deterministic checks (exact/regex/schema) | Cheap, unbiased, fully repeatable, fast | Only works where correctness is a string/predicate; misses semantic quality | Structured outputs, classifications, anything with a canonical answer |
| LLM-as-judge (calibrated) | Scales to open-ended text where exact match fails | Position/verbosity/self-preference bias; cost; must be calibrated to trust | Free-form answers, no single gold string, rubric can be decomposed |
| Golden set + CI regression gate | Repeatable number, blocks silent regressions on every change | Only covers sampled cases; overfits if never rotated | The always-on baseline for any LLM system |
| Adversarial / edge-case suite | Catches failure modes the happy path misses | Expensive to author; needs real-failure mining | Golden set passes but production still breaks |
| Human-labeled calibration set | Ground truth to calibrate judges and hard cases against | Doesn't scale to every commit; labeling latency | Establishing judge trust; grading genuinely ambiguous cases |
| Living / rotating dataset | Stays representative; detects teaching-to-the-test | Curation, de-dup, and versioning overhead | Long-lived products where usage drifts |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just have an LLM grade it" without naming the biases and the
human calibration you'd run is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any eval design is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** a curated golden set of representative inputs with known-good
  outputs, scored by deterministic checks where possible, wired into a CI regression gate with a
  pass threshold. This is the baseline discipline and it is a perfectly good starting point.
- **SOTA (frontier, worth reaching for under real pressure):** the golden set **plus** an adversarial
  suite mined from real production failures, **plus** an LLM-as-judge for open-ended cases that is
  *calibrated against human labels* (agreement measured, borderline cases re-graded and escalated),
  **plus** a held-out/rotating split so tuning can't overfit, **plus** a production canary feeding
  fresh failures back in. The frontier treats the eval suite as a living instrument, not a fixture.
- **Antipattern (looks fine, fails in production):** shipping on **vibes** (eyeballing a few
  outputs); tuning against a **small static visible set** with nothing held out (teaching to the
  test); trusting an **uncalibrated judge** as a gate; letting the golden set go **stale** so it no
  longer reflects usage; or measuring only the happy path and being surprised when edge cases break.
  Each of these passes a demo and regresses silently under real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Judge cost scales with dataset size × runs.** Every gated commit re-grades the whole judged set,
  so a 2,000-case suite graded by a frontier model on every PR is a real, recurring token bill. The
  fix is to reserve the judge for cases deterministic checks can't cover and to keep the judged slice
  small and high-signal.
- **Deterministic checks are effectively free.** Exact-match, regex, and schema validation cost no
  tokens and run in milliseconds, so push as much of the suite as possible onto them and spend the
  token budget only where open-endedness forces a judge.
- **Calibration is a fixed up-front cost, not a per-run one.** You label a calibration set once,
  measure judge-vs-human agreement, and re-measure only when the judge model or rubric changes —
  cheap amortized across thousands of gated runs.
- **Coverage scales with failure mining, not raw volume.** Ten thousand near-duplicate happy-path
  cases add cost without signal; a few dozen adversarial cases drawn from real incidents move the
  catch-rate far more. Grow the suite by de-duplicating and by feeding production failures back in.

## Reviewing an eval-methodology design

When you are handed an eval design to critique — in a review or an interview — walk the same
checklist:

1. **Is there a fixed, versioned dataset at all?** If quality is judged by eyeballing outputs, stop
   there; it's vibes, not an eval.
2. **Deterministic where it can be?** A judge (or human) used where an exact-match/schema check would
   work is wasted cost and added bias.
3. **Is anything held out?** Tuning against the same visible cases with nothing held out is teaching
   to the test — the score rises while capability doesn't.
4. **Is the judge calibrated?** An LLM judge that gates without measured human agreement is an
   opinion, not an instrument; check for position/verbosity/self-preference controls too.
5. **Does it cover failure modes, and stay fresh?** A happy-path-only, never-rotated set will pass in
   CI and break in production. A real design names its adversarial coverage and its freshness loop.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy ships on vibes; a prototype has a golden set; a demo wires it into a CI
regression gate; a production-ready design also holds out data, calibrates its judge, covers
adversarial cases, and feeds production failures back in.
