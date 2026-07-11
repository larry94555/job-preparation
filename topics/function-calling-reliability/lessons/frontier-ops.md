# Function-calling reliability — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
function calling from someone who *runs* it at the frontier: the current research edge, and the
operational signals you watch when tool calling is live.

## The function-calling-reliability frontier

Tool calling started as a learnable capability — **Toolformer** (Schick et al., 2023) framed a model
deciding *when and how* to call an API — and **Gorilla** (Patil et al., Berkeley, 2023) pushed it
across a large, shifting universe of APIs, surfacing the failure mode everything downstream fights:
hallucinated or malformed calls. Three research directions are where the work is actually moving now.

- **Making tool calling measurable.** The **Berkeley Function-Calling Leaderboard** is the frontier's
  scoreboard: it evaluates *argument correctness and call structure* — not vibes — across models, and
  increasingly across harder call shapes. The load-bearing idea to carry: reliability is an *evaluated*
  property. An expert regression-tests their dispatcher the way the leaderboard scores a model, rather
  than trusting that "it usually calls the right tool." Parallel and streaming tool calls are the newer
  call shapes this eval frontier is stretching to cover.

- **Standardizing the tool boundary.** **MCP** (Model Context Protocol, Anthropic, 2024) is the open
  standard for *where the contract lives*. Its significance for reliability is structural: it moves tool
  discovery, scoping, and validation to a single shared seam, so a tool is implemented — and validated,
  and observed — once instead of re-wired per vendor. The mental model to carry: the tool boundary is
  becoming a standardized, validated API, which reshapes how tools are discovered and scoped at scale
  rather than being merely a convenience.

- **The open problems.** Three are explicitly unsolved. **Reliable multi-tool orchestration** — chaining
  many tools while keeping the whole sequence correct; orchestration failures are silent and compound.
  **Robust argument grounding** — keeping each argument tied to *real* state rather than a plausible
  hallucination, which is why validate-and-reject exists and why typed contracts are necessary but not
  sufficient. And **exactly-once at scale** — the hard distributed-systems edge of idempotency: making a
  mutating call happen once under retries, hedging, and partial failure, by pushing idempotency keys
  end-to-end.

The reason to track this line: the frontier attacks the same trust gap — *the model is an untrusted
caller* — from three angles. Measure whether calls are correct (leaderboards), standardize where the
contract is checked (MCP), and make the hard cases — orchestration, grounding, exactly-once — actually
hold. An expert can say which of the three a given system should invest in first.

## Operating function calling in production

When it's live, you don't watch "function calling" — you watch a handful of signals that tell you
whether the dispatcher is healthy and where the next reliability wall is.

- **Tool-argument validation-failure rate.** The share of proposed calls the dispatcher rejects for
  failing schema validation. A rising rate means the model is drifting from the contracts — a changed
  tool schema, a prompt regression, or a weaker model. This is the leading indicator that *argument
  grounding* is slipping, and it shows up before wrong side effects do because you fail closed.
- **Unknown-tool rate.** How often the model proposes a tool that doesn't exist in the registry. A
  spike means hallucinated tool names — often from a bloated or ambiguous tool menu — and it's the
  signal to trim descriptions or scope/retrieve the tool set per request rather than sending all of it.
- **Retry / duplicate-execution rate.** How often a mutating call is issued more than once, and how
  often idempotency actually collapsed those retries into a single effect. Duplicate *executions*
  (not just retries) is the metric that catches a broken or missing idempotency key — the double-charge
  before it becomes an incident.
- **Tool latency & error rate.** Per-tool p50/p95 latency and downstream error rate. A tool is an
  external API; its slowness or failures propagate into the agent loop as timeouts and retries, so you
  monitor each tool as a dependency with its own SLO, not as a black box.

The operational discipline: alert on **validation-failure rate and duplicate-execution rate** (leading
indicators of grounding drift and broken idempotency), watch **unknown-tool rate** to catch a bloated
or hallucinated tool surface, and treat each tool's **latency and error rate** as a dependency SLO —
never reason about a function-calling layer as if a well-formed call were a *correct*, *safe*, or
*executed-once* one.
