import assert from "node:assert/strict";
import { test } from "node:test";
import { redact } from "./solution.js";

test("redacts a top-level sensitive key and preserves the rest", () => {
  const out = redact({ user: "alice", apiKey: "sk-123" }, ["apiKey"]);
  assert.deepEqual(out, { user: "alice", apiKey: "[REDACTED]" });
});

test("redacts sensitive keys in nested objects and arrays of objects", () => {
  const out = redact(
    {
      req: { headers: { authorization: "Bearer x", accept: "json" } },
      messages: [
        { role: "user", password: "hunter2" },
        { role: "system", content: "ok" },
      ],
    },
    ["authorization", "password"],
  );
  assert.deepEqual(out, {
    req: { headers: { authorization: "[REDACTED]", accept: "json" } },
    messages: [
      { role: "user", password: "[REDACTED]" },
      { role: "system", content: "ok" },
    ],
  });
});

test("does not mutate the input object", () => {
  const input = { token: "secret", meta: { keep: 1 } };
  const clone = structuredClone(input);
  redact(input, ["token"]);
  assert.deepEqual(input, clone);
});

test("passes non-object primitives through unchanged", () => {
  assert.equal(redact("hello", ["token"]), "hello");
  assert.equal(redact(42, ["token"]), 42);
  assert.equal(redact(null, ["token"]), null);
});
