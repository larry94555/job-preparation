import assert from "node:assert/strict";
import { test } from "node:test";
import { rootOf } from "./solution.js";

test("a chain a->b->c maps every span to the root 'a'", () => {
  const spans = [
    { id: "a", parentId: null },
    { id: "b", parentId: "a" },
    { id: "c", parentId: "b" },
  ];
  assert.deepEqual(rootOf(spans), { a: "a", b: "a", c: "a" });
});

test("two siblings share the same root", () => {
  // root r with two children x and y; each child also has a grandchild.
  const spans = [
    { id: "r", parentId: null },
    { id: "x", parentId: "r" },
    { id: "y", parentId: "r" },
    { id: "x1", parentId: "x" },
    { id: "y1", parentId: "y" },
  ];
  assert.deepEqual(rootOf(spans), { r: "r", x: "r", y: "r", x1: "r", y1: "r" });
});

test("a lone root maps to itself", () => {
  const spans = [{ id: "solo", parentId: null }];
  assert.deepEqual(rootOf(spans), { solo: "solo" });
});

test("two independent traces each resolve to their own root", () => {
  const spans = [
    { id: "a", parentId: null },
    { id: "b", parentId: "a" },
    { id: "p", parentId: null },
    { id: "q", parentId: "p" },
    { id: "r", parentId: "q" },
  ];
  assert.deepEqual(rootOf(spans), { a: "a", b: "a", p: "p", q: "p", r: "p" });
});
