# Adaptation strategy — the four approaches

## The four approaches at a glance

Adapting a model to your task or domain is a choice among four levers. Each changes a *different* thing:

- **In-context learning (ICL)** — steer the model at inference time with instructions and few-shot
  examples in the prompt. Nothing permanent changes; the weights and your corpus are untouched. It is
  the cheapest, fastest-to-iterate lever, bounded by the context window.
- **RAG (retrieval-augmented generation)** — fetch relevant documents at query time and place them in
  context. This adds **knowledge** — especially *fresh*, *private*, and *citable* knowledge — without
  changing the weights.
- **Fine-tuning (SFT, LoRA/PEFT)** — update the weights on your examples. This durably changes
  **behavior**: format, style, tone, and task reliability. It is a poor place to store facts that
  change.
- **Distillation** — train a smaller **student** model to reproduce a larger **teacher's** known-good
  behavior, cutting deployment cost and latency.

## What each one changes

The one-line mental model: **ICL and RAG change what's in the prompt; fine-tuning changes the weights;
distillation changes which model you deploy.**

RAG is about *knowledge* — what the model can see. Fine-tuning is about *behavior* — how the model
acts. Confusing the two is the root of most bad adaptation decisions: you cannot retrieve your way to a
new behavior, and you cannot fine-tune your way to always-current facts. Distillation is a *deployment*
move — it copies behavior you already trust into a cheaper package, so it only makes sense once that
behavior is validated.

Getting this four-lever mental model right is the whole game: every later decision axis and antipattern in this topic is just an application of *which thing you're actually trying to change.*
