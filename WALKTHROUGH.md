# Full Walkthrough — how to traverse every topic

This is the start-to-finish guide for a new learner. Follow it top to bottom: it gets you running in
two commands, tells you exactly which lesson to do first and what to expect, and then hands you a
recommended order with a one-click "next topic" at every step. You never have to guess what to do next.

---

## 1. Run it locally (2 commands)

```bash
cd c:\users\larry\github\job-preparation
npm install          # first time only
npm run begin-lesson # opens the hub at http://localhost:4319
```

Then open **http://localhost:4319** in your browser. That's the whole setup.

**Optional but recommended — the grader.** Multiple-choice and fill-in checks grade instantly with no
model. The open-ended **essay** and **code** tasks are graded by a small local model. If you have
[Ollama](https://ollama.com) running with `qwen2.5:3b-instruct` (or `llama3:8b`), start the runner with:

```bash
# Windows PowerShell
$env:LLAMA_BASE_URL="http://localhost:11434/v1"; $env:LLAMA_MODEL="qwen2.5:3b-instruct"; npm run begin-lesson
```

If no model is running, nothing breaks — open-ended tasks show your submission and the reference points
and let you continue. Coding exercises always run locally (no model needed).

---

## 2. Your first lesson: **Harness Engineering**

Start here. It's the foundation the rest of the course builds on — how the agent loop, tools, and
control flow are wired — and it teaches the vocabulary (loop, tool call, budget, stop condition) you'll
reuse everywhere.

**How to start it:** on the hub, click the big **Proceed →** button. It drops you into Harness
Engineering at step 1. (Or click the **Harness Engineering** card in the grid.)

### What to expect inside a lesson

Every lesson follows the same rhythm, so once you've done one you know them all:

1. **Present** — a short, focused reading (the concept, with a concrete example).
2. **Check** — a quick multiple-choice or fill-in question with instant feedback. Getting it wrong
   never blocks you; it just shows the explanation.
3. **Apply** — a hands-on task: write a short **essay** answer, or solve a **coding exercise** (which
   runs against real tests) or a **debugging exercise** (fix the bug so the tests pass).
4. **Section assessment** — a slightly harder mixed quiz that sets your **mastery** for that section.

Harness Engineering is **47 steps** (~20–35 minutes). You advance with the **Continue →** button; the
right-hand **Mastery** panel fills in as you go.

### The mastery colors (no red, ever)

Sections are colored by how well you've shown you know them — you only ever see mastery, never failures:

⬜ Not started → 🟦 Learning → 🟩 Developing (turquoise) → 🟢 Proficient (light green) → 🟢 **Mastered** (bright green)

Assessments are **tough but friendly**: hard on purpose, but you get **unlimited retries** and your
mastery never goes down. Aim for light green (interview-ready); push to bright green when you want.

---

## 3. When you finish a lesson — go to the next one

At the end of every lesson you land on a **"You reached the end"** screen with a primary button labeled
**"Next: <the next topic> →"**. Click it and you're immediately in the next recommended lesson. That's
the whole navigation model — finish, click Next, repeat.

You can also:
- **All lessons** — go back to the hub grid (each card shows its status: *Not started / In progress /
  Played through / mastered*, plus its mastery dots).
- **Proceed →** (on the hub) — always resumes wherever you left off, or starts the next unstarted topic.
- **Restart this lesson** / **Review N due** — repeat material any time (see §5).

Because the hub always knows the next topic, you can just alternate **Proceed → … finish … Next →** all
the way through the course without ever deciding what to open.

---

## 4. The recommended order (all 22 topics)

Do them top to bottom — this is exactly the order **Proceed** and **Next** follow. Check them off as you
go. Grouped into clusters; each cluster builds on the previous one.

### Foundations — start here
- [ ] 1. **Harness Engineering** — the agent loop, tools, control flow *(47 steps)*
- [ ] 2. **Context Engineering** — what goes in the window and why *(51)*

### Reliability — make the model's outputs trustworthy
- [ ] 3. **Structured Output Reliability** — schemas, validation, bounded repair, fallback *(53)*
- [ ] 4. **Function-Calling Reliability** — typed tool contracts, idempotency *(51)*
- [ ] 5. **Agent Guardrails & Budgets** — bounding loops, budgets, stop conditions *(54)*
- [ ] 6. **Model Routing & Fallback** — cascades, circuit breakers, degraded UX *(51)*

### Retrieval — ground answers in your data
- [ ] 7. **RAG Architecture** — hybrid retrieval, reranking, RRF *(52)*
- [ ] 8. **Retrieval Evals** — recall@k / precision@k / MRR / nDCG *(54)*

### Quality & Ops — know if it's working and what it costs
- [ ] 9. **Eval Methodology** — golden sets, judges, regression gates *(51)*
- [ ] 10. **LLM Observability** — traces, spans, token/cost/latency, drift *(51)*
- [ ] 11. **Cost Attribution** — cost-per-successful-outcome, per-feature/tenant *(51)*

### Serving & Inference — the systems that make it fast and cheap
- [ ] 12. **Prompt vs. Semantic Caching** — prefix caching vs. similarity cache *(52)*
- [ ] 13. **KV Cache Management** — sizing, paging, eviction *(55)*
- [ ] 14. **Prefill vs. Decode Latency** — TTFT/ITL, chunked prefill, disaggregation *(52)*
- [ ] 15. **Batching, Paged Attention & Throughput** — continuous batching *(51)*
- [ ] 16. **Speculative Decoding, Quantization & Distillation** — the speedup levers *(49)*
- [ ] 17. **Quantization: Formats & Quality** — GPTQ/AWQ, int8/fp8, quality gates *(54)*

### Safety & Multi-tenancy
- [ ] 18. **Safety Engineering** — prompt injection, trust boundaries, egress *(51)*
- [ ] 19. **Multi-tenant Isolation** — tenant-scoped data and caches *(54)*

### Capstones — integrative; they synthesize everything above
- [ ] 20. **Adaptation Strategy Selection** — prompt vs. RAG vs. fine-tune vs. distill *(55)*
- [ ] 21. **Inference-Stack Tradeoffs** — the four-way latency/throughput/cost/quality call *(52)*
- [ ] 22. **Production Failure Modes** — detect → mitigate → prevent *(51)*

> **In a hurry / picking à la carte?** The first two (Foundations) are the only hard prerequisites for
> the vocabulary. After that, each cluster is fairly self-contained — you can jump to the cluster you
> care about (e.g. "Serving & Inference" for interview prep on systems) and still follow Next within it.
> Do the **Capstones last** — they assume the rest.

---

## 5. Repeating lessons & going deeper

Nothing is one-and-done. To reinforce or push a section to bright green:

- **Restart this lesson** (on the end screen) or **Reset** — replays a topic from step 1.
- **Review N due** (on the hub) — spaced-repetition: resurfaces items you got wrong or haven't seen in a
  while, **across all topics**. Do this whenever the hub shows items due.
- **Mock interview** — a timed, 10-question mixed exam for one topic (great before a real interview).
- **Cumulative assessment** — a topic-wide draw across all its sections.
- **Analytics** (on the hub) — your mastery-over-time trend and retention forecast (what's due now / soon).

---

## 6. The 60-second recap

1. `npm run begin-lesson` → open **http://localhost:4319**.
2. Click **Proceed →** — it starts you on **Harness Engineering**.
3. Read → answer checks → do the apply task → take the section assessment. Use **Continue →** to move.
4. At the end, click **"Next: … →"** to flow into the next topic — repeat 22 times.
5. Use **Review due**, **Mock**, and **Restart** any time to reinforce; **Analytics** to see progress.

That's the whole loop. Start with Proceed and let **Next** carry you through all 22 topics in order.
