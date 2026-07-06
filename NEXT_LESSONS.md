# Next Lessons to Work On

The authoring work queue for lesson content. Governed by [`Goals.md`](Goals.md) (what mastery means
+ Definition of Done), outlined by [`TOPIC_PLANS.md`](TOPIC_PLANS.md), and broken down per topic in
[`lesson-plans/`](lesson-plans/). This document says **what to build, in what order, and why**.

## Where we are

- ✅ Charter (`Goals.md`), topic outlines (`TOPIC_PLANS.md`), and **light lesson-plan breakdowns for
  all 22 topics** (`lesson-plans/01..22`).
- ⬜ **Zero lessons authored as real content yet** — no `topics/<slug>/` folder exists beyond the
  Phase-0 pilot `golang-concurrency`.

The breakdowns are intentionally light so we can see the whole map and start feeding real content
into the engine. Depth is added lesson-by-lesson as we author.

## Guiding order (from Goals.md §9)

**Highest value first**, and **prerequisites before dependents.** Value =
`(interview-freq × job-relevance × foundational-leverage × retention) ÷ effort`. Career/Domain-8
slices ride along from the start; they are not deferred to the end.

Dependency backbone across topics:

```
foundations      1 harness · 2 context
serving cluster  4 kv → 5 prefill/decode → 6 batching ; 7 spec/quant/distill → 8 quant ; 3 caching
reliability      9 structured-output → 10 function-calling → 11 agent-guardrails → 12 routing
retrieval        13 rag → 14 retrieval-evals
quality/ops      15 evals → 16 observability → 17 cost
safety           18 safety → 19 multi-tenant-isolation
integrative      20 adaptation · 21 stack-tradeoffs · 22 failure-modes (capstones)
```

---

## Wave 0 — Prove the pipeline on ONE topic (do this first)

**Goal:** author one topic **end-to-end** as real, valid content — the first thing the engine can
actually run — and shake out the plan → lesson → validate → (grade) loop before scaling.

**Pilot topic: `structured-output-reliability` (topic 9).** Chosen because it is concrete,
code-heavy, high interview-frequency, and it *dogfoods this very system* (validation, repair,
fallbacks).

- [ ] `topics/structured-output-reliability/topic.yaml`
- [ ] **LP1–LP4** questions across all five modes (MC, missing-term, free-entry, essay, code)
- [ ] Eval skills + **calibration sets** for the essay/code questions (must pass the meta-eval gate)
- [ ] `npm run validate` green
- [ ] Use it as the **fixture for building Phase 1** (deterministic MC/text quiz UI)

> Note: authoring content only needs the Phase-0 validator (works today). *Taking* these quizzes
> needs Phase 1 (deterministic MC/text) and Phase 2 (essay/code grading) from `NextSteps.md`. So
> Wave 0 content becomes the concrete test fixture that drives Phase 1/2 development.

---

## Wave 1 — T1 core of the highest-value topics (the 80/20 to interview-ready)

Author **LP1–LP3 (Tier 1)** for the topics that show up most in interviews and unlock the most
downstream lessons. Each gets MC + missing-term + free-entry now; essay/code follow in Wave 2.

- [ ] **1 harness-engineering** — LP1 boundary, LP2 agent loop, LP3 verification
- [ ] **2 context-engineering** — LP1 token budget, LP2 lost-in-the-middle, LP3 selection
- [ ] **13 rag-architecture** — LP1 overview, LP2 chunking, LP3 embeddings/search
- [ ] **15 eval-methodology** — LP1 why evals, LP2 golden/regression, LP3 adversarial
- [ ] **10 function-calling-reliability** — LP1 contracts, LP2 arg validation, LP3 idempotency
- [ ] **18 safety-engineering** — LP1 injection, LP2 trust boundaries, LP3 leakage/permissions

*(9 structured-output already covered end-to-end in Wave 0.)*

---

## Wave 2 — Finish T1 breadth + add essay/code depth

- [ ] Essay/code assessments for all Wave 0–1 topics (raises them from recall to L3 judgment/craft).
- [ ] T1 for the **serving cluster**: 4 kv-cache, 5 prefill/decode, 6 batching, 7 spec/quant, 8 quant
      (deep technical-interview topics; author LP1–LP2 each).
- [ ] T1 for **11 agent-guardrails**, **12 routing**, **14 retrieval-evals**, **16 observability**,
      **17 cost-attribution**, **3 caching**, **19 multi-tenant-isolation**.

---

## Wave 3 — Integrative & capstones + T2 sweep

- [ ] **20 adaptation-strategy**, **21 stack-tradeoffs**, **22 failure-modes** — author after their
      prerequisites (these are capstones that synthesize earlier topics).
- [ ] Second pass to **T2 (practitioner)** depth across all topics: tradeoff essays, code-review
      exercises (C5.3), debugging exercises (C5.4), from-scratch builds (C5.2).

---

## Cross-cutting (every wave) — Domain 8: Career

A thin career slice ships alongside each topic from Wave 1 on, so portfolio/interview evidence
accrues continuously:

- [ ] "Explain to an expert" essay prompts (C1.2) — feeds mock-interview mode (Phase 4).
- [ ] Per-topic **interview-signal** question sets (C8.3).
- [ ] Capstone build/design write-ups retained as **portfolio artifacts** (C5.2, C8.1).

---

## Definition of Done reminder (Goals.md §7 / §12)

A lesson plan is **content-complete** only when every declared competency is *identified, tested at
the right cognitive level, measurable (validates + eval skills pass the meta-eval gate), sequenced,
fully covering its Expert-Surface slice, and certifiable.* Track topic progress as **TMI** (% of the
dated Expert Surface certified), with a ranked gap list — never a bare "not done."

---

## Immediate next action

**Author Wave 0** (`topics/structured-output-reliability/`) end-to-end and get `npm run validate`
green. That gives the engine its first real, multi-mode topic and the fixture to build Phase 1
against.
