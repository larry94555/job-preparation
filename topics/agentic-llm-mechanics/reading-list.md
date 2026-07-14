# Reading list & staying current — agentic-llm-mechanics

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (context, tokens & cost)
- **Context-window & tokenizer docs (provider model reference).** The per-call token limit and how text
  becomes tokens. Notice that the window holds prompt *and* output together, and that token count — not
  character or word count — is what you budget against.
- **tiktoken (OpenAI tokenizer library).** How to actually count tokens for a string before you send it.
  Notice that counting is the prerequisite for both fitting the context window and estimating cost.
- **Model pricing pages (provider pricing).** Where per-token prices live, with input and output priced
  separately. Notice that cost per run is a token calculation, so a growing history that re-sends context
  each call gets expensive fast.

## Go deeper (long context & retrieval)
- **"Lost in the Middle: How Language Models Use Long Contexts" — Liu et al. (2023).** The load-bearing
  finding: retrieval accuracy is U-shaped over position, so facts in the middle of a long context are the
  most likely to be missed. Notice the takeaway is positional — put key info at the start or end — and
  that a bigger window does not fix it on its own.
- **Context engineering (practitioner writing on ordering, retrieval & compaction).** The engineering
  response to lost-in-the-middle and token budgets: retrieve the few most relevant passages, order by
  importance, and keep the context tight. Notice how it serves both quality and cost at once.

## Frontier (routing & cost/quality)
- **FrugalGPT — Chen et al. (2023).** Model cascades and confidence-based escalation: try a cheap model
  first and escalate only when the answer isn't good enough. Notice it is a real cost lever, not a solved
  problem — the escalation decision is itself a fallible component you must evaluate.
- **Learned routers (RouterBench / routing research).** Training a classifier to pick the tier per
  request. Notice the tradeoff: it generalizes past hand-written rules but adds a model that must be
  trained, calibrated, and can misroute.

## Failure modes (grounding, drift, hallucination)
- **A hallucination survey (e.g. "Survey of Hallucination in NLG").** Framing for why fluent output can be
  ungrounded and how grounding/verification reduces it. Notice that confidence is not correctness.
- **Instruction-following / drift evaluations (long-context instruction adherence studies).** Why
  adherence erodes over a long session and why re-asserting instructions helps. Notice drift is distinct
  from hallucination — losing the *task*, not inventing a *fact*.

## How to stay current on this topic
- Track **provider pricing and context-window changes** — the cost and budget math shifts under you.
- Follow **effective-context / long-context retrieval benchmarks**, not just advertised window size — the
  gap between "fits" and "used well" is where lost-in-the-middle lives.
- When a new routing technique appears, ask: *what does it guarantee vs. merely encourage, what does it
  trade, and what eval proves it?* — the same lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
