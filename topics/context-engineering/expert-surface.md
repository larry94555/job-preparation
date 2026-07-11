# Expert Surface — context-engineering

**SOTA snapshot: 2026-07-09.** The enumerated set of capabilities a state-of-the-art expert commands
for this topic — the *denominator* for completeness (Goals §8) and the input to the Topic Mastery
Index. Each item lists a target level and where the course covers it. Legend: ✅ covered · 🟡 partial
· ⬜ gap. The surface is revisited as the field moves; items can be added and coverage can revert.

## D1 — Conceptual mastery & communication
- ✅ **[L3]** Reframe the context window as a finite, ranked *token budget* rather than a scratch pad — `lessons/context-budget.md`, `questions/essay.yaml`.
- ✅ **[L3]** Command the vocabulary: budget, rank, fit, dilution, context rot, primacy/recency, compaction, stable prefix — `lessons/*`, `questions/free-entry.yaml`, `missing-term.yaml`.
- ✅ **[L2]** Translate between altitudes (dump-everything analogy ↔ rank-then-fit-to-budget mechanism) — `lessons/context-budget.md`, `lessons/build-assemble-context.md`.

## D2 — Literature, canon & frontier awareness
- ✅ **[L3]** "Lost in the Middle" (Liu et al., Stanford 2023) as the U-shaped position finding — `lessons/context-position.md`, `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L3]** Needle-in-a-Haystack / RULER (NVIDIA 2024) as the advertised-vs-effective-context stress tests — `lessons/expert-context.md`, `questions/expert.yaml`.
- ✅ **[L4]** Principled compaction without information loss (retrieve-then-compact; the open problem is measuring what a summary lost) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.
- ✅ **[L4]** Long-context frontier beyond bigger windows: the effective-vs-advertised gap and RULER-style measurement ("Lost in the Middle" U-shape, Needle-in-a-Haystack, RULER) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D3 — Architecture, design & tradeoff judgment
- ✅ **[L4]** The five context levers (budget allocation, selection, position, compaction, structure/reuse) and their tradeoffs — `lessons/deep-dive.md`.
- ✅ **[L4]** toy → prototype → demo → production taxonomy for a context pipeline — `lessons/deep-dive.md`, `questions/deep-dive.yaml`.
- ✅ **[L4]** Review a context design and name its failure (unranked dump, no accounting, ignored position, undefined overflow) — `questions/deep-dive.yaml` (code-review MCs + design essay).
- ✅ **[L3]** Stable prefix / variable suffix for prompt-cache reuse — `lessons/context-selection.md`, `lessons/deep-dive.md`.

## D4 — Problem solving
- ✅ **[L3]** Rank candidates by relevance and greedily fit them to a token budget, dropping/compacting overflow — `lessons/context-selection.md`, `lessons/build-assemble-context.md`.
- ✅ **[L3]** Diagnose degraded accuracy under a full window to dilution/position and pick the fix (rank, re-order, compact) — `lessons/context-position.md`, `lessons/deep-dive.md`.

## D5 — Engineering & code craft
- ✅ **[L4]** Implement `assembleContext(sections, budget)` — rank by priority, fit greedily, keep scanning for smaller fits — `exercises/assemble-context`, `questions/code.yaml`.
- ✅ **[L4]** Debug a broken rank-then-fit assembler (stop-at-first-overflow / unranked bug) — `exercises/rank-then-fit-debug`, `questions/code.yaml`.
- ✅ **[L4]** Implement a compaction/summarize-overflow policy in code — keep pinned items, fit droppable overflow greedily to a budget — `exercises/compact-fit`, `questions/frontier-ops.yaml`.

## D6 — Ecosystem, tooling & operational judgment
- ✅ **[L3]** Tokenizers (tiktoken) and LangChain / LlamaIndex context builders as the assembly stack — `lessons/expert-context.md`.
- ✅ **[L3]** Measure effective context operationally and watch context-ops signals (effective-vs-advertised utilization, position of key facts, truncation/eviction rate, tokens-per-request trend) — drilled in `lessons/frontier-ops.md`, `questions/frontier-ops.yaml`.

## D7 — Staying current & meta-learning
- ✅ **[L2]** Know where the context frontier moves (retrieval + compaction pipelines, effective-context gap) and how to track it — curated primary sources and a staying-current routine in `reading-list.md`, with pointers in `lessons/expert-context.md`.

## D8 — Career & professional practice
- ✅ **[L3]** Interview signals & red flags (ranked-budget instinct vs. dump-everything / "more is always better" / trusting advertised context) — `lessons/expert-context.md`, `questions/expert.yaml` `[interview]`.
- ✅ **[L4]** Whiteboard/defend a context-assembly design under questioning — `questions/expert.yaml` interview essay, `questions/deep-dive.yaml` design essay.

## Coverage summary
21 items · ✅ 21 covered · 🟡 0 partial · ⬜ 0 gap. Weighted coverage (covered=1, partial=0.5) = **100%**.
No open work remaining: the compaction-policy *coding* exercise (D5) is now covered by
`exercises/compact-fit`, and the frontier paper drill and effective-context metrics drill are covered
by `lessons/frontier-ops.md`.

<!-- coverage: items=21 covered=21 partial=0 gap=0 -->
