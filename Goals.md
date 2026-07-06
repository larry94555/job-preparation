# Goals — What the Lessons Must Accomplish, and When a Lesson Plan Is Done

This is the charter for all learning content in this system. It defines the **ultimate goal** of a
topic's lessons, the **competency framework** every lesson is measured against, the **proficiency
levels** and **certification standard**, and the **Definition of Done** — both for authored content
and for a learner's certification.

It governs [`TOPIC_PLANS.md`](TOPIC_PLANS.md) (the topic outlines) and every future
`topics/<slug>/` lesson. When a lesson plan and this document disagree, this document wins.

---

## 1. Philosophy

- **Fundamentals → state of the art.** Each topic's lessons proceed from high-level fundamentals to
  detailed, current, expert-level practice.
- **Highest value first.** The course is deliberately more ambitious than any learner will finish.
  So content is **sequenced by payoff**: the fastest path to interview-readiness and job impact is
  authored and taught first. Progress is always "further down the path," never "all or nothing."
- **Measured, not asserted.** A skill counts only when it has been *identified, tested, measured,*
  and *certified*. Retesting is always allowed; the bar does not move.
- **Relative to a moving frontier.** "Done" is defined against what a **state-of-the-art expert**
  commands today. Because the frontier moves, completion is dated and the course is continuous.

---

## 2. Vocabulary

| Term | Meaning |
|---|---|
| **Topic** | One subject area (e.g. `rag-architecture`). Has one `topics/<slug>/` folder. |
| **Lesson Plan** | A coherent unit within a topic that teaches and certifies a declared slice of competencies (e.g. "RAG chunking fundamentals"). A topic has many, sequenced fundamentals→SOTA. |
| **Lesson** | The taught content of a lesson plan (readings, worked examples, references). |
| **Assessment** | A question/exercise (one of the five modes) that measures a competency. |
| **Expert Surface** | The enumerated set of everything a SOTA expert commands for a topic — the denominator for completeness (see §8). |
| **Certification** | A learner has demonstrated a competency at its target level, at standard, retesting allowed. |

Hierarchy: **Topic → Lesson Plans → Lessons + Assessments → Competencies certified.**

---

## 3. The Ultimate Goal

> A learner who completes all lesson plans for a topic — passing every lesson, exercise, and test
> at the system's standard (with retesting until the standard is met) — can **operate as a
> professional expert on that topic**: explain it at any altitude, make and defend design and
> implementation decisions, build and debug and refactor real systems, judge others' code and
> claims, stay current with the frontier, and **convert that expertise into a career** — landing
> the job, doing the job well, and building a reputation.

The rest of this document decomposes that sentence into measurable competencies and a completion
test.

---

## 4. Competency Framework

Everything the lessons must accomplish, organized into **eight domains**. Each domain lists the
concrete competencies a complete topic must certify. These are the checklist items that make
"mastery" measurable. (Every capability from the project brief maps into exactly one domain below.)

### Domain 1 — Conceptual Mastery & Communication
- **C1.1** Explain any core concept to a **non-technical audience** (curious high-schooler) accurately.
- **C1.2** Explain any advanced concept to an **expert in an interview** and defend it under questioning.
- **C1.3** Command the topic's **technical vocabulary** — define terms precisely and use them correctly.
- **C1.4** Translate fluidly **between altitudes** (analogy ↔ precise mechanism) without losing correctness.

### Domain 2 — Literature, Canon & Frontier Awareness
- **C2.1** Know the **influential papers and blog posts**; summarize their claims and contributions.
- **C2.2** Know **how experts reacted** to those works (adoption, criticism, what aged well/poorly).
- **C2.3** Know the **key people, books, and essays**; place each in the arc of the state of the art.
- **C2.4** Discuss **open problems and unsolved questions** the way experts frame them.
- **C2.5** State **what is state-of-the-art now** and why.

### Domain 3 — Architecture, Design & Tradeoff Judgment
- **C3.1** Describe **common architectures** and **state-of-the-art architectures** for the topic.
- **C3.2** Identify **architectural antipatterns** and why they fail.
- **C3.3** Reason about **design decision points** and the **tradeoffs** at each (latency/cost/quality/reliability/complexity).
- **C3.4** Reason about **programming/implementation decision points** and defend the choice made.

