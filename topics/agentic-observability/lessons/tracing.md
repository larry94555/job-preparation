# Observability & tracing — without tracing you are guessing

## Without tracing you are guessing

An agent that works on your laptop can misbehave in production in ways you never see coming: a run
costs ten times what you expected, a tool call hangs for thirty seconds, one request in a hundred fails
in a way none of your tests reproduced. When that happens, the first question is always the same —
*what did the agent actually do?* Without a record of each step, the only answers you have are a final
output and a guess.

**Tracing** is how you stop guessing. Instead of treating a run as one opaque call, you record *what
happened at every step*: which model was called, how many tokens it used, what it cost, how long it
took, which tool it invoked, and whether that step errored. With that record you can replay a failing
run and point at the exact step that went wrong — the slow tool, the retry storm, the step where cost
spiked. Without it, a production incident is a blank page and a story you invent.

This is the same discipline as logging and distributed tracing in any backend system, adapted to the
shape of an agent. The unit is not a line of log text but a **structured step** you can add up, sort,
and compare across thousands of runs. The cross-topic view lives in [llm-observability](../llm-observability/)
and [cost-attribution](../cost-attribution/); this topic is about recording it *per agent step*.

## Every run is a trace

The core object is the **trace**: the complete record of one agent run, made of the ordered **steps**
the agent took. A trace has an id so you can find it again, and it accumulates the totals you care about
— total cost, total latency — as steps are appended.

```python
from dataclasses import dataclass, field

@dataclass
class Trace:
    trace_id: str
    steps: list = field(default_factory=list)
    total_cost: float = 0.0
    total_latency_ms: float = 0.0
```

Give every run a **trace_id** and every step lands under it; that id is what ties a user complaint
("run `r-4817` was slow") back to the exact sequence of steps the agent took. A trace you can look up
by id turns "the agent is slow sometimes" into "step 3 of run `r-4817` spent 8s in `search_web`" — a
fact you can act on instead of a vibe you argue about.
