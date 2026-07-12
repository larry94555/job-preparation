import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { LlamaClient } from "./llama.js";

// Exercise the HTTP client by stubbing global fetch — verifies the grader sends
// deterministic sampling params + auth, and reads server slot count, with no net.

const realFetch = globalThis.fetch;
let calls: { url: string; init?: RequestInit }[] = [];

function mockFetch(reply: (url: string) => { ok: boolean; status?: number; body?: unknown }) {
  calls = [];
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    const r = reply(String(url));
    return { ok: r.ok, status: r.status ?? (r.ok ? 200 : 500), json: async () => r.body ?? {} } as unknown as Response;
  }) as unknown as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = realFetch;
});

test("chatJson posts pinned deterministic params + auth header and returns content", async () => {
  mockFetch(() => ({ ok: true, body: { choices: [{ message: { content: '{"ok":true}' } }] } }));
  const c = new LlamaClient({ baseUrl: "http://x/v1", model: "m", apiKey: "K", seed: 7, maxTokens: 256 });
  const out = await c.chatJson([{ role: "user", content: "hi" }]);
  assert.equal(out, '{"ok":true}');

  const init = calls[0].init as RequestInit;
  const body = JSON.parse(init.body as string);
  assert.equal(body.model, "m");
  assert.equal(body.temperature, 0);
  assert.equal(body.top_k, 1);
  assert.equal(body.seed, 7);
  assert.equal(body.max_tokens, 256);
  assert.deepEqual(body.response_format, { type: "json_object" });
  assert.equal((init.headers as Record<string, string>).authorization, "Bearer K");
  assert.ok(calls[0].url.endsWith("/chat/completions"));
});

test("chatJson defaults: seed 0, max_tokens 1024, no auth header when unkeyed", async () => {
  const saved = process.env.LLAMA_API_KEY;
  delete process.env.LLAMA_API_KEY;
  try {
    mockFetch(() => ({ ok: true, body: { choices: [{ message: { content: "{}" } }] } }));
    const c = new LlamaClient({ baseUrl: "http://x/v1", model: "m" });
    await c.chatJson([{ role: "user", content: "hi" }]);
    const body = JSON.parse((calls[0].init as RequestInit).body as string);
    assert.equal(body.seed, 0);
    assert.equal(body.max_tokens, 1024);
    assert.equal((calls[0].init!.headers as Record<string, string>).authorization, undefined);
  } finally {
    if (saved !== undefined) process.env.LLAMA_API_KEY = saved;
  }
});

test("chatJson throws on a non-ok response (e.g. 401)", async () => {
  mockFetch(() => ({ ok: false, status: 401 }));
  const c = new LlamaClient({ baseUrl: "http://x/v1", model: "m" });
  await assert.rejects(() => c.chatJson([{ role: "user", content: "hi" }]), /401/);
});

test("slotCount parses total_slots from /props (root, not /v1)", async () => {
  mockFetch((url) => {
    assert.ok(url.endsWith("/props") && !url.includes("/v1/props"), `unexpected url ${url}`);
    return { ok: true, body: { total_slots: 4 } };
  });
  const c = new LlamaClient({ baseUrl: "http://x/v1", model: "m" });
  assert.equal(await c.slotCount(), 4);
});

test("slotCount returns null when /props is unavailable", async () => {
  mockFetch(() => ({ ok: false, status: 404 }));
  const c = new LlamaClient({ baseUrl: "http://x/v1", model: "m" });
  assert.equal(await c.slotCount(), null);
});

test("health reflects response.ok", async () => {
  mockFetch(() => ({ ok: true }));
  assert.equal(await new LlamaClient({ baseUrl: "http://x/v1" }).health(), true);
});
