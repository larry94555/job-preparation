# Single-agent workflows — expert context

## The ReAct pattern

The loop this topic teaches has a name and a paper. **ReAct — Yao et al. (2022), "ReAct: Synergizing
Reasoning and Acting in Language Models"** — is the work that put the Reason→Act→Observe cycle on the
map. Its claim is that reasoning and acting are better *together* than apart.

- **Reasoning alone** (chain-of-thought) lets a model plan, but it is untethered: nothing checks the
  plan against the world, so it drifts and hallucinates facts.
- **Acting alone** (calling tools without visible reasoning) gathers real information, but the model has
  no explicit plan tying the calls together, so it flails.
- **ReAct interleaves them.** The model writes a **Thought**, takes an **Action**, reads an
  **Observation**, and loops. The reasoning trace decides and revises the next action; the observations
  feed real information back into the reasoning. Each improves the other — that is the *synergy* in the
  title.

```
Thought: I need the current price, so I'll look it up.
Action: get_price
Action Input: {"ticker": "ACME"}
Observation: 41.20
Thought: I have the price; I can answer now.
```

The durable idea is that a single agent's competence comes from *closing the loop* between thinking and
doing, not from a bigger model or a longer prompt. Everything senior about running one agent — the step
kind that drives the loop, feeding observations back, and the guardrails in the next section — is built
on this pattern. Knowing that ReAct (Yao 2022) is where "reason, act, observe, repeat" comes from, and
*why* the reason+act synergy beats either half alone, is what reads as expert.

See [harness-engineering](../../harness-engineering/) and
[agent-guardrails-budgets](../../agent-guardrails-budgets/) for how this pattern is operationalized.
