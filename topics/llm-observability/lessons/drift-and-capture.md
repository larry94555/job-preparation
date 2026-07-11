# LLM observability — drift, canaries, capture & replay

## Detecting drift with canaries

Not every regression is a crash. **Drift** is a *gradual* change in output quality or in the input
distribution over time — even when your code never changed. A provider tweaks a model, users start
asking different questions, and eval scores slide. Error counters stay green the whole time.

To catch it you trend the things that move slowly: **eval/quality scores**, and **input/output
distribution** stats. And when you deliberately ship a new prompt or model version, you de-risk it
with a **canary release**: route a small slice of live traffic to the candidate version and compare
its signals — latency, cost, error rate, and eval scores — side by side against the current version
before promoting it to everyone. Version-tagging every span (prompt version, model version) is what
makes that comparison possible.

## Capture, replay, and privacy/redaction

To debug a specific failure you often need the actual **prompt and completion**, not just the
signals. **Capture/replay** stores those payloads so you can reproduce a failing run deterministically
and step through it. Because storing everything is expensive and risky, you **sample** — keep a
fraction of traces, plus the ones that errored.

The tension is **privacy**. Raw prompts frequently contain **PII**, so logging them verbatim is an
antipattern. The standard fix is **redaction**: remove or tokenize PII *at capture time*, before the
payload is written to the trace store, and pair it with sampling and access controls. Done right, you
keep traces that are still useful for debugging without hoarding sensitive user data.
