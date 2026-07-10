# Build it: an adaptation decision function

## The decision axes

The four ways to adapt a model map to four different *needs*:

- **RAG** — when you need **fresh / changing facts** or **citations (attribution)**. You retrieve
  current, attributable documents at query time.
- **Fine-tuning** — when you need a **behavior or format change** (style, structure), not new facts.
- **Distillation** — when you need **lower latency / cost** on a *fixed* behavior you already have.
- **In-context (few-shot)** — when the task is simple enough that examples in the prompt suffice.

The single most common **antipattern** is **fine-tuning to keep up with volatile facts**: fine-tuned
weights are frozen, so the facts go stale. Anything needing fresh or cited facts should use **RAG**.

## Ordering the checks

Because a request can trip more than one axis, precedence matters:

1. `freshness` OR `attribution` → **rag**
2. else `behaviorChange` → **fine-tuning**
3. else `lowLatency` → **distillation**
4. else → **in-context**

The order encodes the antipattern fix: a request that needs **both** fresh facts **and** a format
change resolves to **rag**, because fine-tuning can't keep facts current — you'd layer a format change
on top separately, but you never reach for fine-tuning to solve the *facts* problem. Get the ordering
wrong and the decision function will happily recommend the wrong tool.
