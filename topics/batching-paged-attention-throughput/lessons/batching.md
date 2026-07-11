# Batching — static, dynamic, continuous

## Static and dynamic batching

A GPU is happiest running many requests at once: loading the model weights is expensive, and a batch
amortizes that cost across every request in it. The question is *how* you form the batch.

**Static batching** launches a fixed group of requests together and runs the whole group until it
finishes. The catch: the batch does not finish until its **single longest** request finishes
generating. Short requests complete early but keep their slot, sitting idle while the slowest one
grinds on. This is **head-of-line blocking** — a long request at the head holds up everything behind
it, and the GPU wastes cycles on slots that have nothing left to do.

**Dynamic batching** is a first improvement: instead of a hand-picked fixed group, the server
assembles a batch on the fly from whatever requests are queued, up to a maximum size or a short wait
window. That helps utilization at admission time. But once a dynamic batch *starts*, its membership is
still frozen for the batch's lifetime — it runs to completion together, so head-of-line blocking is
reduced but not solved.

## Continuous batching

**Continuous (in-flight) batching** changes the granularity of the decision. Instead of choosing batch
membership once per batch, the scheduler revisits it **every decoding step**. The moment a request
emits its end-of-sequence token, it is evicted from the batch and a queued request is admitted into the
freed slot on the very next iteration.

The effect: the batch stays full of *useful* work. A short request no longer waits for the longest one
in its batch — it leaves as soon as it is done, and a new request immediately fills the gap. This keeps
GPU occupancy high across a stream of requests with wildly different output lengths, which is exactly
the workload real serving faces. Continuous batching is the single biggest throughput win in modern LLM
serving, and it is what engines like vLLM, TGI, and TensorRT-LLM do by default.
