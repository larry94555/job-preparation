# Reading list & staying current — agentic-human-in-the-loop

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **Human-in-the-loop as runtime oversight.** The core reframing: an agent that can act can act wrongly,
  so you keep a human on the actions that are irreversible or expensive. Notice the shift from a
  chatbot's harmless bad sentence to an agent's real charge or deletion — that difference is the whole
  reason gates exist.
- **Risk classification (reversibility × cost).** The cheapest useful idea: rank each action low / medium
  / high by whether it can be undone and how much it costs. Notice that *irreversible* does the heavy
  lifting — a wrong reversible action is an inconvenience, a wrong irreversible one is permanent.

## Go deeper (gates, audit & resumption)
- **Approval gates.** The seam between the agent's intent and the world's state, with a human standing in
  it for high-risk actions. Notice the defining property: on rejection `execute` is *never called*, so a
  confidently-wrong high-risk call becomes a recoverable pause instead of a permanent mistake.
- **Audit logging for agents.** An append-only, queryable trail of action, params, risk, and decision.
  Notice *append-only* — history you can't rewrite is what makes the trail trustworthy for incident
  review and accountability, the same way request logs work under multi-tenant isolation.
- **LangGraph interrupts (and equivalents).** The framework primitive for pause → human → resume: the run
  halts at a checkpoint, waits for human input, and resumes from that checkpoint. Notice the durability
  requirement — the pause has to survive minutes or days, which is why it needs persisted state, not an
  in-memory `input()`.

## Frontier — what to watch
- **Autonomy levels / the autonomy spectrum.** Autonomy is a dial, not a switch: manual → approve-each →
  approve-high-risk → interruptible → fully autonomous. Notice the engineering question is *which rung
  each action belongs on*, decided per action and per stakes, not a single global setting.
- **Calibration & ask-when-unsure.** Gating by the model's confidence only works if that confidence is
  *calibrated* — a 95%-confident model that is 70% right will skip the gate on exactly the actions it
  should escalate. Notice that calibration must be *measured* before stated confidence is trusted.
- **RLHF vs. runtime oversight.** RLHF put humans in the *training* loop; this topic puts them in the
  *runtime* loop. Notice the shared lineage — both are human oversight of an untrusted model — and the
  distinction: training shapes the policy, runtime gates the individual irreversible action.

## How to stay current on this topic
- Follow agent-framework release notes (interrupts, checkpointing, human-in-the-loop APIs) — the
  pause/resume primitive is where new affordances land first.
- Track work on **model calibration and selective prediction** — that is what makes autonomy-by-confidence
  safe, and it is the load-bearing frontier problem here.
- When a new autonomy or oversight technique appears, ask: *what does it guarantee vs. merely encourage,
  which actions does it leave gated, and what measures its calibration?* — the lens the frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
