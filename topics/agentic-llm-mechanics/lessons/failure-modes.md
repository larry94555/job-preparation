# LLM fundamentals for agents — failure modes

## Where models fail

Treating the model as a component means knowing *how* it breaks, so the agent around it can defend
against each mode. Four failures dominate.

- **Hallucination.** The model returns fluent, confident output that is simply not grounded in any real
  source — an invented citation, a plausible but wrong API name, a fabricated fact. Confidence is *not*
  correctness. The mitigation is **grounding**: fetch facts with tools or retrieval and validate claims
  against those sources rather than trusting the model's memory.
- **Lost in the middle.** In a long context, a fact buried in the **middle** is the most likely to be
  missed (a U-shaped retrieval curve). Mitigation: put key information at the **start or end** and keep
  the context tight instead of stuffing it. See [context-engineering](../context-engineering/topic.yaml).
- **Instruction drift.** Over a long multi-turn session the model gradually stops following its original
  system instructions as competing context accumulates. Mitigation: periodically **re-assert** or
  re-inject the governing instructions so they stay salient near the model's attention.

```python
def maybe_reassert(turn, system_prompt, every=8):
    # re-inject the governing instructions periodically to fight drift
    return system_prompt if turn % every == 0 else None
```

- **Latency.** More output tokens means more wall-clock time, because decoding is one token per step. A
  slow model on a hot path degrades the whole agent. Mitigation: **route** the task to a faster/cheaper
  tier and trim the token budget so there is less to generate.

The theme: each failure has a named, concrete mitigation the *agent* — not the model — is responsible
for. See [production-failure-modes](../production-failure-modes/topic.yaml) for the operational playbook.
