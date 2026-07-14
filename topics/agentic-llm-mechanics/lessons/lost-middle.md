# LLM fundamentals for agents — lost in the middle

## Lost in the middle

A bigger context window is not the same as reliable use of that context. When you stuff a long document
or a long history into the prompt, the model does **not** attend to every position equally. Retrieval
accuracy as a function of *where* the relevant fact sits is **U-shaped**: information near the start and
the end of the context is used well, while information buried in the **middle** is the most likely to be
missed. This is the "lost in the middle" effect (Liu et al., 2023).

The practical consequence for an agent is that *placement* matters as much as *inclusion*. Simply having
the key fact somewhere in a 100k-token prompt does not guarantee the model will use it. Put load-bearing
instructions and the most relevant retrieved passages at the **start or end** of the context, not in the
soft middle — and keep the context tight rather than padding it, since a longer middle is more places for
a fact to get lost.

```python
def order_for_recall(system, key_facts, filler):
    # key facts at the edges (start & end), low-value filler in the middle
    return [system, *key_facts[:1], *filler, *key_facts[1:]]
```

This connects directly to token budgets: trimming context is not only about fitting under the window, it
also *improves* retrieval by shrinking the middle. See
[context-engineering](../context-engineering/topic.yaml) for ordering and retrieval strategy, and the
lesson below for what the research measured.
