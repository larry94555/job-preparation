import assert from "node:assert/strict";
import { test } from "node:test";
import { TenantCache } from "./solution.js";

test("one tenant cannot read another tenant's value for the same key", () => {
  const c = new TenantCache();
  c.set("acme", "x", "acme-secret");
  // globex never wrote "x" — it must be a miss, not acme's value.
  assert.equal(c.get("globex", "x"), undefined);
});

test("set/get round-trips within the same tenant", () => {
  const c = new TenantCache();
  c.set("acme", "profile", { name: "A" });
  assert.deepEqual(c.get("acme", "profile"), { name: "A" });
});

test("same key, two tenants -> isolated values", () => {
  const c = new TenantCache();
  c.set("acme", "config", "acme-config");
  c.set("globex", "config", "globex-config");
  assert.equal(c.get("acme", "config"), "acme-config");
  assert.equal(c.get("globex", "config"), "globex-config");
});

test("different keys within a tenant do not collide", () => {
  const c = new TenantCache();
  c.set("acme", "a", 1);
  c.set("acme", "b", 2);
  assert.equal(c.get("acme", "a"), 1);
  assert.equal(c.get("acme", "b"), 2);
});
