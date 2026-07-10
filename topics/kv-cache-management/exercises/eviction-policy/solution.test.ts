import assert from "node:assert/strict";
import { test } from "node:test";
import { planAdmission } from "./solution.js";

test("admits with no eviction when there is free room", () => {
  const live = [{ id: "a", blocks: 2, lastUsed: 1 }];
  assert.deepEqual(planAdmission(10, live, 3), { admit: true, evict: [] });
});

test("rejects when need exceeds capacity, evicting nothing", () => {
  const live = [{ id: "a", blocks: 2, lastUsed: 1 }];
  assert.deepEqual(planAdmission(4, live, 5), { admit: false, evict: [] });
});

test("evicts least-recently-used first, minimum necessary", () => {
  // capacity 6, used 6 (full). Need 2. LRU order: a(t=1), b(t=2), c(t=3).
  const live = [
    { id: "b", blocks: 2, lastUsed: 2 },
    { id: "a", blocks: 2, lastUsed: 1 },
    { id: "c", blocks: 2, lastUsed: 3 },
  ];
  const r = planAdmission(6, live, 2);
  assert.equal(r.admit, true);
  assert.deepEqual(r.evict, ["a"]); // evicting the single LRU frees enough; stop there
});

test("evicts multiple in LRU order until it fits", () => {
  const live = [
    { id: "a", blocks: 2, lastUsed: 1 },
    { id: "b", blocks: 2, lastUsed: 2 },
    { id: "c", blocks: 2, lastUsed: 3 },
  ];
  const r = planAdmission(6, live, 4); // full pool, need 4 → evict a then b
  assert.equal(r.admit, true);
  assert.deepEqual(r.evict, ["a", "b"]);
});
