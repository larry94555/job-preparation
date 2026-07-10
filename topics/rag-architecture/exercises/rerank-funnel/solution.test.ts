import assert from "node:assert/strict";
import { test } from "node:test";
import { rerankFunnel } from "./solution.js";

test("within the top-k, rerank order overrides first-stage order", () => {
  const candidates = [
    { id: "a", score: 0.9 },
    { id: "b", score: 0.8 },
    { id: "c", score: 0.7 },
  ];
  // rerank inverts the first-stage order among the shortlist
  const rerank = (id: string) => ({ a: 0.1, b: 0.5, c: 0.9 }[id] ?? 0);
  assert.deepEqual(rerankFunnel(candidates, 3, rerank), ["c", "b", "a"]);
});

test("a low first-stage candidate that would rerank highly is EXCLUDED (only the shortlist is reranked)", () => {
  const candidates = [
    { id: "a", score: 0.9 },
    { id: "b", score: 0.8 },
    { id: "z", score: 0.1 }, // low first-stage → never enters the top-2 funnel
  ];
  // z would win on rerank, but it never reaches the reranker
  const rerank = (id: string) => ({ a: 0.3, b: 0.4, z: 0.99 }[id] ?? 0);
  const out = rerankFunnel(candidates, 2, rerank);
  assert.ok(!out.includes("z"), "z must not appear: it is outside the top-k");
  assert.deepEqual(out, ["b", "a"]);
});

test("fewer than k candidates → use all of them", () => {
  const candidates = [
    { id: "a", score: 0.2 },
    { id: "b", score: 0.9 },
  ];
  const rerank = (id: string) => ({ a: 0.7, b: 0.1 }[id] ?? 0);
  assert.deepEqual(rerankFunnel(candidates, 5, rerank), ["a", "b"]);
});

test("top-k is selected by first-stage score, not input order", () => {
  const candidates = [
    { id: "lo", score: 0.2 },
    { id: "hi", score: 0.95 },
    { id: "mid", score: 0.6 },
  ];
  // k=2 shortlist by score is {hi, mid}; lo is dropped before reranking
  const rerank = (id: string) => ({ hi: 0.4, mid: 0.8, lo: 0.99 }[id] ?? 0);
  const out = rerankFunnel(candidates, 2, rerank);
  assert.deepEqual(out, ["mid", "hi"]);
  assert.ok(!out.includes("lo"));
});
