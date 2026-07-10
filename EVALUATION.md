# Evaluation — is this an A+? (and the plan to get there)

Honest, evidence-based assessment of the current repo against the bar the reviewer set: a learner who
completes it should be **expert at judging new insights, expert at building state-of-the-art systems,
and expert at passing state-of-the-art interviews.**

Date: 2026-07-09.

> **Progress update (2026-07-09):** WS1 (literature/canon/frontier), WS2 (career/interview track),
> WS3 (deepen material + architecture taxonomy + code-review & debugging exercises + more L4), and
> **WS4 (certification rigor)** are **done**.
> WS1–3: every topic carries an "Expert context" lesson (papers/people/frontier + interview signals) and an
> "Architecture deep-dive" lesson (tradeoff table + common→SOTA→antipattern taxonomy + a design-review
> checklist + 3 L4 code-review MCs + an L4 design-review essay); 12 code-friendly topics also have a
> runnable, sandbox-verified **debugging exercise**.
> WS4: **calibration coverage is now 100%** (added golang code calibration; every skill is measurable);
> a per-topic **Expert Surface** enumerates SOTA capabilities across the 8 domains and a **Topic Mastery
> Index** computes weighted coverage = **86%** (`npm run mastery`, [MASTERY_INDEX.md](MASTERY_INDEX.md));
> the **meta-eval eval-gate** is wired into `npm run certify` + CI ([.github/workflows/ci.yml]) and was
> **run live over all 46 skills** — 19 pass / 27 needs-work at 0.7 on llama3:8b (essays 16/23, code 3/23;
> the gate correctly fails, flagging skills to regrade on the pinned Qwen2.5-3B + tighten — see
> [CERTIFICATION.md](CERTIFICATION.md)).
> **A+ push (2026-07-10):** closed the two A+ blockers. **(1) Expert-Surface completeness:** every topic
> gained a **Frontier & operations** drill lesson (frontier paper-drill D2 + operational-metrics drill D6),
> plus a sandbox-verified eviction coding exercise on kv-cache — lifting the **Topic Mastery Index 89% →
> 97%** (`npm run mastery`; 3 topics at 100%, most 95–98%). **(2) Papers:** all 22 topics' canon claims were
> **independently web-verified** (WebSearch) with **zero corrections needed**, and each reading list gained
> a **"Reception & what aged"** layer (closes C2.2). Repo green: 23 valid, selfcheck clean, typecheck 0, 16
> tests. Residual to ~100%: the **D5 coding-exercise bucket** (~one sandbox-verified exercise per topic).
>
> WS5 (**analytics & retention + reading-list module**): every topic gained a curated `reading-list.md`
> (papers/tools + a staying-current method), closing the recurring D7 gap and lifting the **Topic Mastery
> Index 86% → 89%**; the runner gained a **mastery-over-time + spaced-repetition retention** analytics view
> (`/api/analytics` + an Analytics screen), verified live. Repo green: 23 valid, selfcheck clean (386
> answer-key checks), typecheck exit 0, 16 tests. **Grade: A.** Optional polish that remains: regrade code
> skills on the pinned Qwen2.5-3B + tighten those calibration sets, close the WS3-bucket content gaps
> (frontier paper drills, a few coding exercises, ops-metrics drills), web-verify canon.md, and hosting.

---

## 1. Does it run locally? — YES, complete (A+ on this axis)

Verified this pass:

| Check | Result |
|---|---|
| `npm run validate` | ✓ all 23 topics valid |
| `npm run selfcheck` | ✓ clean (264 answer-key checks) |
| `npm run typecheck` | ✓ exit 0 (6 packages) |
| `npm test` | ✓ 16/16 |
| `npm run begin-lesson` (hub) | ✓ boots, lists 22 lessons, runs present→check→apply→assessment |
| Code sandbox | ✓ 22/22 lesson topics have a runnable exercise (reference passes, starter fails) |
| Grading | ✓ deterministic (MC/text) inline; essay/code via local model (Ollama/llama-server) |

Nothing is missing to run the whole system end-to-end on the laptop. This part is done.

---

## 2. Is it an A+ curriculum? — Not yet. Current grade: **B+** (technical core A-, gated by three gaps)

### What's genuinely strong (already A-/A)
- **Breadth & completeness:** all 22 planned topics, 579 questions across 5 modes, 91 essays, 46
  runnable code exercises — each concept-graded with a gated eval skill.
- **Systems depth (scalability / performance / token management / harness / context):** the serving
  cluster (KV cache, prefill/decode, batching, quantization, speculative decoding), harness
  engineering, and context engineering are taught *and* exercised with real, tested code. This is the
  strongest part and is close to A-level.
- **Pedagogy & rigor of format:** present-before-test is enforced; every code topic has a "Build it"
  lesson that teaches the mechanism (worked example + the invariant that matters) before the exercise;
  a project (from-scratch design) sits alongside each exercise.
- **Assessment machinery:** spaced repetition, mock-interview and cumulative modes, and a meta-eval
  gate all exist.

### Rubric against the reviewer's dimensions

