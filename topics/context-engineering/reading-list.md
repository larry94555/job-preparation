# Reading list & staying current — context-engineering

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **"Lost in the Middle" — Liu et al. (Stanford, 2023).** The paper that made position a first-class
  variable: models under-use information buried in the middle of a long context. Notice the U-shaped
  accuracy curve (strong at the start and end, sagging in the middle) — this is *the* reason to rank and
  place, not just dump. The single most important read for the topic.
- **Needle-in-a-Haystack.** The stress test that plants a single fact ("needle") in a long context and
  checks retrieval at every depth. Notice it turns "can the model use its window?" into a measurable
  sweep — the first tool for seeing the effective-vs-advertised gap with your own eyes.

## Go deeper (mechanism & measurement)
- **RULER — NVIDIA (2024).** The benchmark that generalizes needle tests into synthetic long-context
  tasks (multi-needle, tracing, aggregation). Notice how it exposes that *advertised* context length and
  *effective* usable length diverge — models often degrade well before their stated window.
- **Effective vs. advertised context (the live concern).** Not a single paper but the through-line of the
  above: the window a model *claims* is not the window it *uses well*. Notice this reframes context length
  from a spec-sheet number into something you must measure per model and per task.
- **Position bias & context rot.** Read the position finding together with the failure it predicts:
  accuracy that degrades as the window fills, independent of the answer being present. Notice that
  "the fact is in the context" is not the same as "the model will use it."

## Frontier — what to watch
- **Retrieval + compaction pipelines (SOTA now).** The frontier is not "bigger windows" but *building* the
  window: retrieve the right candidates, then compact them to fit. Notice the two failure surfaces —
  retrieval that misses, and compaction that drops the load-bearing detail.
- **Principled compaction without information loss (open problem).** How to summarize/prune overflow while
  provably keeping what matters. Watch for compaction methods that come with an eval, not a vibe — the
  open question is measuring what a summary *lost*.
- **Making long context actually usable (open problem).** Closing the effective-vs-advertised gap by
  architecture or serving, not just by advertising more tokens. Watch for claims that are eval-gated on
  RULER-style tasks, not on raw window size.

## Tools & implementations worth reading
- **Tokenizers — tiktoken.** Reading a real tokenizer is the fastest way to make "token budget" concrete:
  the window is counted in tokens, not words, and the count is what you rank and fit against.
- **LangChain / LlamaIndex context builders.** The assembly stacks that turn candidates into a prompt.
  Notice where they let you rank, truncate, and compact — and where a naive default just concatenates
  until it overflows.
- **Memory libraries.** The layer that decides what survives across turns. Notice they are a compaction
  policy in disguise: every "memory" is a bet about what is worth keeping in the budget.

## How to stay current on this topic
- When a new long-context result appears, ask whether it moves the **effective** context (measured on
  RULER / needle-style sweeps) or only the **advertised** window — the canon's central distinction.
- Track the **retrieval + compaction** pipeline as the unit of progress, not the raw window size; the
  interesting work is in *building* the context, not enlarging it.
- For any new context technique, ask the three canon questions: *what does it trade (quality/latency/
  budget), what regime does it win in, and what eval proves it?* — the same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
