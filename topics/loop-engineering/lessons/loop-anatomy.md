# Loop engineering — anatomy of an agent loop

## What a loop is

A single model call maps a prompt to a response — useful, but it acts once and stops. An **agent** is
a model wrapped in a **loop**: it observes the current state, decides an action, the harness executes
that action, and the result is fed back so the next decision is grounded in what actually happened. The
loop repeats until the goal is met or the harness stops it.

The distinction that matters is **loop vs. pipeline**. A pipeline runs a fixed sequence of steps
exactly once; a loop runs a **variable** number of iterations chosen at runtime from what it observes.
"Summarize this document" is a pipeline — one pass, done. "Fix this failing test" is a loop: you can't
know in advance how many edit-and-run cycles it takes, so the number of iterations is decided by the
observations, not written down ahead of time.

This is why we say **the loop is the unit of agent design**. You build an agent by designing its loop —
what it observes, what actions it can take, how it verifies, and when it stops — not by writing one
larger prompt.

## The observe-decide-act-verify cycle

Each iteration has four phases, and knowing who owns which is the whole game:

- **Observe** — the harness assembles the current context: the goal, the relevant history, and the
  result of the last action.
- **Decide** — the model proposes the next action: a tool call, an edit, or "I'm done." This is the
  **only** phase the model owns.
- **Act** — the harness executes the proposed action against the real world.
- **Verify** — the harness checks what actually happened (did the tool succeed? do the tests pass?)
  before the next observe.

The model reasons; the harness does everything else. The verify phase is the one teams most often drop,
and it is the one that matters most: a model's claim that an action worked is not a fact. Skip verify
and the loop keeps deciding on a **false belief** — it "fixed" a bug that is still broken and happily
moves on. Verification turns the model's claim into a checked result before it feeds the next decision.

## Loop state and termination

Two things separate a working loop from a runaway one.

**Loop state** is what carries across iterations — the goal, the running history, a scratchpad of
intermediate results, and the last observation. It has to be **managed**, not merely accumulated. Raw
history grows every turn, and that growth is both the running **cost** (every past observation is
re-sent and re-billed) and a source of **confusion** (the important signal gets buried). What to keep,
summarize, or drop is a deliberate design decision.

**Termination** is an explicit output, not a hope. Every loop must be able to end for a **named**
reason:

- **done** — the goal is verified (not just claimed),
- **budget** — a step, tool, token, or time cap was hit,
- **no-progress** — the loop is stuck (repeating actions or states without changing anything).

A loop whose only exit is the model declaring victory is **unbounded**: it can spin forever, oscillate
between two wrong states, or run away the bill. The harness — not the model — owns when to stop, and
why it stopped is reported so the caller can react.

**Why this matters.** These four phases plus managed state and named termination are the skeleton every
later idea hangs on. A loop that observes, decides, acts, and — crucially — **verifies**, carrying only
the state it needs and ending for a named reason, is an agent that finishes. One that trusts its own
claims and never stops is just an expensive way to loop forever.
