# Build it: speculative-decoding acceptance

## Draft verify accept

Speculative decoding speeds up generation by using a **small draft model** to propose several tokens
at once, then having the **target model verify them in a single parallel pass**. The target accepts
the longest correct **prefix** of the draft, then emits **one more** token — either the correction to
the first wrong token, or a bonus token when the whole draft was accepted.

Two properties make this the go-to latency lever:

- **Lossless.** The output is *identical* to what the target model would have produced alone — you are
  only guessing tokens the target then confirms, so quality is unchanged. (This is what distinguishes
  it from quantization, which trades quality for speed.)
- **Acceptance rate drives the speedup.** If the draft is usually right, you emit many tokens per
  verification step; if it's usually wrong, you fall back toward one token per step. The whole payoff
  lives in the acceptance rate.

## Counting accepted tokens

Given which drafted tokens the target matched — a list of booleans in draft order — the number of
tokens produced in that verification step is:

**(count of leading `true`s, stopping at the first `false`) + 1.**

The `+1` is the token the target always emits (the correction, or the bonus). Examples:

- `[true, true, false]` → 2 leading matches + 1 = **3**
- `[false, …]` → 0 + 1 = **1** (a fully-wrong draft still yields one real token — never zero)
- `[true, true, true]` → all 3 accepted + 1 bonus = **4**
- `[]` (no draft) → **1**

Stopping at the **first** reject matters: you can't keep a later match after an earlier miss, because
once the target and draft diverge, everything after that point is off the target's true path.
