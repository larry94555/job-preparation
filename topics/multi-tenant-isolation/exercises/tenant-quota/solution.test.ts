import assert from "node:assert/strict";
import { test } from "node:test";
import { admitByQuota } from "./solution.js";

test("caps a single tenant's burst at the quota", () => {
  const requests = [
    { tenantId: "acme" },
    { tenantId: "acme" },
    { tenantId: "acme" },
    { tenantId: "acme" },
  ];
  // quota 2: first two admitted, the rest rejected.
  assert.deepEqual(admitByQuota(requests, 2), [true, true, false, false]);
});

test("a noisy tenant's burst cannot starve another tenant", () => {
  const requests = [
    { tenantId: "noisy" },
    { tenantId: "noisy" },
    { tenantId: "noisy" }, // over quota → rejected
    { tenantId: "quiet" }, // still gets its own quota
  ];
  assert.deepEqual(admitByQuota(requests, 2), [true, true, false, true]);
});

test("interleaved tenants each get their own independent quota", () => {
  const requests = [
    { tenantId: "a" },
    { tenantId: "b" },
    { tenantId: "a" },
    { tenantId: "b" },
    { tenantId: "a" }, // a's 3rd → over quota
    { tenantId: "b" }, // b's 3rd → over quota
  ];
  assert.deepEqual(admitByQuota(requests, 2), [true, true, true, true, false, false]);
});

test("rejected requests do not consume quota", () => {
  // quota 1: after the cap is hit, later requests stay rejected — the rejects
  // never free up or eat quota, and a different tenant is unaffected.
  const requests = [
    { tenantId: "a" },
    { tenantId: "a" },
    { tenantId: "a" },
    { tenantId: "b" },
  ];
  assert.deepEqual(admitByQuota(requests, 1), [true, false, false, true]);
});
