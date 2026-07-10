# Safety engineering — architecture, tradeoffs, and reviewing a design

You already know the core pieces: direct vs. indirect prompt injection, trust boundaries and fencing,
least privilege, egress control, and the confused-deputy problem. This lesson zooms out to the
**design space**: the levers a safety engineer actually pulls, what each one trades away, and how to
judge someone else's LLM-security design the way an interviewer or a staff engineer in a review would.

## The safety-engineering design space

Every safety decision is really a decision about **what an attacker can accomplish once untrusted
content reaches the model** — and the honest starting point is that there is **no robust general
injection defense**. You cannot classify your way out of prompt injection; a determined attacker
rephrases, encodes, or splits the payload past any fixed filter. So the design space is not "how do I
detect the attack" but "how do I limit what the attack can *do*." There are five independent levers,
and real systems combine them into **defense-in-depth**:

- **Provenance / trust tagging** — track where every span came from. Developer instructions are
  trusted; web pages, retrieved documents, tool outputs, and user uploads are untrusted. Content that
  crossed an untrusted boundary must never be silently promoted to authoritative instructions. This
  is the pattern named by the **confused-deputy** problem: the agent holds legitimate authority, and
  the attack tricks it into using that authority.
- **Fencing** — enforce the boundary at the prompt level. Delimit the untrusted span, label it, and
  instruct the model that content inside is *data to analyze, never instructions to obey*. Fencing is
  a real mitigation but never airtight on its own — Simon Willison's original framing (2022) and the
  indirect-injection work of Greshake et al. (2023) both show the prompt channel alone can't be
  trusted.
- **Filtering / detection** — scan input and output for known payloads (Rebuff/LLM-Guard-style). Worth
  doing, but by itself unreliable: no classifier catches every rephrasing. It is one layer, never the
  layer.
- **Least privilege** — scope each tool to the minimum access it needs. A read-only tool can't write;
  a token scoped to one mailbox can't reach billing; a network-less tool can't call an attacker's URL.
  This shrinks the **blast radius** of a compromised turn.
- **Egress control** — gate every data-out step (HTTP, email, external write, webhook) behind an
  **allow-list** and/or **human confirmation**. This is the last line: even a successful injection is
  stopped at the wire if the destination isn't allowed.

The **OWASP LLM Top 10** is the field checklist that ties these together and reminds you the surface
is bigger than injection alone (insecure output handling, excessive agency, sensitive-info disclosure).

## A tradeoff table for safety-engineering

| Strategy | Buys you | Costs you | Reach for it when |
|---|---|---|---|
| Input/output filtering | Cheap, catches known/common payloads | No robust classifier — evadable by rephrase/encode/split; false positives block real users | Always, but only as one layer — never the sole defense |
| Fencing + provenance tagging | Keeps untrusted content in the data lane; explicit trust model | Not airtight; needs discipline to tag every source and thread provenance through | Any system that reads web/tool/retrieved content into context |
| Least-privilege scoped tools | Small blast radius; a hijacked turn has little to work with | Design/ops overhead of narrow tokens and capabilities; more moving parts | Agents that hold real authority (mailbox, API, spend) |
| Egress allow-list / human confirm | Stops exfiltration even after injection succeeds | Latency/friction on legitimate sends; allow-list maintenance | Any agent that can send data outside the trust boundary |
| Defense-in-depth (all layers) | No single bypass compromises the system | Most complexity; must reason about layer interactions | Production agents with untrusted input and real capability |

The table is the interview answer in miniature: **name the layer, name what it costs, name the regime
where it matters.** A candidate who says "just add an injection filter" without naming the evasion
problem and the need for least privilege and egress control is signalling shallow depth.

## Common, SOTA, and antipattern

A useful way to hold any safety design is the **common → SOTA → antipattern** ladder.

- **Common (works, ships everywhere):** fence untrusted content, run an input/output filter, and scope
  tools to roughly what they need. This is a reasonable baseline and stops casual attacks — but it
  still leans on the prompt channel and on detection.
- **SOTA (frontier, worth reaching for under real risk):** treat **provenance and policy** — not the
  model's say-so — as the authority for privileged actions. Untrusted spans are tagged end-to-end;
  every tool is least-privilege with narrowly scoped credentials; every egress step is allow-listed or
  human-confirmed; filtering is present but explicitly *not* trusted as the boundary. The frontier is
  designing so that a *successful* injection still cannot exfiltrate or take a high-risk action —
  defense-in-depth where each layer assumes the others may fail.
- **Antipattern (looks fine, fails in production):** trusting retrieved or tool content by pasting it
  straight into the instruction channel; relying on a **single filter** as the whole defense;
  over-privileged agents running with broad credentials; and unconstrained egress so any tool call can
  reach any URL. Each passes a demo and becomes a confused-deputy exfiltration path under real traffic.

## Scaling, performance, and the token budget

Safety layers are not free, and a design review should account for their cost:

- **Filtering adds a call and latency.** A separate classifier or LLM-based detector on every input
  and output doubles round-trips on the hot path. Because it can't be trusted as the boundary anyway,
  spend the latency budget where it buys containment (egress gating) rather than over-investing in
  detection that attackers evade.
- **Fencing spends tokens.** Delimiters, provenance labels, and "treat this as data" instructions
  consume context on every request that reads untrusted content — a real tax on long retrieved
  documents. It is worth it, but it competes with the rest of the token budget.
- **Least privilege scales the *authority* surface, not tokens.** Its cost is operational: more scoped
  tokens, more tool definitions, more policy to maintain. The payoff is that blast radius stays
  constant as you add tools — each new capability is bounded rather than compounding.
- **Egress control scales with sensitive actions.** Every data-out path needs an allow-list entry or a
  confirmation step. Human confirmation trades throughput for safety, so reserve it for the genuinely
  high-risk, boundary-crossing actions rather than gating every call.

The through-line: you cannot buy safety with a bigger model or more tokens. The concurrency and cost
levers from serving topics don't move the injection risk — only architecture does.

## Reviewing a safety-engineering design

When you are handed a safety design to critique — in a review or an interview — walk the same checklist:

1. **Is untrusted content ever pasted into the instruction channel?** Retrieved/tool content promoted
   to instructions is an immediate flag — the direct line for indirect injection.
2. **Is provenance tracked?** If nothing distinguishes trusted from untrusted spans, no downstream
   control can enforce a boundary.
3. **Is filtering treated as the whole defense?** A single classifier as the boundary is the classic
   antipattern; it must be one layer among several.
4. **What is each tool's blast radius?** Over-privileged tools and broad credentials mean a hijacked
   turn does real damage. Least privilege should bound every capability.
5. **What happens at egress?** A real design names its allow-list and/or confirmation for every
   data-out step — never "the filter will catch it." This is what stops exfiltration after injection.

Rating a design as **toy / prototype / demo-ready / production-ready** comes down to how many of these
it answers. A toy trusts all content and filters nothing; a prototype fences and filters; a demo adds
least-privilege tools; a production-ready design also tracks provenance end-to-end, gates every egress
behind an allow-list or confirmation, and assumes each layer may fail — so a successful injection still
can't exfiltrate.
