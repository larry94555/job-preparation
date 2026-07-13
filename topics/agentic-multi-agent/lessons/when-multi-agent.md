# Multi-agent orchestration — when multi-agent is worth it

## One agent first

The default answer to "should this be multiple agents?" is **no, not yet**. A single agent with a good
prompt and the right tools handles most tasks, and every agent you add is a new moving part: another
prompt to maintain, another place a **handoff** can go wrong, more latency, and more tokens burned per
run. Reach for a **single** agent first, and add specialists only when one agent *demonstrably* can't
do the job.

What does "can't do the job" look like? The task needs genuinely different skills or tool sets that
don't fit one focused prompt; a single agent's context gets so crowded it loses the thread; or you need
one agent's work independently reviewed by another. Those are real reasons to split. "It feels more
sophisticated" is not.

```python
# Start here. Only split when this clearly falls short.
def run(task):
    return agent(task, tools=[search, read_file, write_file])
```

## More agents is not better

It is tempting to believe that if one agent is good, six are better — that more agents means more
capability. They don't. Each added agent multiplies the **coordination** cost and introduces a new
seam where a bad output can slip through. A six-agent pipeline has six prompts to keep correct and five
handoffs that can each silently pass along garbage.

The honest tradeoff: multi-agent buys you specialization and independent review, and it costs you
latency, money, and new failure modes (the ones the next lessons are about — unvalidated handoffs,
silent bad outputs, and approval loops with no exit). It is worth paying that cost **only** when a
single agent genuinely falls short, never as a reflex. When you do split, keep each agent's budget
bounded — see [agent-guardrails-budgets](../agent-guardrails-budgets/) — and route work to the
right model with [model-routing-fallback](../model-routing-fallback/).
