# Agent guardrails & budgets — architecture, tradeoffs, and reviewing a design

You already know the pieces: budgets bound *how much* an agent does, termination conditions decide
*when it stops*, and guardrails bound *what* it is allowed to do. This lesson zooms out to the
**design space**: the levers an agent-platform engineer actually pulls, what each one trades away,
and how to judge someone else's guardrails-and-budgets design the way an interviewer or a staff
engineer in a design review would.

## The agent-guardrails-budgets design space

Every decision here is really a decision about **how much unsupervised autonomy you grant a loop
that chooses its own next action, and what stops it when things go wrong**. There are five
independent levers, and real runners combine them:

- **Budget dimensions** — cap **steps/iterations, per-tool call counts, cumulative tokens, dollar
  cost, and wall-clock time**. These are not redundant: step and token caps do not bound how long a
  single hung tool call takes, so wall-clock is a separate guard; a global step cap does not stop one
  expensive or rate-limited tool from being hammered, so per-tool caps are separate again.
- **Termination conditions** — exit on **success**, on **detected failure / no-progress**, and on
  **any budget exhaustion**. A success-only exit is the classic antipattern: a goal the agent can
  never reach means an open-ended loop.
- **No-progress detection** — the signal that separates "working" from "stuck." Repeated actions or
  revisited states with no change to the environment (oscillation) mean stop, rather than waiting for
  a budget to drain. Detecting "stuck" reliably is an open problem, so this lever is about heuristics,
  not certainty.
- **Action gating** — **allow-list (deny-by-default)** for which tools can run at all, plus
  **human-in-the-loop confirmation** before high-risk or irreversible actions execute. An allow-list
  fails safe; a deny-list fails open on anything nobody thought to forbid.
- **Failure containment** — **circuit breakers** and **escalation paths** that halt the run and hand
  control to a human when an error or risk signal crosses a threshold, plus **graceful termination**
  that returns the best partial result and state instead of crashing.

## A tradeoff table for agent-guardrails-budgets

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Step / iteration cap | Bounds the whole run; dead-simple to reason about | Says nothing about time or cost per step; a cheap loop can still burn tokens | Every agent loop — the non-negotiable floor |
| Wall-clock timeout | Bounds latency even when a single step hangs | Can kill a legitimately slow long-horizon task early | Any tool/network call that can stall or hang |
| Cost / token ceiling | Hard dollar bound; protects the budget line | Needs live token+price accounting; can truncate a nearly-done task | Autonomous runs on paid APIs, untrusted length |
| No-progress detection | Stops oscillation early instead of draining budgets | Heuristic; false positives kill progress, false negatives miss "stuck" | Loops that can revisit states or repeat actions |
| Allow-list (deny-by-default) | Fails safe; unforeseen actions simply can't run | Maintenance burden; blocks useful-but-unlisted actions | Any agent that composes its own tool calls |
| HITL confirmation gate | Prevents irreversible harm before it happens | Adds human latency and cost; caps throughput | Destructive / costly / external-send actions |
| Circuit breaker + escalation | Halts a failing or dangerous run; hands off cleanly | Threshold tuning; a low bar trips on transient errors | Long-horizon or high-blast-radius autonomy |

The table is the interview answer in miniature: **name the lever, name what it costs, name the
regime where it wins.** A candidate who says "just add a max-steps cap" without naming wall-clock,
cost, and no-progress as *separate* guards is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** a bounded loop — max steps plus a wall-clock timeout — that
  exits on success or on any budget exhaustion, with an allow-list of tools and graceful return of
  the partial result. This is the ReAct/Reflexion-style loop with the obvious guards bolted on, and
  it is a perfectly good baseline.
- **SOTA (frontier, worth reaching for under real autonomy):** the full multi-dimensional budget
  (steps, per-tool, tokens, cost, wall-clock) **plus** no-progress / oscillation detection so the run
  stops being stuck before a budget drains, **plus** HITL confirmation gated by each action's blast
  radius, **plus** a circuit breaker with an escalation path, all terminating gracefully with
  inspectable state. The frontier, per Anthropic's "Building Effective Agents" and guardrail
  frameworks like NeMo Guardrails and Guardrails AI, is treating termination and containment as
  first-class, not an afterthought.
- **Antipattern (looks fine, fails in production):** an **open-ended loop** with no cost ceiling; a
  **success-only exit** that never stops on an unreachable goal; a **deny-list** that fails open; a
  high-risk action **logged after** it runs instead of confirmed before; or a runner that **crashes**
  on budget exhaustion and loses all work. Each of these passes a demo and then loops, overspends, or
  does irreversible harm under real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Cost is unbounded by construction.** An agent decides its own next action, so nothing inherently
  stops it — expected spend is `steps × avg_tokens_per_step × price`, and without a cap all three
  factors are open-ended. The cost ceiling is what converts an open-ended loop into a bounded
  liability.
- **The dimensions are not interchangeable.** A run can sit comfortably under its step budget while a
  single hung tool call blows the wall-clock, or hammer one rate-limited search tool while total
  steps look fine. Budgeting on one axis and calling it done is exactly where runaway cost slips
  through — each axis bounds a different failure mode.
- **No-progress detection is cheaper than the budget it saves.** Catching an oscillation at step 3
  avoids paying out the remaining step, token, and dollar budget the loop would otherwise drain.
  Detection is heuristic, so the design question is the false-positive rate, not whether to have it.
- **Guardrails trade autonomy for safety, and the exchange rate is the blast radius.** Read-only
  lookups can run freely; a confirmation gate on every destructive action adds human latency but
  caps the damage of a wrong call to one reversible mistake. Tune the strictness per action, not
  globally.

## Reviewing an agent-guardrails-budgets design

When you are handed a design to critique — in a review or an interview — walk the same checklist:

1. **What are the exit conditions?** If the only exit is "stop when solved," stop there; a success-only
   loop never terminates on an unreachable goal.
2. **Which budget dimensions are capped?** Missing wall-clock (hung steps), missing per-tool (hammered
   tools), or missing a dollar ceiling (runaway cost) are each an immediate flag.
3. **Is there no-progress detection?** No oscillation/repeat-state check means the runner waits for a
   budget to drain instead of catching "stuck" early.
4. **Allow-list or deny-list, and are high-risk actions gated?** A deny-list fails open; a destructive
   action with no HITL confirmation gate is an accident waiting to happen.
5. **What happens at the boundary?** A real design names its circuit breaker / escalation path and
   returns the best partial result and state on exhaustion — never "it just crashes" or "it just
   works."

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy has an open-ended loop; a prototype adds a step cap; a demo bounds cost and
time and uses an allow-list; a production-ready design also detects no-progress, gates high-risk
actions behind HITL, has a circuit breaker with escalation, and terminates gracefully with
inspectable state.
