# Retrieval evals — grounding vs. retrieval failures

## Two failures that look the same from outside

A user reports a wrong answer. That single symptom hides two distinct root causes, and the whole point
of component-isolated evals is to tell them apart:

- **Retrieval failure** — the supporting passage never made it into the context window. recall@k is
  low. No matter how faithfully the model writes, it cannot produce a grounded answer from evidence it
  never saw.
- **Grounding (faithfulness) failure** — the correct passage *was* in context, but the answer
  contradicts it or asserts things it does not support. Retrieval succeeded; generation drifted.

## Diagnosing which one you have

The decisive check is simple: **was the needed passage in the retrieved context?**

1. If **no** → retrieval failure. Fix upstream: better chunking, hybrid (dense + sparse) search, a
   larger candidate k, or reranking to lift recall.
2. If **yes**, but the answer still doesn't follow from it → grounding failure. Fix generation:
   tighten the prompt, add faithfulness constraints, or run a grounding check that flags claims not
   entailed by the context.

An answer that only asserts what the retrieved context supports is called **grounded** (or
**faithful**). Because end-to-end-only evals conflate these two failures, applying the retrieval fix to
a grounding bug — or the reverse — burns effort without moving the metric. Isolate first, then fix.
