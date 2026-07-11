# Expert context: papers, frontier & interview

## Papers people and the frontier

Prompt-vs-semantic caching is a short, nameable canon — two distinct caches with different failure
modes that a strong candidate can tell apart:

- **Semantic caching for LLMs** was popularized by **GPTCache** (Zilliz, 2023): embed the incoming
  query, look it up by **embedding similarity** against past queries, and return a stored response
  when the nearest neighbor is close enough. It leans on a vector store (e.g. **Redis** / vector
  databases) to hold the embeddings and answers.
- **Provider prompt / prefix caching** (**Anthropic**, **OpenAI**) is the other cache. It matches on
  **exact leading tokens** of the prompt and reuses the **prefill** compute for that shared prefix —
  it does *not* return a stored answer, and a hit requires identical (not merely similar) leading
  tokens.

Tools you'd reference: **GPTCache**, **Redis** / vector stores for the semantic side; provider
**prefix caching** for the exact-prefix side. Current SOTA is **layered caching**: an exact
leading-token prefix cache in front of an embedding-similarity semantic cache, with safety guards on
what the semantic layer is allowed to serve.

Open problems experts still argue about: choosing **safe similarity thresholds** (too loose and you
serve a wrong-but-close answer), **invalidation** for semantic caches (when does a stored answer go
stale?), and **evaluating cache correctness** — measuring how often a "hit" was actually the right
answer.

## Interviewing on prompt vs semantic caching

What a strong interviewer probes here:

- Can you **tell the two caches apart** — prefix caching reuses *prefill compute* on identical
  leading tokens, while semantic caching returns a *stored response* on an embedding-similarity
  match? Conflating them is the fastest way to look shallow.
- Can you reason about each one's **risks and savings** — that a semantic false-positive returns a
  wrong answer, while a prefix cache only ever saves compute and can't return a wrong answer?
- Do you structure prompts as a **stable prefix + variable suffix** to maximize prefix hits, and know
  that reordering the prompt breaks those hits?

**Red flags** that sink candidates: putting a **semantic cache on high-stakes answers** where a
close-but-wrong hit is dangerous, **reordering prompts** in a way that breaks prefix hits, and
**tenant-blind cache keys** that leak one user's cached answer to another. Asked to design a caching
layer, lead with an **exact-prefix cache** for compute savings, add a **semantic cache with a safe
threshold** only where a slightly-off answer is acceptable, and name **GPTCache** as the prior art
for the semantic side and **provider prefix caching** for the exact side.
