# Prompt vs. semantic caching — prefix mechanics & prompt structuring

## Prefix mechanics and structuring prompts for hits

Prefix caching matches from the **start** of the token stream and stops at the first token that
differs. That single fact drives everything about how you should structure a prompt.

Because the cache reuses the longest identical **leading** run, you want to arrange the prompt as a
**stable prefix followed by a variable suffix**:

- **Stable prefix (goes first):** the system prompt, standing instructions, tool definitions, and
  few-shot examples — the content that is identical across requests.
- **Variable suffix (goes last):** the user's specific question or the per-request context — the part
  that legitimately changes.

With this shape, the model reuses **prefill** for the whole shared prefix and only computes attention
for the short variable tail. The longer and more stable your prefix, the bigger the saving.

## Antipatterns that break prefix hits

Anything that perturbs the **leading** tokens destroys the exact-prefix match, even if the rest of the
prompt is unchanged:

- **Per-request variability at the top** — a timestamp, a unique request ID, or a session UUID placed
  before the stable content changes the first tokens on every call, so nothing downstream is reusable.
- **Reordering shared content** — shuffling few-shot examples or moving the instructions around changes
  the token sequence and breaks the match.
- **Putting the user's unique input first** — if the variable part leads, there is essentially no
  shared prefix left to reuse.

The rule of thumb: keep the front of the prompt **byte-for-byte identical** across requests, and push
every source of variation to the end.

**Why it matters.** Prompt structure is the one prefix-cache lever you fully control at serving time,
and it is free — get it right and every request pays for its short tail instead of the whole prompt.
