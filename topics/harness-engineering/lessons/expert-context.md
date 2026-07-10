# Expert context: papers, frontier & interview

## Papers people and the frontier

Harness engineering is an applied-systems topic, and its canon is a short list of agent-loop work
you should be able to name and summarize in an interview:

- **ReAct** (Yao et al., 2022) introduced the reason-then-act agent loop — interleaving chain-of-
  thought reasoning with tool actions. It became the default mental model for how an agent thinks and
  acts, and most modern harnesses are a hardened variant of it.
- **Reflexion** (Shinn et al., 2023) added **self-reflection and retry**: the agent critiques its own
  failed attempt and revises. The field received it as the canonical way to turn a one-shot call into
  an iterative, self-correcting loop.
- **Toolformer** (Schick et al., Meta, 2023) showed models could **learn to call tools/APIs** as part
  of generation — establishing that tool use is a first-class model capability, not just prompt glue.
- **"Building Effective Agents"** (Anthropic, 2024) is the practitioner touchstone: it argues for
  simple, composable patterns and for spending complexity only where it earns its keep.

Tools you'd reference: **Claude Agent SDK, OpenAI Agents SDK, LangChain/LlamaIndex, smolagents** —
and **AutoGPT** as the cautionary example of an unbounded loop. Current SOTA is **structured agent
loops with verification and budgets**, plus SWE-bench-style agentic coding harnesses. Open problems
experts still argue about: reliable **long-horizon autonomy**, **verifying open-ended tasks**, and
**robust error recovery**.

## Interviewing on harness engineering

What a strong interviewer probes here:

- Can you cleanly **split model vs. harness responsibilities** — what the model decides versus what
  the surrounding code guarantees (retries, verification, budgets, state)? That separation is the
  signal that you've *built* agents, not just prompted them.
- How do you **bound and verify** an agent: what stops the loop, and how do you check the output
  rather than trusting it?

**Red flags** that sink candidates: reaching for **"just improve the prompt"** to fix a structural
failure, **trusting model output unverified**, or designing **unbounded loops** with no step, tool,
token, or cost ceiling. Asked to design a harness, lead with the **model/harness boundary**, then a
**ReAct-style loop with verification**, then **budgets and termination conditions** — and cite
**Reflexion** for self-correction and Anthropic's **"Building Effective Agents"** for keeping it
simple. Showing you know the canon *and* can defend where the harness (not the model) owns
reliability is what reads as senior.
