import assert from "node:assert/strict";
import { test } from "node:test";
import { PagedKVAllocator } from "./solution.js";

test("allocate removes blocks from the pool (freeBlocks goes down)", () => {
  const a = new PagedKVAllocator(4, 10);
  assert.equal(a.freeBlocks(), 10);
  const b = a.allocate(6); // ceil(6/4) = 2
  assert.ok(b !== null);
  assert.equal(b!.length, 2);
  assert.equal(a.freeBlocks(), 8); // <- fails when allocate() only copies
});

test("two live allocations never share a block", () => {
  const a = new PagedKVAllocator(2, 10);
  const x = a.allocate(4)!; // 2 blocks
  const y = a.allocate(4)!; // 2 more, disjoint
  assert.equal(x.filter((v) => y.includes(v)).length, 0);
  assert.equal(a.freeBlocks(), 6);
});

test("pool is exhaustible and refillable via free()", () => {
  const a = new PagedKVAllocator(4, 5);
  const x = a.allocate(20)!; // all 5 blocks
  assert.equal(a.freeBlocks(), 0);
  assert.equal(a.allocate(1), null); // nothing left
  a.free(x);
  assert.equal(a.freeBlocks(), 5);
  assert.ok(a.allocate(1) !== null);
});
