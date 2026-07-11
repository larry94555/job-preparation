# Retrieval evals — attribution & citation quality

## What a fabricated citation is

When a RAG system must **cite its sources**, a new failure appears: the **fabricated** (or
**hallucinated**) citation. This is a citation whose referenced source does not exist, or exists but
does not actually support the claim it is attached to. The prose can look authoritative — a crisp
sentence with a footnote — while the footnote points nowhere useful. Counting how many citations an
answer has tells you nothing about whether they hold up.

## Checking attribution at scale

Attribution correctness is a **per-claim** property, so the eval is per-claim too:

- For each cited claim, verify that the referenced **span actually entails the claim** — a
  span/entailment check, run by an LLM-judge or an NLI model.
- Report **fabricated vs. supported** citations, not a raw citation count.
- Sample queries against a **labeled / relevance-judged** set, automate the span check, and route
  low-agreement cases to **human review** to keep the automated judge honest.

## Attribution vs. grounding

Attribution is a **stricter** form of grounding. Grounding asks whether the answer's claims are
supported *somewhere* in the retrieved context. Attribution additionally demands that the **specific
cited source** is the correct support. So an answer can be grounded overall — every claim is backed by
*some* retrieved passage — yet still fail attribution by citing the *wrong* passage or a nonexistent
one. Systems that make decisions on the cited source, not just the prose, need the stricter check.
