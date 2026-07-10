# Degraded-mode UX done honestly

## The silent-swap antipattern

When a fallback path uses a **weaker** model, it is tempting to just return its answer as if nothing
happened. That **silent substitution** is an antipattern. The answer may be lower quality or
**inconsistent** with what the same user got a minute ago on the primary model. Users have no way to
calibrate their trust, and operators can't tell degraded output from a genuine bug — the incident
hides in plain sight. Silent swaps trade a visible, understood degradation for an invisible,
confusing one.

## Honest degraded mode

The goal of **degraded mode** is to keep the product *usable* while being *transparent* that capability
is reduced. Honest degradation signals the change:

- **Tell the user** — a small banner, notice, or lowered-confidence indicator: "Running in reduced
  mode; answers may be less detailed."
- **Disable what the fallback can't do** — if the weaker path lacks tools, vision, or long context,
  turn those features off rather than let them fail silently or hallucinate.
- **Emit the signal to operators** — track a **fallback rate** metric and surface it on dashboards, so
  the degradation shows up in monitoring, not just in confused users.

Done well, degraded mode is a feature: the user still gets *something* useful during an outage, knows
its limits, and your team sees exactly when and how often you're running degraded. The line to hold is
honesty — never pass off a degraded answer as full quality.
