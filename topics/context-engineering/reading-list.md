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

## Reception & what aged
- **"Lost in the Middle" aged remarkably well — the U-curve is now conventional wisdom.** The finding was
  replicated and extended: the positional sag first shown at 4K–32K windows was later confirmed to persist in
  128K+ models, and 2025 "context rot" studies across GPT-4.1, Claude 4, Gemini 2.5 and Qwen3 found newer
  models still don't use context uniformly and degrade as input grows. "Rank and place, don't just dump"
  became standard practice.
- **The paper described the *what*; later work supplied the *why*.** The original attributed the effect
  empirically; 2025 analyses tied it to architectural causes (causal masking, attention/positional dynamics),
  turning a surprising benchmark result into a better-understood property of transformers.
- **Needle-in-a-Haystack aged into a *floor*, not a ceiling.** NIAH became the ubiquitous first stress test,
  but the field quickly judged single-needle retrieval too easy — **RULER** was built precisely because NIAH
  is "only a superficial form of long-context understanding," generalizing to multi-needle, tracing, and
  aggregation tasks. Passing NIAH is now table stakes, not evidence of usable long context.
- **RULER succeeded at making "effective vs. advertised context" measurable and stuck.** Its framing — that
  the claimed window and the usable window diverge, often well before the stated limit — is now the standard
  lens for evaluating long-context claims, and it is routinely run out to very long sequence lengths.
- **The "long context replaces RAG?" debate is where this topic's stakes landed.** The positional/rot findings
  are a core reason retrieval + compaction pipelines persisted rather than being made obsolete by bigger
  windows — building the context stayed the unit of progress, exactly as the canon frames it.
