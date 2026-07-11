# Expert context: papers, frontier & interview

## Papers people and the frontier

Context engineering has a short, high-signal canon you should be able to name and summarize in an
interview:

- **"Lost in the Middle"** (Liu et al., Stanford, 2023) is the finding that models under-use facts
  buried in the *middle* of a long context. Retrieval accuracy over position is roughly U-shaped —
  strong at the start (primacy) and end (recency), weak in between. This is the paper to cite when
  someone asks why placement matters.
- **Needle-in-a-Haystack** and **RULER** (NVIDIA, 2024) are the long-context stress tests. A single
  fact ("needle") is hidden in a long distractor context and the model is asked to retrieve it; RULER
  generalizes this into a battery of synthetic tasks that expose the gap between a model's *advertised*
  context length and its *effective* one.

Tools you'd reference: **tokenizers** (tiktoken), **LangChain / LlamaIndex** context builders, and
memory libraries. Current SOTA is **retrieval + compaction pipelines**, and the "effective vs.
advertised context" gap is a live, actively-discussed concern. Open problems experts still argue
about: **principled compaction without information loss**, and **making long context actually usable**
rather than merely accepted by the API.

## Interviewing on context engineering

What a strong interviewer probes here:

- Do you treat the window as a **ranked budget** rather than a bucket? The senior instinct is to rank
  candidates by relevance and fit the top ones to a token budget, dropping the rest.
- Can you **reason about position and dilution** — cite "Lost in the Middle," explain the U-shaped
  curve, and put the most important evidence near the top or the very end?
- Do you know the difference between a long window and a *usable* one, and can you point at
  RULER / needle-in-a-haystack as the way you'd measure it?

**Red flags** that sink candidates: **dump-everything prompts**, ignoring **context rot** (stale or
low-value content crowding out signal), and the belief that **"more context is always better."** Asked
to design a context step, lead with **ranked selection to a budget**, then **deliberate ordering** for
position effects, then **compaction** for what remains — and name **"Lost in the Middle"** and
**RULER** as the prior art. Showing you know the canon *and* can reason about position, dilution, and
the effective-context gap is what reads as senior.
