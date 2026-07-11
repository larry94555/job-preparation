# Reading list & staying current — production-failure-modes

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **The Google SRE book — postmortems & error budgets.** The reliability tradition this whole topic borrows
  from. Notice the blameless postmortem (learn from failure, don't punish it) and the error budget (an
  explicit, spendable tolerance for failure) — both reframe reliability as something you *manage*, not a
  binary you either have or lack.
- **OWASP LLM Top 10 — the field checklist.** The consensus enumeration of LLM-specific failure and risk
  categories. Notice it exists because model-layer failures don't map onto classic infra failures; use it
  as your denominator when asking "what can go wrong here?" rather than trusting your own recall.

## Go deeper (detection, mitigation, prevention)
- **Silent regressions vs. loud errors — the topic's central distinction.** A confident, well-formed, wrong
  answer with a clean 200 is worse than a crash, because nothing pages you. Notice why "error rate near zero,
  so healthy" is the reasoning to distrust — the dangerous failures never show up in error metrics.
- **Detect → mitigate → prevent as three distinct layers.** The organizing playbook: catch it (evals,
  monitoring), soften it in the moment (validate-repair-fallback, degraded mode), stop it recurring (eval
  gates, canaries). Notice these are *not* substitutes — a fallback is not a fix, and a gate doesn't help
  you at 3am.
- **Validate-repair-fallback + freshness/TTL + budgets/loop-detection.** The concrete SOTA guard patterns
  this topic reuses from structured-output, agent, and eval work. Notice the shape of each: bound the retry,
  make the fallback *visible* (never silent), and put a TTL on anything that can go stale.

## Frontier — what to watch
- **Catching silent regressions *early*.** The live open problem: CI eval-gates and canaries catch some drift,
  but a quality regression that slips past both, in production, is still the hard case. Watch for detection
  that closes the gap between "shipped" and "noticed."
- **End-to-end failure prediction and graceful multi-failure recovery.** The frontier beyond single-failure
  playbooks: predicting failure before it lands, and recovering cleanly when several failures stack at once.
  Watch this as the direction the reliability surface is moving.

## Tools & implementations worth reading
- **Eval gates, guardrails, and observability + alerting stacks** — the operational trio. Reading how an eval
  gate blocks a regression in CI, and how alerting turns a silent quality drop into a page, is the fastest way
  to turn the detect→mitigate→prevent playbook into real code and dashboards.

## How to stay current on this topic
- Re-read the **Google SRE book** and track the **OWASP LLM Top 10** revisions — the checklist grows as new
  LLM failure classes are found in the wild.
- When a new reliability technique appears, ask the three canon questions: *which layer is it
  (detect/mitigate/prevent), what does it trade, and what silent failure would it have caught?*
- Treat every postmortem you read (yours or public) as a source: the failure catalog is built from real
  incidents, not from theory.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **Google SRE error budgets and blameless postmortems aged into cross-industry reliability doctrine.** The
  error budget (a spendable, SLO-derived tolerance) and blame-free postmortem are now standard practice well
  beyond Google, and transplanted cleanly onto LLM systems as the "manage failure, don't chase 100%" frame.
- **OWASP LLM Top 10 grew as predicted, tracking real incidents.** The 2025 revision added agent-era failure
  classes (Excessive Agency, Unbounded Consumption, System Prompt Leakage) — direct evidence for the topic's
  claim that the checklist expands as new LLM-specific failure modes surface in the wild.
- **The "silent regressions are worse than loud errors" thesis held up as the central lesson.** A confident
  wrong answer behind a clean 200 remains the failure that error-rate dashboards miss, and closing the gap
  between "shipped" and "noticed" is still an acknowledged open problem, not a solved one.
- **Validate-repair-fallback + eval-gates + canaries became the accepted guard stack.** These patterns,
  borrowed from structured-output/agent/eval work, aged into standard production hygiene — with the durable
  caveat that a fallback is not a fix and a CI gate doesn't help you at 3am (detect/mitigate/prevent stay distinct).

