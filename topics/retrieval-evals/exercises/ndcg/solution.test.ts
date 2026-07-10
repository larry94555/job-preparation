import assert from "node:assert/strict";
import { test } from "node:test";
import { ndcgAtK } from "./solution.js";

const approx = (a: number, b: number) => Math.abs(a - b) < 1e-9;

test("already-ideal order → 1", () => {
  // Descending gains are already the best possible order, so DCG === IDCG.
  assert.ok(approx(ndcgAtK([3, 2, 1, 0], 4), 1), "ideal order must score 1");
});

test("suboptimal order, hand-computed DCG and IDCG", () => {
  // gains = [3, 2, 3, 0, 1, 2], k = 6.
  // DCG@6  = 3/log2(2) + 2/log2(3) + 3/log2(4) + 0/log2(5) + 1/log2(6) + 2/log2(7)
  //        = 3 + 1.261859507 + 1.5 + 0 + 0.386852807 + 0.712414374 = 6.861126688593501
  // IDCG@6 = gains sorted desc [3,3,2,2,1,0]:
  //          3/log2(2) + 3/log2(3) + 2/log2(4) + 2/log2(5) + 1/log2(6) + 0/log2(7)
  //        = 3 + 1.892789260 + 1 + 0.861353116 + 0.386852807 + 0 = 7.1409951840957
  // nDCG@6 = 6.861126688593501 / 7.1409951840957 = 0.9608081943360616
  assert.ok(approx(ndcgAtK([3, 2, 3, 0, 1, 2], 6), 0.9608081943360616), "suboptimal nDCG");
});

test("all-zero gains → 0 (IDCG is 0)", () => {
  assert.ok(approx(ndcgAtK([0, 0, 0], 3), 0), "no relevance → 0, not NaN");
});

test("k smaller than the list truncates both DCG and IDCG", () => {
  // gains = [2, 0, 1, 3], k = 2.
  // DCG@2  = 2/log2(2) + 0/log2(3) = 2
  // IDCG@2 = sorted desc [3,2,1,0] → 3/log2(2) + 2/log2(3) = 3 + 1.261859507 = 4.2618595071429155
  // nDCG@2 = 2 / 4.2618595071429155 = 0.46927872602275644
  assert.ok(approx(ndcgAtK([2, 0, 1, 3], 2), 0.46927872602275644), "k truncation");
});
