# Memory & state — choosing the right memory for the need

## Matching a need to a memory type

The four memories are not interchangeable; each need has a *right* home, and putting data in the
wrong one is a design bug. The question to ask for any piece of state is: **how long must it live,
how is it looked up, and does it belong in the context window or outside it?**

- Need the **last few turns** so the model can follow the conversation? That is the **short-term
  buffer** — in-context, appended each turn, capped so it never grows without bound.
- Need to track **where you are in a multi-step task** (the plan, what's done, the current result)?
  That is the **working state / scratchpad** — in-context but *structured*, read and written by the
  agent mid-task rather than just accumulated.
- Need to recall a **fact or preference from a previous session** by meaning? That is the **long-term
  vector store** — external, written once, retrieved later by semantic similarity to the current
  query.
- Need a **durable record of what happened on each run**? That is the **episodic log** — external,
  append-only, queried by time or run id rather than by semantic meaning.

## Read/write patterns and tradeoffs

Where a memory lives dictates how you use it and what it costs. **In-context** memories (buffer,
scratchpad) are read for free by the model on the next call but consume tokens and are bounded by the
context window — capacity is small and every item competes for space. **External** memories (vector
store, episodic log) have effectively unbounded capacity but cost a retrieval step (a query, an
embedding lookup, latency) and can go **stale** — what you stored may no longer be true when you read
it back.

So the tradeoffs line up as: the buffer is fast and immediate but tiny and forgetful; the scratchpad
is precise but you must maintain it; the vector store is vast but adds retrieval latency and can
return stale or irrelevant hits; the episodic log is complete but is a record to query, not context
to reason in. Choosing well means putting each piece of state where its **lifetime** and its **access
pattern** match — not defaulting everything into the conversation buffer until the context window
overflows.
