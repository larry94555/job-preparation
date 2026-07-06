# Next Lessons to Work On

The authoring work queue for lesson content. Governed by [`Goals.md`](Goals.md) (what mastery means
+ Definition of Done), outlined by [`TOPIC_PLANS.md`](TOPIC_PLANS.md), and broken down per topic in
[`lesson-plans/`](lesson-plans/). This document says **what to build, in what order, and why**.

## Where we are

- ✅ Charter (`Goals.md`, now with the **lesson format & mastery-color model**, §6.1), topic outlines
  (`TOPIC_PLANS.md`), light lesson-plan breakdowns for all 22 topics (`lesson-plans/`), and the
  **lesson-delivery model** in `DESIGN.md` (§10.1–10.3: lesson loop, `begin-lesson` runner, dashboard).
- ✅ Wave-0 **item bank** authored: `topics/structured-output-reliability/` (26 questions across all
  five modes + eval skills + calibration); validates green; deterministic grader + `preview`/`selfcheck`.
- ⬜ **Not yet a "lesson":** it has questions but **no presentation material, lesson manifest, or
  section assessment** — the pieces the `begin-lesson` runner needs.
- ⬜ **Lesson runner + dashboard** (Phase 1) not built.

Lessons are delivered as **present → check → apply → section assessment** (Goals §6.1). Authoring a
topic now means material + a lesson/section manifest, not just an item bank.

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

## Wave 0 — Prove the pipeline on ONE topic

**Pilot topic: `structured-output-reliability` (topic 9)** — concrete, code-heavy, high
interview-frequency, and it *dogfoods this system*.

- [x] `topic.yaml` + 26 questions across all five modes
- [x] Eval skills + calibration sets; `npm run validate` green
- [x] Deterministic grader + `preview`/`selfcheck` (the first Phase-1 slice)
- [ ] **Turn the item bank into a real lesson:** add presentation **material** (Markdown), a
  **lesson manifest** (present→check→apply segments), and a **`sections.yaml`** with a **section
  assessment** — the pieces `begin-lesson` renders (Goals §6.1, DESIGN §10.1).

## Wave 0.5 — Build the lesson runner (Phase 1) against the pilot

**Goal:** make `begin-lesson`/`resume-lesson` play the pilot lesson end-to-end (no LLM).

- [ ] Lesson content model + importer (material, lesson manifest, `sections.yaml`) with the
  **present-before-test** check enforced at import.
- [ ] `packages/lesson` — the present→check→apply→section-assessment **state machine** + `lesson_progress`.
- [ ] `section_mastery` bands (0–4) and the **color-coded dashboard** (white→bright green, no red).
- [ ] `app/` Next.js **lesson runner**: Continue-button flow, inline formative checks (instant),
  application task, section assessment; `npm run begin-lesson -- <code>` / `resume-lesson`.
- [ ] Deterministic grading wired in (grader from `packages/engine/src/grade.ts`); essay/code
  application tasks stubbed until Phase 2.

> This is where the learner can finally *run* `begin-lesson` and watch present → check → apply →
> section assessment with the mastery dashboard.

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

Two steps to a runnable lesson:
1. **Finish the pilot as a lesson** — add presentation material, a lesson manifest, and a
   `sections.yaml` (with a section assessment) to `topics/structured-output-reliability/`, so it is a
   real **present → check → apply → assess** lesson, not just an item bank.
2. **Build the Phase 1 lesson runner** (`begin-lesson`/`resume-lesson` + mastery dashboard) against
   it, so the loop is playable end-to-end with no LLM.

At the end of step 2 you can run `npm run begin-lesson -- structured-output-reliability` and see the
lesson, exercises, application, and section assessment with the color-coded mastery dashboard.
