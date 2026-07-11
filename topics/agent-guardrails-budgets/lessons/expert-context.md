# Expert context: papers, frontier & interview

## Papers people and the frontier

Agent guardrails and budgets is a practitioner topic — its canon is a short list of agent
patterns and guardrail frameworks you should be able to name and place in an interview:

- **ReAct** and **Reflexion** are the agent-loop foundations. ReAct is the reason-then-act loop
  where the model interleaves thinking with tool actions; **Reflexion** adds self-reflection and
  retry so a failed attempt informs the next one. These are the loops that budgets and termination
  conditions have to bound — an agent that reasons and acts on its own has no natural stopping point.
- Anthropic's **"Building Effective Agents"** is the practitioner guidance experts point to: it
  argues for simple, composable, well-bounded patterns over elaborate autonomy, and treats
  verification and limits as first-class rather than afterthoughts.
- Guardrail frameworks give you the enforcement layer. **NeMo Guardrails** (NVIDIA) and
  **Guardrails AI** are the two you should be able to name — programmable rails that constrain what
  an agent is allowed to do and validate its inputs/outputs against policy.

Tools you'd reference: **Guardrails AI, NeMo Guardrails**, and the **budget features built into agent
SDKs**. Current SOTA is budgets across **steps, tools, tokens, cost, and time** combined with
**no-progress (loop) detection** and **human-in-the-loop (HITL) escalation** for high-risk actions.
Open problems experts still argue about: reliably **detecting when an agent is "stuck"**, **safe
long-horizon autonomy**, and **principled budgets** (how to set limits that aren't just guesses).

## Interviewing on agent guardrails and budgets

What a strong interviewer probes here:

- Can you **enumerate the termination conditions** an agent runner needs — not just "stop on
  success," but detected failure/no-progress and every budget-exhaustion exit (steps, tools, tokens,
  cost, wall-clock)? Naming success-only as the antipattern is the fastest positive signal.
- Do you understand **why budgets matter even for a "correct" agent** — that an agent which usually
  succeeds can still loop, hang on a slow tool, or blow a cost ceiling on the one hard task, so limits
  are not just for buggy agents?
- Can you reason about **guardrails for high-risk actions** — allow-list (deny-by-default) over
  deny-list, HITL confirmation before irreversible actions, and a circuit breaker that halts on a
  risk threshold?

**Red flags** that sink candidates: proposing **open-ended loops** with no cap, having **no cost
ceiling**, or relying on **success-only exit conditions**. Asked to design an agent runner, lead with
the full set of **termination conditions and budgets**, then **no-progress detection**, then
**allow-list + HITL + circuit-breaker** guardrails for high-risk actions — and name **ReAct/Reflexion**
as the loop, Anthropic's **"Building Effective Agents"** as the guidance, and **NeMo Guardrails /
Guardrails AI** as the enforcement frameworks. Showing you bound *and* verify the agent is what reads
as senior.
