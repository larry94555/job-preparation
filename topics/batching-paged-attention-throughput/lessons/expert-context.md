# Expert context: papers, frontier & interview

## Papers people and the frontier

Batching and throughput is a serving-systems topic, and its canon is a short list of work you should
be able to name and summarize in an interview:

- **Iteration-level (continuous) batching → Orca** (Yu et al., OSDI, 2022). Orca introduced scheduling
  at the granularity of a single decode *iteration* rather than a whole request. Finished sequences
  leave the batch and waiting ones join immediately, instead of the batch running until its slowest
  member completes. This is what people mean by "continuous batching," and it is the idea that made
  static batching obsolete for variable-length generation.
- **Paged KV → vLLM / PagedAttention** (Kwon et al., 2023) stored the KV cache in fixed-size,
  **non-contiguous blocks** tracked by a block table, eliminating the external fragmentation that
  capped how many sequences could run concurrently. Paged attention pairs naturally with continuous
  batching and is now table stakes in serving stacks.
- **FlashAttention** (Dao, 2022) is the IO-aware attention *kernel* underneath. It reduces the memory
  traffic of the attention computation itself — distinct from batching and from KV *storage*, but
  usually discussed alongside them as part of the throughput story.

Tools you'd reference: **vLLM, TGI, TensorRT-LLM, SGLang, LMDeploy**. Current SOTA combines
**continuous batching + paged attention**, with **SLO-aware / goodput scheduling** layered on top — the
system optimizes for requests served *within* their latency targets, not raw tokens/sec. Open problems
experts still argue about: **SLO-fair scheduling**, **multi-tenant throughput isolation**, and
**interference** between requests sharing a batch.

## Interviewing on batching and throughput

What a strong interviewer probes here:

- Can you say **what continuous batching solves over static batching** — that static batching pads the
  batch to the slowest sequence and wastes GPU cycles under variable output lengths, while
  iteration-level scheduling admits and evicts sequences per decode step?
- Do you understand **its latency cost** — that packing more sequences into a batch raises throughput
  but can add per-request latency (queueing and interference), so throughput and latency trade off?
- Can you connect batching to **paged attention** (why non-contiguous KV blocks let you fit more
  concurrent sequences) and to **goodput / SLO-aware scheduling** (serving requests within their
  targets, not just maximizing tokens/sec)?

**Red flags** that sink candidates: defending **static batching under variable output lengths**,
optimizing throughput while being **batch-blind about SLOs** (reporting only aggregate tokens/sec and
ignoring per-request latency targets), or claiming continuous batching finishes the whole batch
together. Asked to design a high-throughput serving path, lead with **continuous batching**
(iteration-level scheduling) **+ paged attention**, then add **SLO-aware / goodput scheduling** — and
name **Orca** and **vLLM/PagedAttention** as the prior art. Showing you know the canon *and* can reason
about the throughput-vs-latency tradeoff is what reads as senior.
