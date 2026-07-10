# Expert context: papers, frontier & interview

## Papers people and the frontier

KV-cache management is a systems topic, and its canon is a short list of serving-systems work you
should be able to name and summarize in an interview:

- **Paged attention / vLLM** (Kwon et al., 2023) introduced storing the KV cache in fixed-size,
  **non-contiguous blocks** tracked by a block table — eliminating the external fragmentation that
  capped concurrency. The field adopted it quickly; "paged KV" is now table stakes in serving stacks.
- **RadixAttention / SGLang** extended the idea with a prefix tree so common prompt prefixes **share**
  KV blocks across requests (prefix reuse).
- **FlashAttention** (Tri Dao, 2022) is the IO-aware attention *kernel* underneath. It cuts the memory
  traffic of attention itself — distinct from KV *storage*, but the two are usually discussed together.

Tools you'd reference: **vLLM, SGLang, TensorRT-LLM, TGI**. Current SOTA is paged blocks + prefix
sharing + optional KV quantization. Open problems experts still argue about: optimal **eviction under
mixed SLOs**, lossless **KV compression**, and safe **cross-request KV reuse**.

## Interviewing on KV-cache management

What a strong interviewer probes here:

- Can you **compute KV memory** from `layers × heads × head_dim × seq_len × batch × dtype` and explain
  why long contexts throttle concurrency? That one calculation separates people who've *served* models
  from people who've only *called* them.
- Do you know **why paging exists** — that contiguous KV allocation fragments memory?
- Can you reason about **eviction: recompute vs. swap-to-host** and their different costs (compute vs.
  bandwidth)?

**Red flags** that sink candidates: proposing **contiguous KV allocation** (fragmentation), ignoring
the KV cache in **capacity planning**, or treating context length as free. Asked to design a serving
memory manager, lead with **paged blocks + a block table**, then **prefix sharing**, then an
**SLO-aware eviction** policy — and name **vLLM/PagedAttention** as the prior art. Showing you know the
canon *and* can do the memory arithmetic is what reads as senior.
