# Reading list & staying current — agentic-security

**Snapshot: 2026-07-12.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Where a year is given it is context, not
something to memorize.

## Start here (the load-bearing ideas)
- **OWASP Top 10 for LLM Applications.** The field's shared checklist of how LLM systems get exploited.
  Notice that **prompt injection is #1**, and that the rest of the list — insecure output handling,
  excessive agency, sensitive information disclosure — is exactly what the guardrails in this topic
  address.
- **Simon Willison — prompt injection writing.** The clearest running explanation of *why there is no
  clean fix*: a capable model is built to follow instructions wherever they appear, so you cannot fully
  separate instructions from data. Notice the framing of the agent as a confused deputy with real tool
  authority.

## Go deeper (the guardrails)
- **Greshake et al. — indirect prompt injection (2023).** Named the dangerous, practical case: the
  payload is planted in content the agent *fetches*, so the attacker never talks to your agent. Notice
  the shift from direct (typed) to indirect (second-order, tool-fetched) injection.
- **PII redaction & data-loss-prevention practice.** The discipline of scrubbing emails, phone numbers,
  and secret-like tokens before they enter a system. Notice the goal: what never enters the context
  cannot leak, be logged in plaintext, or be memorized.
- **Sandboxing untrusted code (containers, gVisor/Firecracker, seccomp).** How to run hostile code
  without giving it your host: no credentials, no network, ephemeral filesystem, bounded resources.
  Notice that the isolation boundary is both a technical control and the thing an audit points at.

## Frontier — what to watch
- **Output filtering & guardrail frameworks.** Inspecting a proposed action against an allow-list before
  it executes. Notice this is where the confused-deputy defense actually bites — the injection may
  convince the model, but the filter refuses the call.
- **LLM security research (jailbreaks, second-order injection, agent red-teaming).** The active edge where
  new bypasses and defenses appear. Notice that every defense is probabilistic and bypassable; the game is
  raising the attacker's cost, not closing the door.
- **Agentic scale.** Many tools, many turns, many concurrent agents, and content flowing between them —
  where excessive agency and cross-tenant leakage compound. Notice that larger models do not fix
  injection; a more capable model follows a cleverer injection just as faithfully.

## How to stay current on this topic
- Track the **OWASP LLM Top 10** revisions — the ranking and categories shift as new attack classes land.
- Follow **prompt-injection and jailbreak research** (indirect injection, agent red-teaming) and provider
  security guidance for new defenses and new bypasses.
- When a new defense appears, ask: *what does it guarantee vs. merely raise the cost of, what does it
  trade, and which form of injection (direct or indirect) does it actually block?* — the same lens the
  frontier lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.
