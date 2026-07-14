# LLM fundamentals for agents — what the research says about long context

## What the research says about long context

The "lost in the middle" intuition has a concrete empirical grounding worth naming, because it is the
kind of finding that separates someone who *reasons about the model as a component* from someone who
treats long context as free.

- **"Lost in the Middle: How Language Models Use Long Contexts" (Liu et al., 2023)** measured retrieval
  accuracy against the *position* of the relevant fact in a long input. The result is a **U-shaped
  curve**: accuracy is high when the answer is at the beginning or the end and dips markedly when it is in
  the middle. The takeaway is positional and durable — put key information at the **start or end**, and do
  not assume a larger window fixes retrieval on its own.
- **Context windows have grown fast**, but window *size* and *effective* use are different axes. A model
  advertising a very large window can still degrade on mid-context retrieval, so "it fits" is a necessary,
  not sufficient, condition for "the model will use it."
- The engineering response is **context engineering**: order content by importance, retrieve the few most
  relevant passages instead of dumping everything, and keep the budget tight. This is the same discipline
  the token-budget lesson uses for cost, applied to *quality* of retrieval.

Knowing *which* finding backs the advice — and that it is about position, not raw size — is what reads as
senior. See [context-engineering](../context-engineering/topic.yaml) for the practical playbook and
`reading-list.md` for the primary source.
