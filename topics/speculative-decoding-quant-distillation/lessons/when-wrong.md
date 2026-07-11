# When each lever is the wrong tool

## Matching the lever to the goal

Most mistakes here are lever/goal mismatches — reaching for the tool that does not solve the problem in
front of you. Diagnose the *goal* first, then pick the lever.

- **Problem: memory/cost — the model barely fits, or cost-per-token is too high.** Reach for
  **quantization** (lower precision, smaller footprint) or **distillation** (a permanently smaller
  student). Reaching for **speculative decoding** here is the classic wrong move: it targets latency,
  adds a draft model, and shrinks nothing.
- **Problem: latency — responses come back too slowly, but cost is fine.** Reach for **speculative
  decoding**; it is lossless and directly attacks latency. Quantization *may* help latency as a side
  effect, but that is not what it is for, and distillation is a whole training project.
- **Problem: you cannot tolerate any quality change.** Only **speculative decoding** is lossless.
  Quantization and distillation both risk quality and must be validated with task evals.

Antipatterns to avoid:

- **Speculative decoding with a poor draft model** — low acceptance rate means little or no speedup.
- **Distilling volatile knowledge** — if the facts change constantly, a student baked at training time
  goes stale; that is a retrieval problem, not a distillation one.
- **Quantizing to "fix" a latency-bound decode** without measuring — you may cut memory yet leave the
  latency floor untouched, and pay a quality tax for nothing.

Levers also **compose**: a common frontier stack is distill → quantize → speculate, each attacking a
different axis. But you only reach for a lever once you have named the goal it serves.
