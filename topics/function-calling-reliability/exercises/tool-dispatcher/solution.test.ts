import assert from "node:assert/strict";
import { test } from "node:test";
import { ToolDispatcher } from "./solution.js";

test("unknown tool returns a structured error, not a throw", () => {
  const d = new ToolDispatcher();
  assert.deepEqual(d.call("nope", {}), { ok: false, error: "unknown_tool" });
});

test("invalid args are rejected before the handler runs", () => {
  let ran = 0;
  const d = new ToolDispatcher();
  d.register("add", { handler: () => { ran++; return 1; }, validate: (a: any) => typeof a.x === "number" });
  assert.deepEqual(d.call("add", { x: "nope" }), { ok: false, error: "invalid_args" });
  assert.equal(ran, 0);
});

test("a valid call runs and returns the value", () => {
  const d = new ToolDispatcher();
  d.register("inc", { handler: (a: any) => a.x + 1 });
  assert.deepEqual(d.call("inc", { x: 2 }), { ok: true, value: 3 });
});

test("idempotent mutating retry runs the handler exactly once", () => {
  let ran = 0;
  const d = new ToolDispatcher();
  d.register("charge", { mutating: true, handler: () => { ran++; return "charged"; } });
  const a = d.call("charge", {}, { idempotencyKey: "k1" });
  const b = d.call("charge", {}, { idempotencyKey: "k1" });
  assert.equal(ran, 1);
  assert.deepEqual(a, { ok: true, value: "charged" });
  assert.deepEqual(a, b);
});

test("read-only tools are not deduped by key", () => {
  let ran = 0;
  const d = new ToolDispatcher();
  d.register("read", { handler: () => { ran++; return "r"; } });
  d.call("read", {}, { idempotencyKey: "k" });
  d.call("read", {}, { idempotencyKey: "k" });
  assert.equal(ran, 2);
});
