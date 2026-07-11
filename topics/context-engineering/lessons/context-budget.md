# Context engineering — the ranked token budget

## Context as a ranked token budget

The context window is not a scratch pad to fill; it is a **finite, ranked token budget** you allocate
on purpose. A model can only attend to what is inside the window, and every window has a hard token
limit. So the real question is never "what could I include?" but "given a fixed budget, what are the
*most valuable* tokens to spend it on?"

Thinking this way reframes the work:

- **Budget** — the window has a fixed number of tokens; you are always spending against a cap.
- **Rank** — candidate content (documents, prior turns, tool output) has different value; you must
  order it by relevance to the current task.
- **Fit** — you admit the highest-ranked content until the budget is spent, then stop.

The good pattern is **rank-then-fit-to-budget**: score candidates, then pack the top ones in until
you run out of room. The mirror-image antipatterns are **dump-everything** and **unranked
concatenation** — pasting all your documents into one long prompt and hoping the model sorts it out.

## The cost of padding

More context is not free, and it is not always better. Adding marginally-relevant tokens trades a
little extra recall against three real costs:

- **Dilution** — relevant signal is buried among noise, so the model is more likely to miss it or be
  distracted by it. This degradation as the window fills with low-value content is sometimes called
  **context rot**.
- **Cost** — you pay per token, so padding the window directly raises the bill.
- **Latency** — longer inputs take longer to process, slowing every call.

Because of this, "just add more context" plateaus and then reverses: past a point, extra tokens lower
task quality instead of raising it. Token **accounting** — knowing how many tokens each candidate
costs and what remains in the budget — is a core skill. When the budget is tight, the disciplined
move is to **compress** (summarize) or **drop** low-relevance content, not to keep concatenating.
