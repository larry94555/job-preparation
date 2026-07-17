---
title: "Alerts that page on incidents, not noise"
order: 3
covers:
  - mc-alert-threshold
  - expert-slo-alerting
---
## Alerts that page on incidents, not noise

**In brief.** An alert is a rule on a metric that fires when a threshold is crossed — and a threshold set
carelessly is worse than no alert at all: it fires on blips, the team learns to ignore it, and the real
incident goes unread. The SRE SLO discipline is where the fix comes from.

**The discipline.**

- **Alert fatigue** — what a rule that fires on single-point noise produces. An alert nobody trusts no longer closes the loop from observing a production surprise to being told the next time it happens, which was its only job. Lowering the threshold so it fires even more often, or alerting on every individual span, makes the noise worse rather than better.
- **Anchor the threshold to an SLO or budget** — the ceiling comes from what the metrics taught you: a cost surprise sets a cost ceiling, a tail-latency surprise sets a latency SLO, a failure-rate surprise sets a failure-rate limit. The Google SRE canon — the chapters on SLOs and on monitoring and alerting — is where this budget-and-threshold discipline, and the dashboards-versus-alerts split, are borrowed from.
- **Put the SLO on the tail, not the mean** — a latency alert defined on the mean watches the wrong number, because the mean averages away the very hangs users experience. The SLO belongs on p95 or p99.
- **Require the breach to persist** — fire on a sustained window (the tail over budget for a stretch of time) or a burn-rate style rule rather than on a single spike, so that a page means a real incident rather than one noisy point.
- **Dashboards for trends, alerts for thresholds** — the split that keeps each honest. The alert catches the incident at 3am even when nobody is looking; the dashboard is the always-on trend view you go to in order to understand it. Deleting a noisy alert and relying on someone watching the dashboard just puts you back to discovering incidents after the fact.

**Why it matters.** A threshold anchored to a tail SLO and sustained over a window is the difference
between a page that means something and a rule the team mutes — and a muted alert leaves you exactly
where the topic started: reading the trace of an incident nobody told you about.
