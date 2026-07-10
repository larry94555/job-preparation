# Reading list & staying current — agent-guardrails-budgets

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **ReAct — Yao et al. (2022).** The reason-then-act agent loop that every budget must bound. Notice that
  the loop interleaves thought, action, and observation with *no intrinsic stopping point* — the whole
  case for budgets and termination conditions falls out of this structure.
- **Anthropic "Building Effective Agents" (2024).** The practitioner guidance for bounded, verified
  autonomy. Notice its bias toward the *simplest* structure that works and its insistence on verification
  and stop conditions — this is the source of the "budgets even for a correct agent" instinct.

## Go deeper (mechanism & control structure)
- **Reflexion — Shinn et al. (2023).** Self-reflection/retry layered on top of an agent loop. Notice that
  reflection *adds* iterations: the retry loop is exactly the thing a no-progress/oscillation guard has to
  detect, or it spins forever.
- **Budgets as multi-axis limits (steps / tools / tokens / cost / time) — canon SOTA.** Notice that each
  axis bounds a *distinct* failure mode; a token cap does not save you from a wall-clock hang, and a step
  cap does not bound cost. The lesson is that budgets are not interchangeable.
- **No-progress / stuck detection — canon SOTA.** The hard part of bounding a loop is deciding it has
  stopped making progress *before* the budget is spent. Notice this is the open problem, not a solved knob:
  oscillation and silent no-op repetition are what you are trying to catch.

## Frontier — what to watch
- **Reliably detecting "stuck" — canon open problem.** The frontier question is principled no-progress
  detection rather than heuristic step-diffing. Watch for methods that generalize across task types.
- **Safe long-horizon autonomy — canon open problem.** As agents run longer, the budget-and-guardrail
  problem shifts from "cap the loop" to "stay safe across many steps." Watch HITL-escalation and
  containment patterns, not just larger budgets.
- **Principled budgets — canon open problem.** Moving from hand-tuned ceilings toward budgets with some
  backing argument (formal termination bounds). Watch for anything that replaces "we picked 20 steps" with
  a defensible bound.

## Tools & implementations worth reading
- **NeMo Guardrails (NVIDIA).** A named enforcement framework for programmable rails around an LLM/agent.
  Reading its rail definitions turns "allow-list / deny-by-default" from a slogan into concrete policy.
- **Guardrails AI.** Validators and structured guards on inputs/outputs. Notice how it frames guardrails as
  a validation-and-repair layer — the same detect→gate→contain pattern as budgets, on the content axis.
- **Agent-SDK budget features (Claude Agent SDK, OpenAI Agents SDK).** The step/tool/token/cost ceilings
  and termination hooks shipped in real runners. Reading how an SDK exposes budgets is the fastest way to
  turn the canon dimensions into a mental model of production code.

## How to stay current on this topic
- Follow the **NeMo Guardrails** and **Guardrails AI** repos and release notes — new rail/validator patterns
  land in code first.
- Track **agent-SDK** changelogs (Claude Agent SDK, OpenAI Agents SDK) for how budgets, termination hooks,
  and HITL escalation evolve in shipped runners.
- When a new guardrail or budget technique appears, ask the three canon questions: *which failure mode does
  it bound, what regime does it win in, and how would you know it fired?* — the same lens the deep-dive
  lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
