# Tool calling & structured outputs — the frontier

## The frontier of tool use

The tool loop, typed schemas, structured outputs, and recovery are the solid ground. The frontier is
where they stop being sufficient — where agents call *many* tools over long horizons and reliability
becomes the hard, unsolved part.

- **Reliable multi-tool orchestration.** A frontier agent chains many tools per task, and the failure
  rate compounds: each step can go slightly wrong, and by the tenth tool the sequence has drifted.
  Orchestration failures are **silent and compound** — no single call throws, but the end state is
  wrong. Keeping a long tool sequence correct as it grows is an open problem, not a solved one.
- **Robust argument grounding.** A typed schema checks that an argument has the right *shape*; it cannot
  check that the value is grounded in *real* state rather than a plausible hallucination. The model can
  emit a well-typed `order_id` that never existed. Argument grounding — tying each argument to reality,
  not just to the schema — is why typed contracts are **necessary but not sufficient**, and why
  validate-and-reject exists.
- **Reliability at scale.** Running these loops across many tools, many turns, and many concurrent
  agents surfaces the distributed-systems edges: partial failures, retries that double-apply effects,
  and orchestration that has to stay correct under load. The honest read is that larger schemas or a
  faster model do not close these gaps — they are the active research edge.

The reason to track this frontier: it attacks the same trust gap this topic is built on — *the model is
an untrusted caller* — but at the scale where a single validated call is no longer the whole story. An
expert can say which of these an agent system should invest in first, and does not claim they are solved.
