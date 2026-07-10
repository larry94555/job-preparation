# Context engineering — position effects

## Lost in the middle

Where a fact sits in the context window changes how well the model uses it. Empirically, models use
information best when it appears at the **start** or the **end** of the window and worst when it is
buried in the **middle** — a pattern documented as "lost in the middle" (Liu et al., 2023).

Plotted against position, retrieval accuracy is roughly **U-shaped**:

- **Primacy** — content near the beginning of the window is used well.
- **Recency** — content near the end of the window is used well.
- **The middle** — content in the middle is the most likely to be overlooked, even when it is exactly
  the piece the task needs.

This is why simply having a fact *somewhere* in a long context is not enough. A relevant document
dropped into the middle of a large concatenation can be effectively invisible to the model, which is
one more reason unranked "dump-everything" prompting underperforms.

## Placing important context

The practical consequence: **position is a lever you control.** Once you have selected what goes in
the window, order it deliberately.

- Put the **single most important** evidence near the **start** or the **very end**, not in the
  middle.
- If you have one instruction the answer depends on, restating or anchoring it at the end (recency)
  is often worth the tokens.
- Be aware that as history grows, older-but-important material drifts toward the middle and loses
  effectiveness — a reason to summarize or re-surface it rather than let it sink.

Long-context evaluations such as needle-in-a-haystack and RULER exist precisely to measure this: they
vary the position of a target fact and show that advertised context length is not the same as
**effective** context. Treat position, not just inclusion, as part of context engineering.
