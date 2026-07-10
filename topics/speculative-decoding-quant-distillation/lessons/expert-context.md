# Expert context: papers, frontier & interview

## Papers people and the frontier

Speculative decoding, quantization, and distillation each have a short, nameable canon you should be
able to summarize in an interview:

- **Speculative decoding** — draft-and-verify, and importantly **lossless** — was introduced by two
  concurrent 2023 works: **Leviathan et al.** (Google) and **Chen et al.** (DeepMind). A small, cheap
  draft model proposes several tokens ahead; the large target model verifies them in one parallel
  forward pass and accepts the longest correct prefix. Because verification uses the target model's own
  distribution, the output is exactly what the target model would have produced — only faster.
- **Self-speculative heads** fold the drafter into the target model instead of running a separate one.
  **Medusa** (Cai et al., 2024) adds extra decoding heads that predict multiple future tokens; **EAGLE**
  drafts at the feature level. Both remove the need to serve and align a distinct draft model.
- **Knowledge distillation** — training a small **student** to mimic a large **teacher** — traces to
  **Hinton et al.** (2015). It yields a permanently smaller, cheaper model, at the cost of upfront
  training.

Tools you'd reference: **vLLM** and **TensorRT-LLM** speculative-decoding support, plus **Medusa/EAGLE**
implementations. Current SOTA has speculative decoding widely deployed, and teams **stack the levers** —
distill, then quantize, then speculate — to compound the wins. Open problems experts still argue about:
sustaining **high acceptance across domains**, and **combining levers without quality loss**.

## Interviewing on speculative decoding, quantization & distillation

What a strong interviewer probes here:

- Can you **match each lever to its goal**? Speculative decoding attacks **latency**; quantization
  attacks **memory/cost**; distillation gives a **smaller model**. Confusing these is the fastest way
  to sound like you've only read the headlines.
- Do you know **which lever is lossless**? Speculative decoding is (the output matches the target
  model); quantization and distillation both trade some quality for their gains.
- Can you reason about **acceptance rate** — that a poor draft with low acceptance can yield little
  speedup or even a slowdown, because rejected drafts waste verification work?

**Red flags** that sink candidates: proposing **speculative decoding with poor acceptance**,
**distilling for volatile facts** (a student freezes what it learned at training time), or **quantizing
to "fix" latency** (quantization targets memory/cost, not the decode-step latency speculative decoding
addresses). Asked to speed up or shrink a deployment, name the right lever for the stated goal, say
which one is lossless, and — if you stack them — order it distill → quantize → speculate. Matching each
lever to its goal, and knowing what each costs, is what reads as senior.
