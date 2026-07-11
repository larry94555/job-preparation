import assert from "node:assert/strict";
import { test } from "node:test";
import { extractJson } from "./solution.js";

test("extracts a flat object with prose before it", () => {
  const reply = 'Sure! Here you go: {"status": "ok"}';
  assert.deepEqual(extractJson(reply), { status: "ok" });
});

test("extracts a nested object without truncating at the inner brace", () => {
  const reply =
    'Result: {"user": {"id": 7, "name": "Ada"}, "active": true}';
  // Buggy version slices to the FIRST '}', yielding '{"user": {"id": 7, "name": "Ada"}'
  // which is invalid JSON and throws (or drops the later fields).
  assert.deepEqual(extractJson(reply), {
    user: { id: 7, name: "Ada" },
    active: true,
  });
});

test("ignores trailing prose after the object", () => {
  const reply =
    'Here is the object: {"a": 1, "b": 2}. Let me know if you need anything else!';
  assert.deepEqual(extractJson(reply), { a: 1, b: 2 });
});

test("handles a deeply nested object spanning multiple lines with trailing prose", () => {
  const reply =
    'Output below.\n{"id": 42, "meta": {"score": 9, "tags": {"a": 1}}}\nDone, that is the full record.';
  assert.deepEqual(extractJson(reply), {
    id: 42,
    meta: { score: 9, tags: { a: 1 } },
  });
});
