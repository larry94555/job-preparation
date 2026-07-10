import assert from "node:assert/strict";
import { test } from "node:test";
import { TenantCache } from "./solution.js";

test("same tenant get returns the stored value", () => {
  const c = new TenantCache();
  c.set("t1", "balance", "$5");
  assert.equal(c.get("t1", "balance"), "$5");
});

test("another tenant with the same key gets a MISS (no cross-tenant leak)", () => {
  const c = new TenantCache();
  c.set("A", "balance", "A-secret");
  assert.equal(c.get("B", "balance"), null);
});

test("a missing key returns null", () => {
  const c = new TenantCache();
  assert.equal(c.get("t1", "nope"), null);
});

test("tenants are independent under the same key", () => {
  const c = new TenantCache();
  c.set("A", "k", "a");
  c.set("B", "k", "b");
  assert.equal(c.get("A", "k"), "a");
  assert.equal(c.get("B", "k"), "b");
});
