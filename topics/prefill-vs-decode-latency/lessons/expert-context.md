# Expert context: papers, frontier & interview

## Papers people and the frontier

Prefill vs. decode is a serving-systems topic, and its canon is a short list of scheduling work you
should be able to name and summarize in an interview:

- **Chunked prefill / Sarathi** (Agrawal et al., MSR) splits a long prompt's prefill into smaller
  chunks and **interleaves** them with ongoing decode. Instead of one big prefill monopolizing the GPU
  and stalling every in-flight decode, the prefill is fed in piecewise, which smooths **TTFT** and
  keeps **TPOT** low under load.
- **Prefill/decode disaggregation** separates the two phases onto **different resources** so each can
  be scheduled and scaled for its own SLO. **DistServe** and **Splitwise** (2024) are the systems that
  made this concrete — prefill is compute-bound and decode is memory-bandwidth-bound, so co-locating
  them forces one shared scheduler to serve two workloads that optimize differently. Splitting them
  lets you hit **separate TTFT and TPOT targets** without the phases interfering.

Tools you'd reference: **vLLM** and **TensorRT-LLM** for serving, and **GenAI-Perf** for benchmarking
the two SLOs. Current SOTA is **chunked prefill and P/D disaggregation** used to hit separate TTFT/TPOT
targets. Open problems experts still argue about: **SLO-optimal P/D scheduling**, and **interference
between the two phases** when they share resources.

## Interviewing on prefill vs decode latency

What a strong interviewer probes here:

- Can you **say which phase a change affects**? Longer prompts hit prefill (and TTFT); longer outputs
  hit decode (and TPOT). Naming the phase before proposing a fix is the tell of someone who has served
  models, not just called them.
- Do you understand **why the two phases optimize differently** — prefill compute-bound, decode
  memory-bandwidth-bound — and therefore why one latency number is not enough?
- Can you reach for the right lever: **chunked prefill (Sarathi)** to stop a big prefill from stalling
  decode, or **P/D disaggregation (DistServe/Splitwise)** to scale each phase to its own SLO?

**Red flags** that sink candidates: reporting **a single latency number** (hiding the TTFT/TPOT split),
or **optimizing decode to fix a prefill-bound workload** (and vice versa). Asked to design a serving
path, lead with **separate TTFT/TPOT SLOs**, then name **chunked prefill** and **prefill/decode
disaggregation** as the levers — and cite **Sarathi**, **DistServe**, and **Splitwise** as the prior
art. Showing you know the canon *and* can attribute a latency symptom to the right phase is what reads
as senior.
