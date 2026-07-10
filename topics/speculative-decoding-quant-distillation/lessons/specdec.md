# Speculative decoding: draft, verify, accept

## Draft, verify, accept

Normal autoregressive decoding is serial: the target model produces one token, feeds it back, produces
the next, and so on. Each token is one full forward pass through a large model, so latency is bounded by
how fast that big model can step.

**Speculative decoding** breaks the serial bottleneck with two models:

1. **Draft.** A small, cheap **draft model** runs ahead and proposes several candidate tokens at once.
2. **Verify.** The large **target model** takes that whole drafted run and checks it in a *single
   parallel forward pass*, comparing what it would have produced against what was drafted.
3. **Accept.** The target keeps the longest correct **prefix** of the draft and discards the rest;
   from the first mismatch onward it substitutes its own token and the loop repeats.

The payoff is that one expensive verification pass can confirm *many* tokens at once, instead of one
token per pass. Crucially, the accepted tokens are exactly what the target model would have generated
alone — which is why speculative decoding is **lossless**.

## Acceptance rate and speedup

The lever only pays off when the draft is *good*. The key metric is the **acceptance rate**: the
fraction of drafted tokens the target verifies as correct.

- **High acceptance** — most drafted tokens survive, so each verification pass advances many tokens and
  you get a large speedup.
- **Low acceptance** — most drafts are rejected. You still paid to run the draft model *and* to verify,
  but only advanced a token or two, so the speedup shrinks and can even go negative.

That is why a self-speculative variant (Medusa, EAGLE) or a well-matched draft model matters: the whole
economics of speculative decoding rides on acceptance rate. And note what it does *not* do — it never
reduces memory, never shrinks the model, and never changes the output. It buys **latency** and nothing
else. If your problem is cost or footprint, this is the wrong lever.
