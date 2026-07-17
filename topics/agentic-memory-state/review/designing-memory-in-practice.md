---
title: "Designing memory in practice"
order: 1
covers:
  - mc-no-memory
  - mc-wrong-memory-bug
  - mc-keep-drop
---
## Designing memory in practice

**In brief.** A model call is stateless, so every piece of an agent's state has to be deliberately
placed in one of the four memories. Placing it wrong never raises an error — it produces a quiet bug,
and the most common one is task state that the summarizer eats.

**The placement rule.**

- **Why memory exists at all** — a model call sees only the messages you hand it and nothing else. An
  agent with no memory of its own has no record of what it tried or learned, so it repeats itself
  forever: re-asking a question it already answered, re-running a tool whose result it has already
  seen, re-deriving a fact it established a minute earlier. Memory is what turns isolated calls into
  an agent that accumulates.
- **Lifetime and access pattern** — the two questions that place any piece of state. How long must it
  live (this turn, this task, this session, forever), and how is it looked up (by recency, by run id,
  or by semantic meaning)? Defaulting everything into the conversation buffer until the window
  overflows ignores both.
- **Buffer versus scratchpad** — both ride in context, but they are not interchangeable. The buffer is
  a raw, capped, append-only rolling window of recent turns. The scratchpad is distilled, structured
  task state — the plan, what's done, the current sub-goal — that the agent reads and **rewrites**
  mid-task.
- **The memory-type mismatch bug** — keeping an evolving multi-step plan in the raw conversation
  buffer instead of a structured scratchpad. The plan is diluted among chit-chat and raw turns,
  competes with them for the same token budget, and when the buffer compresses it can be summarized
  away or pushed out entirely. Working state has a different lifetime and access pattern from recent
  chat, so it needs its own home.

**What survives a compression pass.**

- **Keep** — **decisions** the agent or user made ("we chose Postgres", "the deadline is Friday");
  **established facts and constraints** (names, ids, requirements, preferences); and **open tasks** —
  what still has to be done. Keep these as verbatim as you can.
- **Drop** — greetings, chit-chat, restatements, and verbose reasoning whose conclusion you have
  already captured.
- **The test** — a good summary is the minutes of the meeting, not the transcript.
- **The bet** — compression is lossy on purpose, so every dropped token is a fact you are wagering you
  will not need. Losing a greeting is free; losing a constraint is a latent bug. Compress
  conservatively and summarize the clearly-safe chit-chat first.

**Why it matters.** Memory bugs rarely announce themselves — the agent does not error, it just quietly
reasons without the fact it lost — so the defense is placing state by lifetime and access pattern up
front, and keeping decisions, constraints, and open tasks out of the summarizer's path.