### Domain 4 — Problem Solving
- **C4.1** Solve **trivial** problems and explain the solution.
- **C4.2** Solve **standard** problems and defend the approach.
- **C4.3** Solve **challenging** problems with a defensible, explained solution.
- **C4.4** Engage **very challenging / open / no-known-solution** problems in an informed way.

### Domain 5 — Engineering & Code Craft
- **C5.1** Write **demonstrative code** — samples that show a concept, pattern, antipattern, API, or bug.
- **C5.2** Build **from scratch**: design decisions + design write-up + implementation plan +
  configuration plan + test plan + supporting docs, using SOTA approaches.
- **C5.3** **Read and judge code**: identify patterns/antipatterns, spot bugs, and rate maturity
  (**toy / prototype / demo / production**) with an explained judgment.
- **C5.4** **Debug**: troubleshoot, fix, and **validate the fix**.
- **C5.5** **Refactor legacy systems** and **add significant new functionality** to an existing system.

### Domain 6 — Ecosystem, Tooling & Operational Judgment
- **C6.1** Know relevant **open-source projects, local models, and frontier models**; decide among
  **open-source vs. licensed vs. build-your-own**.
- **C6.2** **Metrics literacy** — which metrics evaluate effectiveness, and how to assess a change
  that claims to improve one.
- **C6.3** **Benchmark literacy** — what a benchmark does and does **not** say about a project.
- **C6.4** **Configuration mastery** — major choices, common mistakes, improvement opportunities, the
  value of good defaults; interview-ready on configuration management.
- **C6.5** **Optimization judgment** — when optimization is warranted, where the opportunities are,
  and when to experiment; using papers/sites to find opportunities.

### Domain 7 — Staying Current & Meta-Learning
- **C7.1** **Track the frontier** — know how to stay on top of the state of the art (venues, people, feeds).
- **C7.2** **Learn to learn** — a personal system to stay sharp after the lessons ("keep the axe sharpened").

### Domain 8 — Career & Professional Practice *(cross-cutting; taught alongside every topic, not saved for the end)*
- **C8.1** **Self-promotion** — turn insight into blog posts / talks / public work that demonstrate expertise.
- **C8.2** **Getting the job** — résumé, objective, cover letter, phone screen, full technical interview.
- **C8.3** **Interview craft** — the specific tips, questions, and talking points that convince
  experts you have the depth a job description requires.
- **C8.4** **On the job** — leverage the skill professionally; time management, planning, and
  communication management.
- **C8.5** **Reputation** — build a durable reputation for quality, expertise, and insight.

> Any topic-specific capability not covered above is added to that topic's Expert Surface (§8) and
> assigned to the nearest domain.

---

## 5. Proficiency Levels

Every competency is certified at a **target level**. Levels adapt the Dreyfus model.

| Level | Name | What it means |
|---|---|---|
| **L0** | Aware | Has heard of it; can recognize the term. |
| **L1** | Foundational | Understands the fundamentals; can explain simply (C1.1). |
| **L2** | Applied | Uses it in standard situations; solves standard problems (C4.2). |
| **L3** | **Professional / Interview-Ready** | **Certification bar.** Makes and defends decisions, judges tradeoffs and code, debugs, and passes an expert interview on it (C1.2, C3.x, C5.3–5). |
| **L4** | Expert / State-of-the-Art | Discusses open problems, evaluates the literature critically, contributes/innovates (C2.4, C4.4). |

- **Default target = L3** for practitioner competencies. This is the pass bar that makes the learner
  job-ready and defensible in interviews.
- **L4 targets** apply to the frontier competencies (C2.4, C4.4, C6.5 at its edge) — certified as
  *informed expert-level discussion*, not necessarily original research.
- **L1 targets** may be acceptable for peripheral competencies; a lesson plan must state the target
  level for each competency it declares.

---

## 6. How Competencies Are Measured (cognitive rigor → assessment mode)

A competency is only certified when tested **at the cognitive level it demands**. Modes map to
Bloom-style cognition:

| Cognitive demand | Primary mode(s) | Example competencies |
|---|---|---|
| Remember / Understand | Multiple choice, Missing term (cloze) | C1.3 vocabulary, C2.1 recall, C3.1 recognition |
| Understand / Apply | Free entry (short answer) | C1.1 crisp explanation, C6.2/6.3 judgment calls |
| Analyze / Evaluate | Essay (short & long) | C1.2, C2.2/2.4, C3.3/3.4, C6.x tradeoffs |
| Apply / Create | Coding exercise | C5.1–5.5 |
| Create / Defend (capstone) | Long essay + coding + oral-style defense | C5.2 from-scratch build, C4.3/4.4 |