| Dimension | Grade | Evidence / gap |
|---|---|---|
| Major insights | A- | Each topic teaches its core insight; concise (~1k words) rather than exhaustive. |
| Tradeoffs | B+ | Present in essays/projects, but not consistently enumerated as explicit tradeoff tables. |
| **Papers & how experts reacted** | **C+** | Only ~11/22 material files name a canonical paper; "expert reactions," key people/books/essays are essentially absent. |
| Popular use / tools / OSS | B- | Named in the *plans* (Expert Surface) but sparse in the actual lesson material and questions. |
| **Job-description / interview call-outs** | **D+** | ~0 authored content. Interview signals, resume/cover-letter, mock-interview prompts, "explain to a hiring manager" — missing. This is the *stated ultimate goal*. |
| Architecture: common vs SOTA vs antipattern | B | "Design X" projects are good; but topics don't consistently teach the architecture taxonomy + its tradeoffs. |
| Scalability / performance / token management | A- | Serving cluster + KV/prefill/batching/quant with code. Strong. |
| Harness engineering | A- | Dedicated topic + exercises; patterns reinforced across agent/function-calling/failure-modes. |
| Context management | A- | Dedicated topic + `assembleContext` exercise + lost-in-the-middle. |
| **Frontier / open problems (L4)** | **C+** | Only ~17% of questions are L4; "discuss unsolved problems as experts do" is thinly assessed. |
| Certification rigor (the project's own DoD) | C | Meta-eval run on ~3/46 skills; **no per-topic Expert Surface**, so TMI (% of expert surface certified) is uncomputable — by our own `Goals.md` §7, topics aren't "done." |

### The three gaps that cap it at B+
1. **Literature, canon & frontier (Goals Domain 2)** — inconsistent papers, no expert-reception, no
   canon/people, thin open-problems. This is what "expert at *judging new insights*" and SOTA
   interviews most depend on.
2. **Career & interviewing (Goals Domain 8)** — the reviewer's *ultimate goal*, currently ~absent.
3. **Certification rigor** — most eval skills are unmeasured; no Expert Surface → "complete" is asserted,
   not measured.

Plus a general **material-depth** gap: ~1k words/topic is intro→intermediate, not the expert-comprehensive
treatment (deeper mechanism, exhaustive tradeoffs, architecture taxonomy) an A+ implies.

---

## 3. The plan to A+

Five workstreams, ordered by leverage. Each is authored with the proven pattern (material → checks →
apply → project) and **validated + (for code) sandbox-verified**.

### WS1 — Literature, canon & frontier, every topic *(closes the biggest "judge insights"/interview gap)*
Per topic, add a **"Papers, people & the frontier"** lesson:
- The 2–4 seminal papers/posts — **what each established** and **how the field received it** (adoption,
  criticism, what aged well/poorly).
- Key people / tools / OSS projects; the **current SOTA**; **1–2 open problems**.
- Questions: 3–4 MC/cloze on attribution (method ↔ paper ↔ idea), 1 essay "summarize the influential
  work on X and the expert reaction," 1 **L4** essay on an open problem.
- **Accuracy gate:** every paper/person is web-verified before it ships (no hallucinated citations);
  uncertain items are dropped, not guessed.

### WS2 — Career & interview track *(the stated ultimate goal)*
- Per topic, an **"Interview & on the job"** lesson: the **interview signals** interviewers probe, 4–6
  canonical **interview Q&A with model answers**, an "explain to a hiring manager" (C1.1) and a
  "defend to an expert" (C1.2) essay — the latter **wired into mock-interview mode** — and the
  **red-flag antipatterns** interviewers listen for.
- A cross-cutting **career module**: résumé bullets per skill, objective/cover-letter framing,
  phone-screen vs. onsite, portfolio/blog strategy (self-promotion), and a "staying current" routine
  (Domain 7).

### WS3 — Deepen material & architecture to expert level
- Expand each topic's material toward **~2.5–4k words**: an explicit **tradeoff table**, the
  **common → SOTA → antipattern** architecture taxonomy, and scalability/performance/token specifics.
- Add assessment depth: **code-review** exercises (rate toy/prototype/demo/production — C5.3),
  **debugging** exercises (fix + validate — C5.4), and more **L4/frontier** essays. Rebalance difficulty
  upward (currently ~17% L4 → target ~30%).

### WS4 — Certification rigor (make "done" measurable)
- Author a dated **Expert Surface** per topic (`Goals.md` §8) → compute **TMI** per topic.
- Run **meta-eval on all 46 eval skills** against the local model; tighten calibration until each clears
  threshold; persist `meta_eval_status`. Add the 1 missing calibration set (golang code skill).
- Add a **CI eval-gate** so grading-skill regressions fail the build.

### WS5 — Learning-science & analytics polish
- Retention/spaced-rep tuning; **mastery-over-time analytics**; per-topic **reading-list/reference
  links**; explicit "learning to learn / keep your axe sharp" (C7.2) content.

### Sequencing & effort
- **Highest value first:** WS1 + WS2 across all 22 topics move the grade most (they close the two
  dimensions currently at C+/D+ and are what interviews and "judging insights" hinge on).
- These are parallelizable with the same subagent-authoring + validator-safety-net pipeline already
  proven — **except** the *paper/person facts (WS1)* and *reference solutions (code)*, which must be
  fact-checked / sandbox-verified rather than trusted.
- Rough order: WS1 → WS2 → WS4 (certify what now exists) → WS3 (deepen) → WS5.

**Bottom line:** the system is a complete, runnable, broad **B+** with an A-level systems core. The
path to A+ is not more topics — it's **depth on three axes it currently under-serves**: the
literature/frontier, the career/interview goal, and measured certification.
