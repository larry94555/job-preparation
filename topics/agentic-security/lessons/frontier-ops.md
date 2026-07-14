# Security & guardrails — the frontier

## The frontier of agent security

Separation, sanitizing, sandboxing, redaction, and output filtering are the solid ground — the controls
you can and should ship today. The frontier is the honest admission that they are *mitigations, not a
cure*: agent security is an **open problem**, and the hardest cases live where untrusted content and tool
authority meet over long horizons.

- **Indirect / second-order injection via tool-fetched content.** The dangerous injections do not come
  from the user typing at your agent. They arrive **indirectly**: an attacker plants a payload in a web
  page, a document, a database row, or another agent's output, and it detonates when *your* agent fetches
  and reads it. Second-order injection chains through tools — content the agent retrieves triggers a tool
  call whose result carries the *next* payload. Sanitizing the direct prompt does nothing for a trap the
  agent walks into three tool calls later.
- **No general solution.** There is no known way to let a capable model both *follow instructions* and
  *never follow instructions hidden in data* — the two are the same capability. Every defense is
  probabilistic and bypassable; the research edge is raising the attacker's cost, not closing the door.
  Larger models do not fix it — a more capable model follows a cleverer injection just as faithfully.
- **Agent security is unsolved at scale.** Across many tools, many turns, many concurrent agents, and
  content flowing between them, the attack surface compounds: excessive agency, cross-tenant leakage, and
  injections that only fire deep in a tool chain. The honest read is that this is an active frontier, not
  a checklist you can complete.

The reason to track this frontier: it is the same trust gap the whole topic is built on — *content the
agent reads is untrusted* — but at the scale where a single sanitized prompt is no longer the whole story.
An expert defends in depth, names indirect injection as the open case, and does not claim it is solved.

See also **safety-engineering** and **multi-tenant-isolation**.
