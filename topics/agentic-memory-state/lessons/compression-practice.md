# Memory & state — compression in practice: budget, consolidation, and the lossy risk

You already know compression at a glance: when the buffer would overflow, collapse the oldest turns
into a running summary. This lesson makes that operational — *why* it is consolidation, *how* the
budget arithmetic actually works, and *why* its lossiness is the source of some of the nastiest,
hardest-to-reproduce agent bugs.

## Summarizing old turns is consolidation

Compression is not deletion and it is not encryption — it is **consolidation**. Many verbose turns
collapse into a few sentences of durable state, and the conversation continues with that summary
standing in for everything it replaced. The raw tokens are discarded; the load-bearing content is
carried forward in condensed form. Thinking of it as consolidation (not "trimming") is what keeps the
focus on *preserving state* rather than merely *cutting length*: the goal is that the agent behaves as
if the old turns were still present, using far fewer tokens.

The trigger is a **budget threshold**, never a fixed cadence. You compress *when* the buffer would
otherwise exceed its token budget — not on every turn (wasteful, and it destroys detail you still
have room for) and not never (guaranteed overflow). Budget-triggered consolidation is the whole
discipline: watch the buffer's token cost, and consolidate the oldest turns only at the moment
retaining them raw would blow the budget.

## The summary counts toward the budget

The subtle part of the arithmetic is that **the summary is still context**. Replacing 4,000 tokens of
old turns with an 800-token summary only helps because 800 < 4,000 — but that 800 tokens now competes
for the same window. So the correctness condition for budget-triggered compression is:

> summary tokens + retained recent-turn tokens ≤ token budget

If your summary is so detailed that summary-plus-recent still overflows, you have not solved the
problem — you have just moved it. This is why summaries must be genuinely compact, and why an agent
that keeps *growing* its running summary without re-compressing it eventually overflows anyway. Keep
the summary tight, keep the most-recent turns intact, and re-verify the total against the budget after
every consolidation.

## Lossy compression is a source of subtle bugs

Compression is **lossy on purpose**, and that is exactly where it bites. Every token you drop is a
fact you are *betting* you will not need again. Keep the load-bearing content — **decisions**,
**established facts and constraints**, and **open tasks** — and drop chit-chat, greetings, and restated
reasoning whose conclusion you already captured. A good summary is the minutes of the meeting, not the
transcript.

But because the bet is sometimes wrong, aggressive summarization produces a distinctive failure: a
detail that seemed irrelevant when you compressed turns out to matter three turns later, and it is now
**gone** — not in the buffer, not in the summary, unrecoverable from context. The agent does not error;
it just quietly reasons without the missing fact, which reads as a puzzling, hard-to-reproduce mistake
(the bug depends on exactly when compression fired relative to when the detail was needed).

The mitigation is to **compress conservatively**: keep decisions and open tasks as verbatim as you can,
prefer to summarize only the clearly-safe chit-chat first, and treat any move toward more aggressive
summarization as a knob that trades tokens for the risk of silent forgetting. When you must choose,
losing a greeting is free; losing a constraint is a latent bug.
