# Prompt vs. semantic caching — two caches, two hit conditions

## Two caches and two hit conditions

There are two completely different things people call "caching" in front of an LLM, and they hit under
different conditions.

- **Prefix (prompt) caching** reuses the model's already-computed **attention state** for identical
  **leading tokens**. It hits only on an **exact-prefix match**: if the first N tokens of a request are
  byte-for-byte the same as a request the model just processed, the work for those tokens can be
  reused. A single differing token changes every downstream attention computation, so there is no
  "close enough" here.
- **Semantic caching** works one level up, outside the model. It **embeds** the incoming request and
  looks for a stored request whose embedding is within a **similarity threshold**. On a hit it returns
  the previously stored **response** — without calling the model at all.

So one cache asks *"are the leading tokens identical?"* and the other asks *"does this request mean
roughly the same thing as one I've seen?"*

## What each one saves

The two caches save different amounts of work, and this is the crux of the distinction:

- A **prefix-cache hit** reuses the **prefill** computation for the shared leading tokens. The model
  **still generates** a fresh completion for the variable suffix. You save prefill compute, not the
  whole call.
- A **semantic-cache hit** skips the model entirely and returns a stored answer, so it saves the
  **full generation** — every token of prefill *and* decode.

That larger saving is exactly why semantic caching is riskier: because it never re-runs the model, a
wrong match ships a wrong answer.
