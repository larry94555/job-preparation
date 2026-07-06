# Lesson Plans — how these breakdowns become lessons

The `NN-<slug>.md` files here are **light lesson-plan breakdowns** per topic. This README defines the
standard shape every one of them is delivered in, so the per-topic tables all mean the same thing.
Authoritative definitions live in [`../Goals.md`](../Goals.md) §6.1 and [`../DESIGN.md`](../DESIGN.md)
§10.1–10.3; this is the working summary.

## Content hierarchy

**Topic → Sections → Lesson plans → Lessons → Segments/items.**

- A **lesson plan** (a row in a topic file's table) teaches and certifies a declared slice of
  competencies.
- A **section** groups lesson plans (by value tier) and ends in one **section assessment**.
- A **cumulative assessment** spans several completed sections.

## The lesson loop (every lesson plan)

1. **Present** — material (explanation, worked examples, diagrams, references).
2. **Check (formative)** — right after each segment: multiple choice / short answer / **flashcards**;
   instant, encouraging, unlimited; moves mastery *up* only, never counted.
3. **Apply (guided)** — applying-the-material content; for coding topics, MC on **tradeoffs,
   bugs-found, maturity rating** (toy/prototype/demo/production).
4. **Application task** — a coding exercise, essay, or configuration task.
5. **Section assessment (summative)** — the hard, mixed-mode mastery gate for the section.
6. **Cumulative assessment** — spans several sections once each is mastered.

**Present-before-test** is enforced at import: no check or assessment may reference material not yet
presented.

## How a topic file's table maps to this

| Table column | Meaning in the lesson |
|---|---|
| **Lesson plan** | One present→check→apply lesson. |
| **Tier (T1–T3/T4)** | Which **section** it belongs to (T1 = Section 1 fundamentals, T2 = Section 2 practitioner, T3 = Section 3 expert/frontier). |
| **Target (L2–L4)** | The proficiency/**mastery color** aimed for (see below). |
| **Certifies** | Goals.md competency codes (C1.3, C3.3, …) the lesson certifies. |
| **Modes** | The assessment item types used for its formative checks + application task. |

## Mastery colors (tough but friendly, no red)

The learner-facing dashboard shows only the **mastery band** per section — never attempts, failures,
or scores-as-grades.

| Band | Color | Meaning | Level |
|---|---|---|---|
| 0 | White | Not started | L0 |
| 1 | Light blue | Learning — material presented | L1 |
| 2 | Turquoise | Developing — formative checks passing | L2 |
| 3 | Light green | Proficient — section assessment passed | **L3 (interview-ready)** |
| 4 | Bright green | Mastered — sustained/retained | L4 |

## Authoring a topic file into real lessons

For each topic, add to `topics/<slug>/`: presentation **material** (Markdown), a **lesson manifest**
(ordered segments: material + formative checks + application task), a **`sections.yaml`** grouping
lessons and naming each section assessment, plus the **questions**, **eval skills**, and
**calibration** the items draw on. Then `npm run validate`. Author **Section 1 (T1)** first.
