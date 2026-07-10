import assert from "node:assert/strict";
import { test } from "node:test";
import { rollupTokens } from "./solution.js";

test("a leaf totals its own tokens", () => {
  assert.equal(rollupTokens({ name: "leaf", tokens: 7, children: [] }), 7);
});

test("includes the root's own tokens plus a child", () => {
  assert.equal(rollupTokens({ name: "r", tokens: 4, children: [{ name: "x", tokens: 1, children: [] }] }), 5);
});

test("rolls up across multiple depths", () => {
  const tree = {
    name: "root",
    tokens: 10,
    children: [
      { name: "a", tokens: 5, children: [] },
      { name: "b", tokens: 3, children: [{ name: "c", tokens: 2, children: [] }] },
    ],
  };
  assert.equal(rollupTokens(tree), 20); // 10 + 5 + 3 + 2
});
