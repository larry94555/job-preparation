# Expert context: papers, people & the frontier

## Papers people and the frontier

Safety engineering for LLM systems has a small, nameable canon you should be able to recall and
attribute in an interview:

- **"Prompt injection"** as a named class of attack was **coined by Simon Willison** (2022, blog),
  who described how untrusted input can smuggle in instructions the model then follows as if they
  were the developer's own.
- **Indirect prompt injection** — the payload planted not in the user's own input but in content the
  system reads *later* (a retrieved web page, a document, an email, a tool's return value) — was
  characterized by **Greshake et al.** (2023). This is the dangerous class in agents, because the
  attack surface becomes every external source the agent touches.
- The community's shared risk checklist is the **OWASP LLM Top 10**, the field's reference list of
  the most important LLM application risks (prompt injection sits at the top).
- The underlying pattern is old and well understood: the **confused-deputy** problem. The agent
  holds legitimate authority; injected instructions try to make it *misuse that authority* on the
  attacker's behalf. Framing injection as a confused-deputy problem is what tells an interviewer you
  understand *why* filtering alone can't fix it — the issue is authorization, not detection.

Tools you'd reference: **guardrails frameworks, injection detectors (Rebuff, LLM-Guard), and policy
engines**. Current SOTA is **defense-in-depth**: provenance / trust boundaries + least privilege +
egress control, with the explicit understanding that there is **no single fix**. The open problems
experts still argue about: there is **no robust general injection defense**, provenance is hard to
maintain **at scale**, and **agent egress control** remains unsolved.

## Interviewing on safety engineering

What a strong interviewer probes here:

- Can you distinguish **direct from indirect** injection, and explain why indirect is the harder
  problem in agentic systems?
- Do you frame the risk as a **confused-deputy** problem — the agent misusing legitimate authority
  — rather than just "bad text getting in"?
- Do you know **why filtering alone fails** — that no robust general injection classifier exists, so
  detection must be one layer among several rather than the whole defense?

**Red flags** that sink candidates: **trusting retrieved or tool content** as if it were trusted
instructions, proposing a **single-filter defense** as sufficient, or designing **over-privileged
agents** whose blast radius is unbounded once an injection lands. Asked to secure an agent, lead with
**provenance / trust boundaries** (fence untrusted content as data), then **least privilege** on
tools, then **egress control** on any data-out step — and name the risk explicitly as the
**confused-deputy** problem. Showing you know the canon (**Willison**, **Greshake et al.**, **OWASP
LLM Top 10**) *and* that you accept there is no single fix is what reads as senior.
