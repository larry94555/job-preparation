# KV cache — fragmentation and paged attention

## Why contiguous allocation fragments memory

The naive way to store a sequence's KV cache is one **contiguous block**, sized to the *maximum*
length the sequence might reach. That wastes memory in two ways:

- **Internal fragmentation** — a request that reserves room for 4096 tokens but only generates 200
  still holds the whole slab. The gap between *reserved* and *actually used* length is dead memory.
- **External fragmentation** — as sequences of different sizes finish and free their slabs, the freed
  gaps are scattered. A new large request may not fit even when the *total* free memory is plenty.

Because KV is what caps concurrency, this wasted capacity directly costs you requests you could
otherwise have served.

## Paged attention and block tables

**Paged attention** (vLLM-style) borrows the classic operating-systems idea of **paging**. Instead of
one contiguous slab, the KV cache is split into **fixed-size blocks**. Each sequence keeps a **block
table** — a map from its logical token positions to the physical blocks that hold them, exactly like
an OS page table maps virtual pages to physical frames.

The payoff:

- Physical KV memory **need not be contiguous**; a sequence grows one block at a time, on demand, so
  internal fragmentation drops to at most one partly-filled block.
- Memory packs tightly, so more sequences fit — higher **concurrency**.
- The indirection unlocks **prefix sharing**: two sequences that begin with the same prompt prefix
  (say, a shared system prompt) can point their block tables at the **same physical blocks**, so the
  shared prefix is computed and stored **once** instead of per request.
