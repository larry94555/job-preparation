# Structured output — architecture, tradeoffs, and reviewing a design

You already know the failure classes, parse-then-validate, bounded repair, and fallback chains. This
lesson zooms out to the **design space**: the levers an engineer actually pulls when they have to make
a probabilistic generator satisfy a rigid contract, what each one trades away, and how to judge
someone else's structured-output design the way an interviewer or a staff engineer in a design review
would.

## The structured-output-reliability design space

Every structured-output decision is really a decision about **where on the prevent → validate → repair
→ fall back pipeline you spend effort, and how much syntactic and semantic correctness you buy per
dollar of latency and tokens**. There are five independent levers, and real systems combine them:

- **Prevention** — **constrained / grammar-based decoding** (Outlines-style FSM masking, provider
  "JSON mode", llama.cpp GBNF). The decoder is restricted to tokens that keep the output valid against
  a grammar. This largely eliminates *syntax* failures by construction — but it constrains **form, not
  meaning**, and aggressive constraints carry a **quality cost** by steering the model away from better
  completions.
- **The contract** — the **schema as the single authority** (Zod, Pydantic, Ajv). The schema both
  validates at runtime and yields a static type. The key lever here is **strictness**: more required
  fields and tighter types catch more, but also *fail* more, raising the repair rate.
- **Recovery** — the **bounded, error-fed repair loop**. You send the model its own invalid output
  *plus the concrete validation error* and ask it to fix it. The lever is the **bound**: `N` attempts,
  a token budget, a wall-clock cap.
- **Graceful degradation** — the **fallback chain**: simpler schema → deterministic default → human
  review. The lever is *how far down* you're willing to degrade and still call the response "valid."
- **Observability** — **logging and classifying failures** by class (malformed, missing field, wrong
  type, enum violation, truncation). Without this you cannot tell whether to invest in prevention or in
  repair — you're tuning blind.

## A tradeoff table for structured-output-reliability

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Prompt-only "please return JSON" | Zero infra, works in a demo | Nonzero tail failure rate that becomes a steady stream at scale; no guarantee | Prototypes, one-off scripts, low-stakes calls |
| Constrained / grammar decoding | Syntax + shape correct **by construction**; kills malformed output | Form only, not meaning; quality drift under aggressive constraints; provider/runtime support needed | Well-formed JSON is non-negotiable and you control the decoder |
| Schema-as-contract (parse-then-validate) | Catches semantic failures (missing/type/enum) loudly and precisely; free static type | Stricter schema → higher validation-failure and repair rate | Always — this is the load-bearing layer |
| Bounded, error-fed repair | Recovers most validation failures cheaply, in-place | Extra model calls (latency + tokens); unbounded = a `while(true)` bug | Failures are common but usually fixable with the error fed back |
| Fallback chain (simpler schema → default → human) | Caller always gets *something valid*; never crashes, never silently wrong | Degraded answers; human step is slow and expensive | Any production path where a hard failure is unacceptable |

The table is the interview answer in miniature: **name the layer, name what it costs, name the regime
where it wins.** A candidate who says "just turn on JSON mode" without naming that it constrains form
and not meaning — and that you still validate afterward — is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any subsystem is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** provider JSON mode (or an Instructor/Zod wrapper) plus a
  single parse-then-validate against a Zod/Pydantic schema, with one retry on failure. This is a
  perfectly good baseline for most extraction and tool-call use cases.
- **SOTA (frontier, worth reaching for under real pressure):** the full stack — **constrained decoding
  for syntax**, **schema validation as the contract**, a **bounded repair loop that feeds the concrete
  validation error back**, and an **explicit fallback chain** ending in a deterministic default or
  human review — with **every failure logged and classified** so you can see whether truncation,
  enum violations, or malformed output dominates and invest accordingly. The frontier is treating the
  schema as the contract that *every* other layer serves, and closing the **semantic-validity** gap
  with business-rule checks the grammar can't express.
- **Antipattern (looks fine, fails in production):** **regex-scraping** fields out of the raw text;
  **`eval`-ing** the model string; leaning on **"the model usually returns valid JSON"** as if a
  nonzero tail rate disappears at scale; an **unbounded repair loop** with no cap on attempts, latency,
  or cost; and assuming **constrained decoding means you can skip validation** — it guarantees shape,
  not that the enum value or the number is legal. Each of these passes a demo and degrades or hangs
  under real traffic.

## Scaling, performance, and the token budget

The numbers that make this concrete:

- **Tail failure rate is the whole game.** A 1% malformed rate is invisible in ten demo calls and is
  ~1,000 broken responses per 100k requests. Reliability engineering here is entirely about that tail,
  which is why prevention (constrained decoding) plus a contract plus recovery beats any single layer.
- **Repair cost is bounded model calls.** A loop capped at `N` makes at most `N` extra calls before
  falling back — a predictable, budgetable latency and token cost. Unbounded repair makes the p99
  latency and the bill unbounded, which is the same code with a bug.
- **Strictness trades correctness for repair volume.** Every extra required field with a tight type
  catches more bad outputs *and* raises how often you enter the repair loop. Make fields required
  because they matter, then budget the repairs that strictness creates — don't tighten by reflex.
- **Constrained decoding moves cost, it doesn't erase it.** It removes syntax-failure repairs but adds
  decoder overhead and can lower answer quality; the saved repair calls have to outweigh the quality
  cost, which you only know if you're measuring failure classes and quality together.
- **Fallback ordering is a cost gradient.** Cheapest and most automated first (repair), most expensive
  last (human). If a large share of traffic reaches the human step, that's a signal to strengthen an
  earlier layer, not to widen the human queue.

## Reviewing a structured-output-reliability design

When you are handed a structured-output design to critique — in a review or an interview — walk the
same checklist:

1. **How is the model output consumed?** Regex-scraping or `eval` is an immediate flag; the only
   acceptable answer is parse-then-validate against an explicit schema.
2. **Is there a contract, and is the schema the authority?** No schema — or a schema that repair is
   allowed to second-guess — means there is no real contract.
3. **Is prevention used, and do they still validate on top of it?** Constrained decoding / JSON mode
   is good, but "we use JSON mode so we don't validate" is the classic shape-vs-meaning error.
4. **Is repair bounded and error-fed?** No cap on attempts/latency/cost is a `while(true)`; a retry
   that doesn't feed the concrete validation error back is a blind retry.
5. **What happens when repair is exhausted?** A real design names its fallback chain (simpler schema →
   deterministic default → human) so the caller always gets something valid — never a crash, never a
   silently-wrong result. And it **logs and classifies failures** so the team can see where to invest.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy prompts for JSON and hopes; a prototype parses-then-validates; a demo adds
constrained decoding and a retry; a production-ready design also bounds and error-feeds repair, has an
explicit fallback chain, and logs failure classes so the pipeline can be tuned against real traffic.
