import assert from "node:assert/strict";
import { test } from "node:test";
import { rankThenFit, type RankItem } from "./solution.js";

const total = (items: RankItem[]) => items.reduce((s, i) => s + i.tokens, 0);

test("selected total never exceeds the budget", () => {
  const items: RankItem[] = [
    { text: "a", score: 0.9, tokens: 60 },
    { text: "b", score: 0.8, tokens: 50 },
    { text: "c", score: 0.7, tokens: 40 },
  ];
  const chosen = rankThenFit(items, 100);
  assert.ok(total(chosen) <= 100, `total ${total(chosen)} exceeded budget 100`);
});

test("a high-score but too-big item is skipped while a smaller lower-score item still fits", () => {
  const items: RankItem[] = [
    { text: "big", score: 0.95, tokens: 90 },   // ranked first, does not fit in remaining budget
    { text: "small", score: 0.4, tokens: 10 },  // lower score, but should still be admitted
  ];
  const chosen = rankThenFit(items, 50);
  const texts = chosen.map((c) => c.text);
  assert.ok(total(chosen) <= 50);
  assert.ok(!texts.includes("big"), "too-big item should be skipped");
  assert.ok(texts.includes("small"), "smaller later item should still fit after skipping");
});

test("items are considered in descending score order", () => {
  const items: RankItem[] = [
    { text: "low", score: 0.2, tokens: 30 },
    { text: "high", score: 0.9, tokens: 30 },
    { text: "mid", score: 0.5, tokens: 30 },
  ];
  const chosen = rankThenFit(items, 60);
  const texts = chosen.map((c) => c.text);
  // Budget fits two items; the two highest-scoring must be chosen, in order.
  assert.deepEqual(texts, ["high", "mid"]);
  assert.ok(total(chosen) <= 60);
});

test("everything fits when the budget is generous", () => {
  const items: RankItem[] = [
    { text: "a", score: 0.9, tokens: 10 },
    { text: "b", score: 0.8, tokens: 20 },
    { text: "c", score: 0.7, tokens: 30 },
  ];
  const chosen = rankThenFit(items, 1000);
  assert.equal(chosen.length, 3);
  assert.ok(total(chosen) <= 1000);
});
