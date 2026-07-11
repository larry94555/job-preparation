# Reading list & staying current — safety-engineering

**Snapshot: 2026-07-09.** A curated path into the primary sources for this topic, plus how to keep the
list current as the field moves (Goals D2/D7). Each entry says *why it matters* and *what to notice* —
read for the idea and the tradeoff, not the exact numbers. Sourced from `references/canon.md`; where a
year is given it is context, not something to memorize.

## Start here (the load-bearing ideas)
- **"Prompt injection" — Simon Willison (2022, blog).** The post that named the problem: untrusted input
  smuggling instructions the model then follows as authoritative. Notice that the framing, not a defense,
  is the contribution — naming the class is what made it defensible at all.
- **Indirect prompt injection — Greshake et al. (2023).** The paper that showed injection needn't come from
  the user: instructions can ride in on retrieved or tool-returned content. Notice why this is the harder
  *agentic* problem — the attacker never touches the prompt, so input-side filtering can't see them coming.

## Go deeper (the underlying pattern & the field checklist)
- **The confused-deputy problem.** The classic security pattern injection actually instantiates: a
  privileged component tricked into misusing its authority on an attacker's behalf. Notice that this reframes
  the fix — the issue is delegated *authority*, not bad text, so provenance and least privilege are the levers.
- **OWASP LLM Top 10.** The field's risk checklist, with prompt injection at the top. Notice how it turns a
  research idea into an engineering enumeration — use it as the denominator when auditing a system's surface.
- **Why filtering alone fails → defense-in-depth.** The load-bearing design conclusion: no single filter
  catches all injections, so safety comes from layered controls. Notice this is a *consequence* of the open
  problem below, not a workaround you can skip.

## Frontier — what to watch
- **No robust general injection defense (the standing open problem).** There is no known defense that reliably
  stops injection in the general case. Watch claims of a "solved" filter with deep skepticism — the honest
  frontier is provenance and containment, not detection.
- **Provenance at scale.** Tracking which spans are trusted vs. untrusted through a long, tool-using pipeline
  is unsolved at production scale. Watch for trust-boundary tagging that survives retrieval, summarization,
  and multi-hop tool calls.
- **Agent egress control.** As agents gain data-out tools, the frontier moves to bounding what can leave.
  Watch for allow-listed egress and confirmation gates treated as first-class architecture, not add-ons.

## Tools & implementations worth reading
- **Injection detectors — Rebuff, LLM-Guard.** The detection layer of a defense-in-depth stack. Reading their
  rulesets is the fastest way to see both what heuristics catch and, more instructively, what they miss.
- **Guardrails frameworks & policy engines.** The enforcement layer that turns trust boundaries and least
  privilege into runtime checks. Notice where policy sits relative to the model — enforcement belongs outside
  the model, not in the prompt.

## How to stay current on this topic
- Follow **Simon Willison's** writing and the **OWASP LLM Top 10** revisions — the vocabulary and the risk
  checklist both evolve there first.
- Track the **Rebuff / LLM-Guard** and guardrails repos and their release notes — new detector heuristics and
  their bypasses land in code and issues before any paper.
- When a new "injection defense" appears, ask the three canon questions: *what does it trade (safety/latency/
  privilege), what threat regime does it actually cover, and what proves it isn't just a filter?* — the same
  lens the deep-dive lesson uses.
- Re-read this topic's `expert-surface.md` when the frontier shifts; its 🟡/⬜ items are your next reads.

## Reception & what aged
- **Prompt injection still has no robust general defense — the open problem outlasted the hype.** Willison
  coined/popularized the term in September 2022, and years later the honest consensus remains that no filter
  reliably stops it; the field has shifted from "detect" to provenance, least privilege, and containment.
- **Indirect injection became the load-bearing agentic threat.** Greshake et al. (2023,
  arXiv:2302.12173, "Not What You've Signed Up For") aged extremely well: as RAG and tool-using agents went
  mainstream, injection-via-retrieved-content is now the canonical attack, and its taxonomy (data theft,
  worming, ecosystem contamination) is routinely cited.
- **OWASP LLM Top 10 became the industry checklist, with prompt injection entrenched at #1.** The 2025
  edition keeps Prompt Injection at LLM01 for the second consecutive release and added agent-era categories
  (Excessive Agency, System Prompt Leakage, Unbounded Consumption) — evidence the guardrails/egress framing aged correctly.
- **The confused-deputy reframing proved the durable mental model.** Treating injection as delegated-authority
  misuse (not "bad text") is what justified the defense-in-depth / least-privilege / egress-control stack that
  is now standard advice, over the filter-only approaches that kept getting bypassed.

