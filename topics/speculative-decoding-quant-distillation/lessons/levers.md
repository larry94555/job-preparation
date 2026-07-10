# Three levers, three goals

## The three levers and three goals

When inference is too slow or too expensive, three distinct levers are on the table — and the whole
skill is matching each one to the problem you actually have.

- **Speculative decoding** targets **latency**. It makes each response come back faster without
  changing what the model says. It does *not* shrink memory or cut the model's size.
- **Quantization** targets **memory and compute cost**. It stores weights (and sometimes activations)
  in a lower bit-width — INT8, INT4 — so the model takes less memory and often runs cheaper.
- **Distillation** targets **model size permanently**. You train a smaller **student** model to mimic a
  larger **teacher**, ending up with a model that is smaller and cheaper to serve forever after.

They are not interchangeable. Speculative decoding does nothing for a memory problem; quantization does
nothing to guarantee your latency floor; distillation is a training project, not a config flag.

## Lossless vs lossy

The sharpest way to tell the levers apart is to ask **what they cost you in quality**.

- **Speculative decoding is lossless.** It produces *exactly* the tokens the target model would have
  produced on its own — the draft model only helps you reach them faster. Output quality is untouched.
- **Quantization is lossy.** Rounding weights to fewer bits perturbs the model, so there is a real risk
  of quality degradation that you have to measure with task evals.
- **Distillation is lossy and upfront.** The student is a different, smaller model; it approximates the
  teacher but will not match it exactly, and you pay a training cost before you serve it.

So the decision has two axes: which **goal** you are chasing (latency vs. memory/cost vs. a smaller
model) and how much **quality risk** you can tolerate. Speculative decoding is the only free lunch on
quality — and it is also the only one that does nothing for cost.
