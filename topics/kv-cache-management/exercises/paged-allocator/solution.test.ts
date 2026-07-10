import assert from "node:assert/strict";
import { test } from "node:test";
import { PagedKVAllocator } from "./solution.js";

test("allocates ceil(tokens/blockSize) unique, in-range blocks", () => {
  const a = new PagedKVAllocator(4, 10);
  assert.equal(a.freeBlocks(), 10);
  const b = a.allocate(6); // ceil(6/4) = 2
  assert.ok(b !== null);
  assert.equal(b!.length, 2);
  assert.equal(a.freeBlocks(), 8);
  b!.forEach((x) => assert.ok(x >= 0 && x < 10));
  assert.equal(new Set(b!).size, 2);
});

test("returns null when not enough free blocks, leaving the pool unchanged", () => {
  const a = new PagedKVAllocator(4, 3);
  assert.equal(a.allocate(100), null); // needs 25 > 3
  assert.equal(a.freeBlocks(), 3);
});

test("two live allocations never share a block", () => {
  const a = new PagedKVAllocator(2, 10);
  const x = a.allocate(4)!;
  const y = a.allocate(4)!;
  assert.equal(x.filter((v) => y.includes(v)).length, 0);
  assert.equal(a.freeBlocks(), 6);
});

test("free returns blocks to the pool for reuse", () => {
  const a = new PagedKVAllocator(4, 5);
  const x = a.allocate(20)!; // ceil(20/4) = 5 → all
  assert.equal(x.length, 5);
  assert.equal(a.freeBlocks(), 0);
  assert.equal(a.allocate(1), null);
  a.free(x);
  assert.equal(a.freeBlocks(), 5);
  assert.ok(a.allocate(1) !== null);
});