**Rule:** a competency's certification requires evidence at its mapped level. You cannot certify
C1.2 ("explain to an expert") with multiple choice alone — it needs an essay/defense. You cannot
certify C5.4 ("debug and validate") without a coding exercise.

**Portfolio by-product:** "Create"-level deliverables (from-scratch designs, code reviews, blog-post
essays) are retained as **interview evidence / portfolio artifacts**, directly serving Domain 8.

---

## 7. Definition of Done

There are two Definitions of Done. Keep them distinct.

### 7A. Content DoD — "the lesson plan is authored-complete"

A lesson plan is **content-complete** when, for every competency it declares:

1. **Identified** — the competency and its target level are explicitly listed in the lesson plan.
2. **Tested** — there is at least one assessment per declared competency, **at the cognitive level
   §6 requires**, spanning the appropriate modes.
3. **Measurable** — the content passes `npm run validate`, and every essay/coding assessment has an
   **eval skill + calibration set that passes the meta-eval gate** (see `DESIGN.md` §7). An
   un-gradeable competency is not "tested."
4. **Sequenced** — lessons proceed fundamentals→SOTA; prerequisites are declared and satisfied.
5. **Complete for its slice** — no declared competency is left unaddressed, and the lesson plan's
   slice of the topic's Expert Surface (§8) is fully covered.
6. **Certifiable** — a certification rule is defined (thresholds, retest policy, retention check per
   §7C).

If any item fails, the lesson plan is **in progress**, and its completeness is reported as a
coverage fraction (§9), not a yes/no.

### 7B. Topic DoD — "the topic is complete (as of a dated SOTA snapshot)"

A topic is **complete as of `<date>`** when:

1. The **union of its lesson plans** declares and certifies **every competency across all eight
   domains** at that competency's target level, and
2. That set **covers 100% of the topic's Expert Surface** (§8) at the snapshot date, and
3. Every constituent lesson plan is **content-complete** (§7A).

Because the Expert Surface is revisited as the field moves (§8), a topic marked complete can revert
to *in progress* when the surface expands. This is expected — it is what makes the course continuous.

### 7C. Learner Certification — "complete *for this user*"

Separately from content, a **learner** completes a lesson plan when **all its declared competencies
are certified for that user**:

- **Measured** — the learner has been scored on every competency's assessments.
- **At standard** — scores meet the required threshold at the target level (the standard does not
  bend; **retesting is unlimited** until the learner reaches it — fresh randomized/parameterized
  items each attempt so retesting is re-demonstration, not memorization).
- **Retained** — the competency survives a **spaced-repetition retention check** (Phase 4), so
  certification reflects durable skill, not a one-time pass.
- **Defended where required** — competencies mapped to essay/capstone (C1.2, C5.2, C4.3–4.4) require
  an explained, defensible artifact, not just a correct answer.

A learner **completes the topic** when certified on every lesson plan composing it.

---

## 8. Measuring "Relative to a State-of-the-Art Expert" — the Expert Surface

To make completeness measurable against a moving frontier, each topic maintains an **Expert
Surface**: the enumerated inventory of what a SOTA expert commands. It is the denominator for all
completeness math and is authored per topic (living document, **dated and periodically reviewed**).

An Expert Surface enumerates, for the topic:

- **Concepts & mechanisms** — the ideas that must be understood.
- **Technical terms** — the vocabulary.
- **Tradeoffs & decision points** — the axes and where they bind.
- **Design patterns** and **antipatterns**.
- **Architectures** — common and state-of-the-art.
- **Papers & blog posts** — the influential works + how experts received them.
- **People, books, essays** — the canon.
- **Benchmarks & metrics** — what they measure and their blind spots.
- **Tools, OSS projects, and models** — open-source, licensed, local, frontier.
- **Open problems** — the current unknowns.
- **Interview signals** — what interviewers probe for on this topic.

### Topic Mastery Index (TMI)

For content: `TMI_content = (Expert-Surface items with a passing, gated assessment) / (total items)`.

