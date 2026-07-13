# Security & guardrails — expert context

## The OWASP LLM Top 10

Agent security has a canonical reference point: the **OWASP Top 10 for LLM Applications**, the field's
shared checklist of the ways LLM systems get exploited. Knowing where it puts prompt injection — and how
it splits the attack — is what reads as senior in a security conversation.

- **Prompt injection is #1.** On the OWASP LLM Top 10, prompt injection sits at the top of the list: the
  single most important risk to defend an agentic system against. Everything else — insecure output
  handling, excessive agency, data leakage — compounds once an attacker can inject instructions.
- **Direct vs. indirect injection.** OWASP and the research literature distinguish **direct** injection
  (the malicious instruction is typed straight into the prompt) from **indirect** injection (the payload
  is planted in content the agent later *fetches* — a web page, a document, an email). Greshake et al.
  (2023) named indirect injection as the practical, dangerous case: the attacker never touches your agent,
  they just leave a trap where it will read. Simon Willison's writing popularized *why* there is no clean
  fix — a capable model is built to follow instructions wherever they appear.
- **The rest of the list is the guardrails.** Insecure output handling, excessive agency, and sensitive
  information disclosure are the OWASP entries that the next section's guardrails address directly:
  sandbox untrusted code, gate high-authority tools, redact PII, and filter output.

The durable takeaway: prompt injection is not a solved problem with a patch — it is the #1 named risk, it
has a direct and an indirect form, and the defense is *layered mitigation*. An expert can name where a
given control sits on the OWASP list and which form of injection it actually blocks.

See also **safety-engineering** and **multi-tenant-isolation**.
