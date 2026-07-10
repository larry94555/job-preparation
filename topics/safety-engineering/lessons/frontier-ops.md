# Safety engineering — the frontier and operating it in production

The deep-dive gave you the levers. This lesson drills the two things that separate someone who *knows*
LLM safety from someone who *runs* it at the frontier: the current research edge, and the operational
signals you watch when it's live.

## The safety-engineering frontier

The honest state of the field is that safety here is an **open problem**, not a solved one. An expert
tracks four moving fronts.

- **No robust general injection defense.** This is the standing open problem, and it is load-bearing:
  there is **no known defense that reliably stops prompt injection in the general case**. A determined
  attacker rephrases, encodes, or splits the payload past any fixed classifier, so "we added an
  injection filter" is never a finished answer. The frontier is not a better detector — treat any
  "solved" claim with deep skepticism. The honest direction is **containment**: provenance and least
  privilege so a *successful* injection still can't do damage. Simon Willison named the class (2022)
  precisely because naming it is what made it defensible at all; the defense itself is still unfinished.
- **Indirect and agent injection.** The dangerous class isn't the payload the user types — it's the one
  **Greshake et al. (2023)** characterized: instructions that ride in on retrieved pages, documents,
  emails, or tool return values the agent reads *later*. Input-side filtering can't see these coming
  because the attacker never touches the prompt. As agents gain tools, every external source becomes
  attack surface, which is why indirect injection is the load-bearing agentic threat and why the frontier
  is agentic, not chatbot-shaped.
- **Provenance at scale.** Tracking which spans are trusted vs. untrusted is easy in a toy and unsolved
  in production. The hard part is keeping the trust tag alive as content flows through retrieval,
  summarization, and multi-hop tool calls — a summary of an untrusted document is still untrusted, but
  most pipelines quietly launder that provenance away. Watch for trust-boundary tagging that **survives**
  those transformations, because without it no downstream control can enforce a boundary.
- **Agent egress control.** As agents gain data-out tools (HTTP, email, external writes, webhooks), the
  frontier moves to bounding **what can leave**. The direction is **allow-listed egress and confirmation
  gates treated as first-class architecture**, not add-ons bolted on after a demo. This is the last line
  that stops exfiltration even after injection succeeds.

Tying it together is the **OWASP LLM Top 10**, the field's risk checklist — and its *evolution* is itself
a frontier signal. It keeps prompt injection entrenched at the top across releases and has grown
agent-era categories (excessive agency, system-prompt leakage, unbounded consumption). The checklist is
the denominator when you audit a system's surface, and watching what it adds tells you where the field's
consensus is moving.

The reason to track this line: every serious direction accepts that **detection loses** and shifts weight
to provenance, least privilege, and containment. An expert can say which of those a given system is
missing.

## Operating safety in production

When it's live, you don't watch "is it safe" — you watch a handful of signals that tell you whether the
defense is holding and where it's leaking.

- **Injection-attempt detection rate.** How often your input/output filters flag a suspected injection.
  Useful as a *trend and triage* signal — a spike means you're under active probing — but never as proof
  of safety: because no classifier catches every rephrasing, a low rate can mean "quiet" or "being
  evaded." Read it alongside egress, never alone.
- **Blocked-egress rate.** How often a data-out step is stopped by the allow-list or a failed
  confirmation. This is the signal that your **last line** is doing work. A rising blocked-egress rate on
  a previously quiet endpoint is a strong leading indicator of an exfiltration attempt in progress —
  something got far enough to try to send data out.
- **Tool-permission-denial rate.** How often a least-privilege check refuses a tool call the model
  wanted to make. Denials are healthy — they're blast radius being enforced — but a sudden climb means
  either an attack is driving the agent toward capabilities it shouldn't have, or your scopes are too
  tight for legitimate work. The shape of the trend tells you which.
- **Incident and false-positive rate.** The two error signals in tension: confirmed safety incidents
  (an injection that actually caused a bad action or a leak) and false positives (legitimate users or
  sends blocked). You tune the whole stack against both — driving incidents toward zero while keeping
  false positives low enough that people don't route around the controls.

The operational discipline: alert on **blocked-egress and tool-permission-denial rate** as the
leading indicators of an attack in flight, watch **injection-attempt detection** only as a trend, and
tune the stack against the **incident vs. false-positive** tension — never treating a quiet detector as
evidence the boundary is holding.
