import assert from "node:assert/strict";
import { test } from "node:test";
import { blockTable } from "./solution.js";

test("the [3,5]/2 example — contiguous ids from a running counter", () => {
  // seq0 needs ceil(3/2)=2 blocks → [0,1]; seq1 needs ceil(5/2)=3 blocks → [2,3,4].
  assert.deepEqual(blockTable([3, 5], 2), [[0, 1], [2, 3, 4]]);
});

test("exact multiples of the block size", () => {
  // ceil(4/4)=1, ceil(8/4)=2, ceil(4/4)=1 → [[0],[1,2],[3]].
  assert.deepEqual(blockTable([4, 8, 4], 4), [[0], [1, 2], [3]]);
});

test("a zero-length sequence gets [] and does not consume a block id", () => {
  // ceil(0/2)=0 → []; the counter is unaffected, so the next seq starts at 1.
  assert.deepEqual(blockTable([2, 0, 3], 2), [[0], [], [1, 2]]);
});

test("blocks are globally unique and contiguous per sequence", () => {
  const table = blockTable([5, 1, 6], 2); // needs 3, 1, 3 blocks → 7 total
  const flat = table.flat();
  // all ids unique
  assert.equal(new Set(flat).size, flat.length);
  // globally contiguous 0..6 with no gaps
  assert.deepEqual([...flat].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5, 6]);
  // each sequence's own ids are consecutive
  for (const blocks of table) {
    for (let i = 1; i < blocks.length; i++) {
      assert.equal(blocks[i], blocks[i - 1] + 1);
    }
  }
});
