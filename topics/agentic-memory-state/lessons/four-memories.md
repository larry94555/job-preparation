# Memory & state — the four memories every agent needs

## Why an agent needs memory

A model call is stateless: it sees the messages you hand it and nothing else. An agent built on top of
that call, with no memory of its own, has no way to know what it already tried, what it learned last
session, or what the user told it ten turns ago. The failure mode is concrete and ugly — **an agent
with no memory repeats itself forever**: it re-asks a question it already answered, re-runs a tool
whose result it has already seen, and re-derives a fact it established a minute earlier.

Memory is what turns a sequence of isolated model calls into an agent that *accumulates* — it
remembers the recent conversation, keeps track of the task it is in the middle of, recalls relevant
facts from long ago, and knows what it did on previous runs. In practice these are four distinct
memories, each with a different job, and an agent that is missing one has a specific, predictable
weakness.

## The four memories

- **Short-term conversation buffer.** The most recent turns of the dialogue, held *in context* and
  **capped** to a fixed number of messages (or tokens). This is the agent's working ear — what was
  just said. Without it, the agent forgets the last thing the user asked and cannot carry a
  multi-turn exchange.
- **Working state / scratchpad.** Structured, task-specific state the agent **reads and writes
  mid-task** — a plan, a checklist, intermediate results, the current sub-goal. It is not the raw
  transcript; it is the distilled state of the job in progress. Without it, a multi-step task loses
  its place and the agent cannot tell which steps are already done.
- **Long-term store.** A durable, external **vector / embedding store** for semantic recall *across
  sessions*. Facts, preferences, and past conclusions are embedded and looked up by meaning, not by
  position in the transcript. Without it, everything learned in one session is gone at the start of
  the next.
- **Episodic history.** A durable **log of past episodes / runs** — what the agent did, in what
  order, and how it turned out. It is the audit trail and the source of "have I done this before?".
  Without it, the agent cannot learn from or refer back to its own past behavior.

The short-term buffer and the working scratchpad live **in context** (they are part of the prompt on
the next call); the long-term store and episodic history live **externally** and are pulled in on
demand. Keeping the four straight — recent talk, current task state, durable semantic memory, and a
run log — is the foundation everything else in this topic builds on.
