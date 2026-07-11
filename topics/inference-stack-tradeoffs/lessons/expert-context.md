# Expert context: papers, frontier & interview

## Papers people and the frontier

Inference-stack tradeoffs is an **integrative** topic: it has no single defining paper of its own.
Instead it draws on the serving systems named across the other serving topics and asks how they
*interact* when you assemble a real stack. The canon you should be able to name:

- **FrugalGPT** (Chen et al., 2023) framed **cost/quality cascades** for LLMs: route easy requests to
  cheap models and escalate only the hard ones, cutting cost while holding quality. It's the reference
  point for reasoning about cost as a first-class axis, not an afterthought.
- The **serving levers** are the systems from the throughput/latency topics, reused here as the knobs
  you actually turn:
  - **vLLM** (paged attention) for KV memory efficiency,
  - **Orca** (iteration-level / continuous batching) for throughput,
  - **Sarathi** (chunked prefill) for balancing the prefill and decode phases.
  This topic is integrative — it stands on those named systems rather than introducing new ones.
- **Roofline / serving analyses** give you the mental model for whether a workload is compute-bound or
  memory-bandwidth-bound, so you know which lever can actually move the needle.

Tools you'd reference: **vLLM, TensorRT-LLM, SGLang** as the serving engines; **load-testing
harnesses** to measure under realistic traffic; and **combined eval + cost + observability stacks** so
you're optimizing all four axes together rather than one in isolation.

Current SOTA is **SLO-anchored stack design**: you fix the latency/quality/cost/reliability targets
first, then compose levers to hit them, treating the whole thing as a **joint latency/cost/quality/
reliability optimization**. Open problems experts still argue about: genuine **joint multi-objective
optimization** (the levers interact, so tuning one perturbs the others), **predictable SLOs under
load**, and **interaction effects** between levers you can't reason about one at a time.

## Interviewing on inference-stack tradeoffs

What a strong interviewer probes here:

- Given a proposed change (turn on continuous batching, quantize to INT4, add a semantic cache, add a
  fallback model), can you **reason about its effect on all four axes** — latency, quality, cost, and
  reliability — not just the one it's meant to improve?
- Do you **anchor on SLOs**? A senior answer starts from TTFT/TPOT/p99 and cost-per-successful-task
  targets and works backward to the stack, rather than optimizing a number in a vacuum.
- Can you name the **dominant axis** each lever moves and its hidden cost (batching buys throughput at
  the price of tail latency; quantization buys memory/speed at a quality risk; caching buys cost/latency
  at a staleness/correctness risk)?

**Red flags** that sink candidates: **single-metric optimization** (tuning throughput while tail
latency or quality quietly regresses); claiming a **"free lunch"** (any lower-cost/faster answer with
no tradeoff named); **premature optimization** before SLOs are set; and **ignoring the reliability
cost** of the levers you add. Asked to design a serving stack, lead with the **SLOs**, decompose the
**budget** across stages, then pick levers and **name the tradeoff each one carries** — citing
**FrugalGPT** for cost cascades and **vLLM/Orca/Sarathi** as the levers. Showing you optimize the whole
frontier at once, honestly, is what reads as senior.
