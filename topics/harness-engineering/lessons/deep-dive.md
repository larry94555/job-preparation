# Harness engineering — architecture, tradeoffs, and reviewing a design

You already know the model/harness boundary, the think→act→observe loop, and that verification and
budgets are harness work. This lesson zooms out to the **design space**: the levers a systems
engineer actually pulls when building an agent harness, what each one trades away, and how to judge
someone else's harness design the way an interviewer or a staff engineer in a design review would.

## The harness-engineering design space

Every harness decision is really a decision about **how much autonomy you grant the model versus how
much reliability the surrounding code guarantees** — and at what latency and cost. There are five
largely independent levers, and real harnesses combine them:

- **Boundary placement** — how much you push into the harness versus the prompt. The core insight is
  that reliability lives in the harness, not the prompt: tools, argument validation, retries, and
  verification are structural and cannot be reworded into existence. Pushing a structural failure
  (invalid tool JSON, a non-idempotent write) back onto the prompt is the classic misplacement.
- **Loop control** — the think→act→observe loop plus its guards: duplicate-call detection,
  step/tool/token/time budgets, no-progress detection, and explicit termination conditions. This is
  the lever that separates an agent from "an infinite loop with an API key."
- **Verification** — deterministic post-action checks (run the tests, read the `git diff`, run the
  code, type-check) versus trusting the model's claim that it worked. The strength of the check is a
  dial: no check, a self-review prompt, or a real deterministic gate.
- **Tool contract & permissions** — typed tool contracts with argument validation, read/write
  separation, confirmation gates for destructive actions, and idempotent mutations so a retry is
  safe. This is where a harness is exploited or trusted.
- **Orchestration shape** — a single bounded ReAct-style loop, plan-then-execute (planning separated
  from doing so each step is independently checkable and re-plannable), or multiple agents. More
  agents add coordination-failure surface and are only warranted by genuine decomposition or
  isolation needs.

## A tradeoff table for harness-engineering

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Prompt-only (no harness reliability) | Fastest to ship, zero infra | Tail/structural failures never fixed; flaky at scale | Throwaway demos, single-shot calls |
| Single bounded ReAct loop | Simple, verifiable, budgeted autonomy | One reasoning thread; no parallelism | Most real agent features |
| Plan-then-execute | Each step checkable and re-plannable independently | Extra planning latency and orchestration code | Multi-step tasks where steps can fail and recover |
| Deterministic verification gate | Turns model claims into checked facts | Test/run latency per action; must build the checks | Any mutating action that ships to users |
| Idempotent tools + retries | Safe to repeat; survives transient failures | Idempotency-key bookkeeping, dedup state | Non-trivial mutations, exactly-once-ish semantics |
| Multi-agent orchestration | Parallelism, isolation of untrusted sub-tasks | Coordination failures, cost, debugging surface | Genuine decomposition or isolation is required |

The table is the interview answer in miniature: **name the lever, name what it costs, name the regime
where it wins.** A candidate who says "just improve the prompt" to fix flaky tool calls, without
naming validation, retries, and verification as harness work, is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** a single ReAct-style think→act→observe loop (Yao et al.,
  2022) with a tool registry, argument validation, a step/token budget, and tests-as-verification
  after edits. This is what a hardened default agent loop gives you and it is a perfectly good
  baseline.
- **SOTA (frontier, worth reaching for under real pressure):** structured agent loops with
  verification **and** budgets, plus self-reflection/retry so a failed attempt is critiqued and
  revised (Reflexion, Shinn et al., 2023), plus idempotent tools with typed contracts, plus
  plan-then-execute for long-horizon tasks — the pattern behind SWE-bench-style agentic coding
  harnesses. Anthropic's "Building Effective Agents" (2024) is the touchstone here: spend complexity
  only where it earns its keep. The frontier is reliable long-horizon autonomy and robust error
  recovery.
- **Antipattern (looks fine, fails in production):** reaching for "just improve the prompt" to fix a
  structural failure; trusting model output with no verification; and designing an **unbounded loop**
  with no step, tool, token, or cost ceiling (AutoGPT is the cautionary case). Each passes a demo and
  then spins forever, runs away the bill, or ships a silently broken change under real traffic.

## Scaling, performance, and the token budget

The specifics that make this concrete:

- **Cost and latency scale with loop length.** Each think→act→observe turn is at least one model call
  plus a tool round-trip, and the context grows every turn as observations accumulate. A task that
  takes 3 turns and one that takes 30 differ by ~10× in tokens and wall-clock — so a token/step
  budget is a hard cap on both bill and latency, not a nicety.
- **The context is the running budget.** Every observation you feed back consumes window and money on
  the next call; long tool outputs (full file dumps, verbose logs) can dominate the budget. Trimming
  or summarizing observations is a real performance lever, and an unbounded loop's context growth is
  what turns a stuck agent into a runaway bill.
- **Verification adds latency but bounds risk.** Running the test suite after each edit costs seconds
  to minutes per action, but it is what converts a plausible-looking claim into a checked fact.
  Skipping it is faster and is exactly how flaky agents ship broken changes.
- **More agents is often negative scaling.** A swarm multiplies model calls and adds coordination
  round-trips; unless the task genuinely decomposes into independent parallel parts, a single bounded
  loop with good tools is both cheaper and more reliable.

## Reviewing a harness-engineering design

When you are handed a harness design to critique — in a review or an interview — walk the same
checklist:

1. **Is the model/harness boundary explicit?** If tools, validation, retries, and verification are
   assumed to come from "a better prompt," stop there; the design will plateau on structural
   failures.
2. **What bounds the loop?** No step/tool/token/time budget or explicit termination condition is an
   immediate flag — that is an unbounded loop with an API key.
3. **How is output verified?** A real design names a deterministic check (tests / diff / run) after
   mutating actions, not "the model reviews its own work."
4. **Are tools typed, validated, and idempotent?** Executing unvalidated arguments or non-idempotent
   mutations means a retry corrupts state and a hallucinated tool name crashes the run.
5. **What happens on failure, and is the orchestration justified?** A production design turns failures
   into next actions (retry, re-plan, escalate) rather than crashing — and reaches for multiple
   agents only when the task truly needs decomposition or isolation.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of
these it answers. A toy is prompt-only with no harness; a prototype has a tool loop; a demo verifies
and budgets it; a production-ready design also has typed idempotent tools, an explicit failure/
recovery policy, and orchestration whose complexity is justified rather than reflexive.
