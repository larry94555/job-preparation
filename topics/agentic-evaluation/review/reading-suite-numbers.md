---
title: "Reading a suite's numbers"
order: 2
covers:
  - mc-avg-vs-pass
  - fe-avg-score
  - mc-failed-list
---
## Reading a suite's numbers

**In brief.** `pass_rate` is the headline, but a suite that reports only a fraction hides two things: how
good the passes actually were, and which cases broke. `avg_score` and the list of failed inputs are what
turn a number into a diagnosis.

**What the suite reports.**

- **pass_rate** — binary per case: the fraction of cases that cleared the bar, summarizing performance across the whole distribution rather than any single case. It says nothing about how comfortably each case cleared it.
- **avg_score** — the mean score over the cases: how good the outputs were, not just how many cleared the bar. This is the quality a binary fraction hides. A high `pass_rate` sitting next to a low `avg_score` means many cases pass but only barely — the passes are weak. Two runs with the identical `pass_rate` and different `avg_score` are not the same run: the lower-`avg_score` one is scraping over the bar while the higher one clears it comfortably.
- **The failed inputs** — the specific cases that did not pass. A bare aggregate like "73%" tells you something regressed; it does not tell you what. Returning the failed inputs lets you open those cases, see the pattern, and fix it — the difference between an alarm and a diagnosis, and what turns a bad run into a debuggable one.

**Why it matters.** Keeping `pass_rate`, `avg_score`, and the failure list together is what stops a suite
from hiding weak-but-passing behavior behind one fraction, and what makes a drop something you can act on
instead of only notice.
