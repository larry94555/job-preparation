import assert from "node:assert/strict";
import { test } from "node:test";
import { ToolDispatcher } from "./solution.js";

test("same key executes the tool once and returns the cached result", () => {
  const d = new ToolDispatcher();
  let calls = 0;
  d.register("refundOrder", (args) => {
    calls += 1;
    return { refunded: args.orderId, attempt: calls };
  });

  const first = d.dispatch("refundOrder", { orderId: "A" }, "key-1");
  const retry = d.dispatch("refundOrder", { orderId: "A" }, "key-1");

  assert.equal(calls, 1); // <- fails when the result is never cached under the key
  assert.deepEqual(first, retry);
});

test("different keys each execute the tool once", () => {
  const d = new ToolDispatcher();
  let calls = 0;
  d.register("refundOrder", (args) => {
    calls += 1;
    return { refunded: args.orderId };
  });

  d.dispatch("refundOrder", { orderId: "A" }, "key-1");
  d.dispatch("refundOrder", { orderId: "B" }, "key-2");

  assert.equal(calls, 2);
});

test("many retries of the same key still run the side effect only once", () => {
  const d = new ToolDispatcher();
  let calls = 0;
  d.register("chargeCard", () => {
    calls += 1;
    return calls;
  });

  for (let i = 0; i < 5; i++) d.dispatch("chargeCard", {}, "same-key");

  assert.equal(calls, 1);
});

test("unknown tool throws", () => {
  const d = new ToolDispatcher();
  assert.throws(() => d.dispatch("missing", {}, "k"), /unknown tool/);
});