For a learner: `TMI_learner = (Expert-Surface items certified for the user at target level) / (total items)`.

Both are reported **overall and broken down by domain (§4) and by level (§5)**, plus a **ranked gap
list** (uncertified items ordered by value, §9). A topic is complete when `TMI = 100%` at target
against the dated surface (§7B).

---

## 9. Prioritization — Highest Value First

Because the course will never be "finished," ordering is a first-class decision. Each lesson plan
(and each Expert-Surface item) gets a **Value Score**:

```
Value = (Interview frequency × Job relevance × Foundational leverage × Retention value)
        ÷ Authoring effort
```

- **Interview frequency** — how often it actually shows up in interviews for the role.
- **Job relevance** — how central to doing the job well.
- **Foundational leverage** — how many later competencies depend on it (teach prerequisites first).
- **Retention value** — how durable/transferable the skill is.
- **Authoring effort** — cost to build the lesson + gated evals.

Lesson plans are authored in **value tiers**:

| Tier | Focus | Typical target |
|---|---|---|
| **T1 — Core** | High-frequency fundamentals + the 80/20 that yields interview-readiness fastest | L2→L3 |
| **T2 — Practitioner** | Standard professional depth, tradeoffs, code craft | L3 |
| **T3 — Expert/Frontier** | SOTA architectures, literature, open problems | L3→L4 |
| **T4 — Polish** | Edge cases, niche tools, long-tail interview trivia | L3 |

Domain 8 (Career) is **cross-cutting** — a thin slice ships with every tier so the learner is
building résumé/interview/portfolio evidence from the start, not only at the end.

**Authoring order within a topic:** T1 across the topic before T2, and so on — always advancing the
learner further down the path with the highest-payoff content available next.

---

## 10. Progress Reporting When Incomplete

Whenever a topic is not complete, progress is reported as (never a bare "not done"):

- **`TMI` overall** (content and, per learner, learner) as a percentage of the dated Expert Surface.
- **Domain breakdown** — coverage per the eight domains of §4.
- **Level breakdown** — how much is certified at L1/L2/L3/L4.
- **Ranked gap list** — the highest-value uncertified competencies to tackle next (§9).
- **Snapshot date** — the Expert-Surface version the percentages are measured against.

This makes "we are X% of the way to a SOTA expert on this topic, and here is the next most valuable
thing to build/learn" a concrete, always-available answer.

---

## 11. How This Maps to the Engine

The measurement machinery is not aspirational — it rides on the system in `DESIGN.md`:

- **Mastery + spaced repetition** tables → the substrate for *measured*, *retained* certification (§7C).
- **Meta-eval gate + calibration** → makes essay/coding competencies *trustworthily measurable* (§7A.3).
- **Mock-interview mode** → certifies the "explain/defend to an expert" competencies (C1.2, Domain 3).
- **Analytics dashboard** → renders TMI, domain/level breakdowns, and the gap list (§10).
- **Randomized/parameterized items** → make unlimited retesting a re-demonstration, not recall (§7C).

---

## 12. Definition-of-Done Checklist (quick reference)

**A lesson plan is content-complete when:**
- [ ] Every declared competency lists a target level.
- [ ] Every competency has ≥1 assessment at the cognitive level §6 requires.
- [ ] All content passes `npm run validate`.
- [ ] Every essay/coding eval skill passes the meta-eval gate with a calibration set.
- [ ] Lessons are sequenced fundamentals→SOTA with declared prerequisites.
- [ ] The lesson plan's slice of the Expert Surface is fully covered.
- [ ] A certification rule (thresholds, retest, retention) is defined.

**A learner has completed a lesson plan when:**
- [ ] Measured on every competency's assessments.
- [ ] Meets the standard at target level (retesting allowed, fresh items).
- [ ] Passes the retention (spaced-repetition) check.
- [ ] Produced the required defended/portfolio artifacts.

**A topic is complete (as of a dated snapshot) when:**
- [ ] All eight domains' target competencies are certified.
- [ ] `TMI = 100%` against the dated Expert Surface.
- [ ] Every constituent lesson plan is content-complete.

---

*Next: give each topic in [`TOPIC_PLANS.md`](TOPIC_PLANS.md) an **Expert Surface** and a
**value-tiered list of lesson plans**, then author T1 lesson plans first — starting with one topic
end-to-end to prove the plan → lesson → certify pipeline.*
