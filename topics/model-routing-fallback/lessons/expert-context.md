# Expert context: papers, frontier & interview

## Papers people and the frontier

Model routing and fallback is where cost, latency, and quality get traded off explicitly, so the
canon is a short list of work you should be able to name and summarize in an interview:

- **FrugalGPT** (Chen et al., Stanford, 2023) popularized **LLM cascades** to cut cost: send a query
  to a cheap model first, and only **escalate** to a stronger, pricier model when a quality check on
  the cheap answer isn't satisfied. The framing — spend more compute only on the hard requests — is
  the mental model most cost-routing systems still use.
- **RouteLLM** (LMSYS, 2024) made the routing decision itself **learned**: train a router that
  predicts, per request, whether a cheap model will suffice or a strong model is needed, so you route
  by predicted difficulty rather than a fixed rule.

Tools you'd reference are the **gateway/proxy** layer that makes multi-model routing practical:
**LiteLLM** and **OpenRouter**, plus gateway proxies generally, letting you front a **mix of local +
frontier models** behind one interface. Current SOTA in production is **difficulty-based routing +
a fallback cascade + circuit breakers + hedged requests**. Open problems experts still argue about:
**accurate difficulty prediction**, **quality-preserving routing** (routing cheaper without silently
degrading answers), and **consistency under model swaps** (behavior shifting when the backend model
changes).

## Interviewing on model routing and fallback

What a strong interviewer probes here is whether you can **design a fallback chain with breakers and
an honest degraded-mode UX**. The signals they're listening for:

- Can you lay out a **cascade** cheap→strong with an explicit **quality gate / difficulty signal**
  deciding when to escalate — and cite **FrugalGPT** (cascades) and **RouteLLM** (learned routing) as
  the prior art?
- Do you include a **circuit breaker** so a failing provider is dropped instead of hammered, plus
  **backoff/jitter** and optionally **hedged requests** for tail latency?
- When you fall back to a weaker model, do you surface that honestly — a **degraded-mode** indication
  — rather than pretending nothing changed?

**Red flags** that sink candidates: **silent model substitution** (swapping to a weaker model with no
signal to the user or logs), **no circuit breaker** (so a dead provider keeps getting called), and
**retry storms** (unbounded retries with no backoff that amplify an outage). Asked to design routing,
lead with **difficulty-based routing into a fallback cascade**, add **circuit breakers + backoff with
jitter**, consider **hedged requests**, and be explicit about the **degraded-mode UX** — that
combination reads as someone who has run this in production, not just called an API.
