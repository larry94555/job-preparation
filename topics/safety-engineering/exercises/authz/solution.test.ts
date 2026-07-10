import assert from "node:assert/strict";
import { test } from "node:test";
import { authorize } from "./solution.js";

const policy = { highRisk: ["send_email", "delete"] };

test("a trusted high-risk action is allowed", () => {
  assert.deepEqual(authorize({ tool: "send_email", provenance: "trusted" }, policy), { allowed: true });
});

test("an untrusted low-risk action is allowed", () => {
  assert.deepEqual(authorize({ tool: "read", provenance: "untrusted" }, policy), { allowed: true });
});

test("an untrusted high-risk action is blocked (confused deputy)", () => {
  const r = authorize({ tool: "send_email", provenance: "untrusted" }, policy);
  assert.equal(r.allowed, false);
  assert.equal(r.reason, "untrusted_high_risk");
});

test("independent confirmation overrides the block", () => {
  assert.deepEqual(
    authorize({ tool: "send_email", provenance: "untrusted", confirmed: true }, policy),
    { allowed: true },
  );
});
