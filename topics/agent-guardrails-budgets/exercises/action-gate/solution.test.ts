import assert from "node:assert/strict";
import { test } from "node:test";
import { gateAction } from "./solution.js";

test("low-risk action is allowed", () => {
  assert.equal(gateAction({ risk: "low" }, { confirmed: false, breakerOpen: false }), "allow");
});

test("high-risk unconfirmed action needs confirmation", () => {
  assert.equal(gateAction({ risk: "high" }, { confirmed: false, breakerOpen: false }), "needs_confirmation");
});

test("high-risk confirmed action is allowed", () => {
  assert.equal(gateAction({ risk: "high" }, { confirmed: true, breakerOpen: false }), "allow");
});

test("open circuit breaker denies even a confirmed high-risk action", () => {
  // Breaker wins over confirmation: containment beats HITL.
  assert.equal(gateAction({ risk: "high" }, { confirmed: true, breakerOpen: true }), "deny");
});
