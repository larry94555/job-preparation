import assert from "node:assert/strict";
import { test } from "node:test";
import { compactToFit } from "./solution.js";

const ids = (items: { text: string }[]) => items.map((i) => i.text);

test("keeps pinned items plus non-pinned that fit, in original order", () => {
  const items = [
    { text: "sys", tokens: 40, pinned: true },
    { text: "a", tokens: 30, pinned: false },
    { text: "b", tokens: 30, pinned: false },
  ];
  // pinned sys(40); a → 70 <= 100; b → 100 <= 100. all kept.
  assert.deepEqual(ids(compactToFit(items, 100)), ["sys", "a", "b"]);
});

test("skips a big non-pinned item but a smaller later one still fits", () => {
  const items = [
    { text: "sys", tokens: 40, pinned: true },
    { text: "big", tokens: 100, pinned: false },
    { text: "small", tokens: 20, pinned: false },
  ];
  // pinned sys(40); big → 140 > 120 (skip, don't stop); small → 60 <= 120 (fits).
  assert.deepEqual(ids(compactToFit(items, 120)), ["sys", "small"]);
});

test("pinned items are always kept even when they alone exceed the budget", () => {
  const items = [
    { text: "p1", tokens: 80, pinned: true },
    { text: "p2", tokens: 80, pinned: true },
    { text: "x", tokens: 10, pinned: false },
  ];
  // pinned total is 160 > budget 100 → both pinned still kept; no non-pinned fits.
  assert.deepEqual(ids(compactToFit(items, 100)), ["p1", "p2"]);
});

test("drops all overflow when only pinned fit, preserving order", () => {
  const items = [
    { text: "a", tokens: 30, pinned: false },
    { text: "sys", tokens: 50, pinned: true },
    { text: "b", tokens: 30, pinned: false },
  ];
  // pinned sys(50); a → 80 <= 80 (fits); b → 110 > 80 (skip). order preserved: a, sys.
  assert.deepEqual(ids(compactToFit(items, 80)), ["a", "sys"]);
});
