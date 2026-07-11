# Reading list & staying current — prefill-vs-decode-latency

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **The two phases and their metrics — TTFT vs. TPOT/ITL.** The load-bearing distinction: prefill is
  parallel/compute-bound and sets *time-to-first-token*; decode is sequential/memory-bandwidth-bound and
  sets *time-per-output-token* (inter-token latency). Notice that a single latency number hides which
  phase you're actually optimizing — every technique below moves one of these two dials.
- **Chunked prefill — Sarathi (Agrawal et al., MSR).** The paper that reframed prefill from a monolithic
  stall into interleavable chunks scheduled alongside decode. Notice *why* it exists: a long prefill
  blocks decode steps for other requests, so slicing it bounds TTFT damage while keeping decode flowing.
  This is the single most important read for making one GPU serve both phases well.

## Go deeper (mechanism & the disaggregation split)
- **Prefill/decode disaggregation — DistServe (2024).** The argument for running prefill and decode on
  *separate* hardware pools so each can hit its own SLO without interfering. Notice the core claim: the
  two phases have opposite resource profiles, so co-locating them forces a bad compromise on both.
- **Splitwise (2024).** The companion result: split the phases across machine types and route the KV
  state between them. Notice how the win comes from matching each phase to hardware it actually needs
  (compute-heavy prefill vs. bandwidth-heavy decode) rather than provisioning one box for both.

## Frontier — what to watch
- **SLO-optimal P/D scheduling.** The open question: given per-request TTFT and TPOT targets, how do you
  schedule prefill chunks and decode steps to hit *both*? Watch for schedulers that treat the two SLOs as
  a joint objective rather than tuning one and hoping the other holds.
- **Cross-phase interference on shared hardware.** When prefill and decode share a GPU, a burst of prefill
  stalls decode (and vice versa). Watch for work that *models* this interference instead of just avoiding
  it via disaggregation — the frontier is predicting the stall, not only paying to sidestep it.

## Tools & implementations worth reading
- **vLLM & TensorRT-LLM.** The serving stacks that implement chunked prefill and P/D routing. Reading how
  vLLM schedules a prefill chunk into an ongoing decode batch is the fastest way to turn Sarathi's idea
  into a mental model of real code.
- **GenAI-Perf.** The benchmarking tool that reports TTFT and TPOT *separately*. Notice that the whole
  point is refusing to collapse the two phases into one number — the measurement mirrors the topic's
  central lesson.

## How to stay current on this topic
- Follow the **vLLM / TensorRT-LLM** repos and release notes — chunked-prefill and P/D-disaggregation
  features land in code first.
- Track **MLSys, OSDI/SOSP, and NeurIPS/ICML systems tracks** for the next P/D scheduling or
  phase-interference result.
- When a new serving technique appears, ask the three canon questions: *which phase does it touch (TTFT
  or TPOT), what regime does it win in, and what benchmark proves it?* — the same lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **Chunked prefill won and became a default knob.** Sarathi's idea shipped: `Sarathi-Serve` landed at OSDI
  '24 and chunked prefill is now a standard scheduling option in vLLM and TensorRT-LLM. The TTFT-vs-decode
  stall it was designed to bound is now something operators tune rather than suffer — the entry aged very
  well.
- **P/D disaggregation moved from research claim to production architecture.** DistServe (arXiv Jan 2024)
  and Splitwise (2024) argued for separate prefill/decode pools; by 2025–2026 nearly every production stack
  — NVIDIA Dynamo, llm-d, SGLang, vLLM, LMCache, MoonCake — supports disaggregated serving. The "opposite
  resource profiles" thesis held.
- **The nuance that aged in: disaggregation isn't free.** Follow-up work (e.g. "Beyond the Buzz" /
  pragmatic-disaggregation retrospectives) tempered the early wins — KV transfer cost, bursty-arrival
  imbalance, and idle decode compute mean disaggregation pays off in specific regimes, not universally. So
  the canon framing (chunked prefill *or* disaggregation, chosen per SLO) aged better than "always
  disaggregate."
- **Separate TTFT/TPOT reporting is now the norm.** GenAI-Perf and peers report the two phases separately by
  default; the topic's central lesson (never collapse the phases into one latency number) is now baked into
  the standard tooling.
- **What to watch next:** the open problems the canon flagged — SLO-optimal joint P/D scheduling and
  modeling cross-phase interference rather than just avoiding it — remain the active frontier (2026 work on
  load-aware prefill deflection and targeted P/D pruning is chipping at exactly this).
