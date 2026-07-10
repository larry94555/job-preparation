# Structured output reliability — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
structured output from someone who *runs* it at the frontier: the current research edge, and the
operational signals you watch when it's live.

## The structured-output-reliability frontier

The load-bearing idea the frontier builds on is **constrained decoding**: instead of checking the
output after the fact, you compile the schema or grammar into a finite-state machine and **mask the
logits at every step so only tokens that keep the output valid can be sampled**. Outlines (Willard &
Louf, 2023) formalized this as finite-state constrained decoding; llama.cpp's **GBNF** grammars expose
the same idea as a concrete knob — a BNF grammar drives the token mask at inference time — and provider
"JSON mode" / schema-constrained outputs are the productized form. The common thread: validity becomes
a property of **decoding**, not a post-hoc check, so *syntax* failures are eliminated by construction.

But the research edge is precisely about what constrained decoding *doesn't* give you, and two open
problems are where the field is actually moving.

- **Semantic (not just syntactic) validity.** This is the central open problem. A grammar guarantees a
  well-formed *shape* — the braces balance, the field is a string, the enum slot is one of the allowed
  literals — but it says nothing about whether the values satisfy **business rules**: a date that is in
  range, an ID that actually exists, two fields that must agree with each other. A grammar can't express
  "this order total equals the sum of its line items." The frontier is pushing validation of *meaning*
  into or alongside the decode loop, rather than leaving it entirely as an after-decode check. The
  mental model to carry: **constrained decoding buys you form, and semantic validity is the part it
  provably cannot buy** — which is why a schema-validation layer (Zod/Pydantic/Ajv) still sits on top,
  and why "we use JSON mode so we skip validation" is the classic shape-vs-meaning error.

- **The quality cost of aggressive constraints.** Heavy grammar masking doesn't just filter tokens; it
  **steers the token distribution** away from what the model would otherwise have sampled. Forcing the
  output onto a rigid grammar can degrade the *content* of the answer even while guaranteeing that it
  parses. The frontier discipline here is **eval-gated adoption**: measure the quality cost of the
  constraint against a task metric, not just the parse rate. The failure mode to name is a team that
  reports "100% valid JSON" and treats that as success while a tighter grammar has quietly lowered
  answer quality — the constraint moved cost, it didn't erase it.

The reason to track this line specifically: both open problems attack the same seam — constrained
decoding is a *syntactic* guarantee — from opposite sides. Semantic validity is *"the shape is right
but the meaning may be wrong,"* and the quality-cost problem is *"forcing the shape may make the meaning
worse."* An expert can say which one bites a given workload first, and never confuses a green parse rate
with a correct answer.

## Operating structured output in production

When it's live, you don't watch "structured output" — you watch a handful of signals that tell you
whether the contract is holding and where to invest next.

- **Schema-validation failure rate.** The headline gauge: the fraction of model outputs that parse but
  fail the schema (missing field, wrong type, enum/constraint violation). This is the tail that is
  invisible in ten demo calls and is a steady stream of broken responses at scale, so you watch it as a
  rate, not an anecdote. Break it down by **failure class** — malformed vs. missing-field vs. enum vs.
  truncation — because that breakdown is what tells you whether to invest in *prevention* (constrained
  decoding) or in *repair*; without the classification you are tuning blind.
- **Repair-attempt rate.** How often a request enters the bounded, error-fed repair loop, and how many
  attempts it takes. Rising repair rate is the leading indicator that an earlier layer — the prompt, the
  schema strictness, or the decoder — is drifting. Because tightening the schema *raises* this rate by
  design, you read it together with strictness, not in isolation.
- **Fallback rate.** How often repair is exhausted and the request degrades down the chain (simpler
  schema → deterministic default → human review). This is your "the automated path failed" signal. A
  large share of traffic reaching the **human** step means the queue is a symptom — strengthen an
  earlier layer rather than widening the human queue.
- **Latency overhead of constrained decoding.** Constrained decoding removes syntax-failure repairs but
  adds per-token decoder overhead. You watch this cost against the repair calls it saves: the win is
  real only if the saved repairs (and their latency and tokens) outweigh the added decode overhead *and*
  any measured quality cost.

The operational discipline: alert on **repair-attempt rate and fallback rate** (leading indicators that
the contract is slipping), and capacity-plan on the **schema-validation failure rate broken down by
class** — never reason about reliability from "the model usually returns valid JSON," because the real
currency is the tail failure rate, and the whole job is engineering that tail.
