# Expert context: papers, frontier & interview

## Papers people and the frontier

Production failure modes is a synthesis topic: it doesn't have a single founding paper of its own.
Instead it borrows the **reliability-engineering tradition** and stitches together the guard patterns
you already met in the structured-output, agent, and eval topics. So the "canon" here is a discipline
and a checklist, not a stack of new papers.

- The **Google SRE book** is the reliability tradition this topic draws on: **postmortems**
  (blameless write-ups after an incident) and **error budgets** (a quantified allowance for failure
  that trades reliability against velocity) come from that lineage. When an interviewer asks how you'd
  learn from an outage or decide how much reliability is "enough," this is the vocabulary.
- The **OWASP LLM Top 10** is the field checklist for LLM-specific risks — the security/failure
  counterpart to naming the classic web risks. Reach for it when enumerating what can go wrong in an
  LLM app.
- The **guard patterns** themselves are not new here; they are imported from earlier topics:
  **validate-repair-fallback** (structured-output reliability), **budgets and loop detection**
  (agent guardrails), and **CI eval gates** (eval methodology). This topic's contribution is treating
  them as one coherent reliability playbook rather than isolated tricks.

Tools you'd reference: **eval gates**, **guardrails** frameworks, and **observability + alerting**
stacks. Current SOTA is a **detect → mitigate → prevent** posture: validate-repair-fallback for
malformed output, **freshness/TTL** for stale data, **budgets + loop-detection** for runaway agents,
**CI eval-gates** to block regressions before release, and **canaries** to catch them in production.
The hard open problem experts still worry about is **catching silent regressions early** — quality
that quietly drifts down while every request still returns 200 — plus **end-to-end failure
prediction** and **graceful recovery from multiple simultaneous failures**.

## Interviewing on production failure modes

What a strong interviewer probes here:

- Can you name **why silent regressions are worse than loud errors**? A crash pages someone; a
  quietly degraded answer ships to users for weeks. The senior instinct is to instrument *quality*,
  not just *availability*.
- Can you lay out a **detect → mitigate → prevent** playbook rather than a single reaction? Detection
  (evals, canaries, observability), mitigation (validate-repair-fallback, freshness/TTL, budgets,
  degraded-mode UX), and prevention (CI eval-gates, postmortems that close the loop).
- Do you connect the failure to a **guard pattern** — TTL for staleness, loop-detection for runaway
  agents, schema validation for malformed output — instead of proposing a bespoke fix each time?

**Red flags** that sink candidates: **focusing on loud errors while ignoring silent regressions**
(watching only for exceptions and 500s), having **no guardrails**, and running **no postmortems** so
the same incident recurs. Asked to make an LLM system reliable, lead with the **detect → mitigate →
prevent** structure, cite the **Google SRE** vocabulary (postmortems, error budgets) and the **OWASP
LLM Top 10** checklist, and show you'd measure quality — not just uptime — so a silent regression
can't hide behind a green dashboard.
