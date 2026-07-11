import assert from "node:assert/strict";
import { test } from "node:test";
import type { Question } from "@job-prep/schema";
import {
  applyParams,
  mulberry32,
  prepareQuestion,
  resolveParameters,
  seedFromString,
  shuffle,
} from "./randomize.js";

// The randomizer is the backbone of reproducibility: a stored seed must replay a
// session identically. These tests pin that determinism.

test("mulberry32 is deterministic per seed and varies across seeds", () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  assert.deepEqual(seqA, seqB, "same seed → same sequence");
  assert.ok(seqA.every((n) => n >= 0 && n < 1), "outputs in [0,1)");
  const c = mulberry32(43);
  assert.notEqual(c(), seqA[0], "different seed → different first draw");
});

test("seedFromString is stable and case/character sensitive", () => {
  assert.equal(seedFromString("session-1"), seedFromString("session-1"));
  assert.notEqual(seedFromString("session-1"), seedFromString("session-2"));
  assert.equal(typeof seedFromString("x"), "number");
});

test("shuffle is a permutation, deterministic per seed, and non-mutating", () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const s1 = shuffle(input, mulberry32(7));
  const s2 = shuffle(input, mulberry32(7));
  assert.deepEqual(s1, s2, "same seed → same order");
  assert.deepEqual([...s1].sort((a, b) => a - b), input, "same multiset (permutation)");
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6, 7, 8], "input not mutated");
  const s3 = shuffle(input, mulberry32(99));
  assert.notDeepEqual(s1, s3, "different seed → (very likely) different order");
});

test("resolveParameters draws within range and is deterministic per seed", () => {
  const params = { n: { random_int: [10, 20] as [number, number] } };
  const a = resolveParameters(params, mulberry32(5));
  const b = resolveParameters(params, mulberry32(5));
  assert.deepEqual(a, b);
  const v = Number(a.n);
  assert.ok(Number.isInteger(v) && v >= 10 && v <= 20, `n in [10,20], got ${a.n}`);
  assert.equal(typeof a.n, "string", "values are stringified");
  assert.deepEqual(resolveParameters(undefined, mulberry32(1)), {}, "no params → empty");
});

test("applyParams substitutes known placeholders and leaves unknown ones", () => {
  assert.equal(applyParams("sum of {{a}} and {{b}}", { a: "2", b: "3" }), "sum of 2 and 3");
  assert.equal(applyParams("{{missing}} stays", {}), "{{missing}} stays");
});

test("prepareQuestion (MCQ) shuffles deterministically and preserves correctness", () => {
  const q = {
    id: "q1",
    type: "multiple_choice",
    prompt: "pick one",
    shuffle_options: true,
    options: [
      { text: "A", correct: false },
      { text: "B", correct: true },
      { text: "C", correct: false },
      { text: "D", correct: false },
    ],
  } as unknown as Question;

  const p1 = prepareQuestion(q, mulberry32(3));
  const p2 = prepareQuestion(q, mulberry32(3));
  assert.equal(p1.type, "multiple_choice");
  if (p1.type !== "multiple_choice" || p2.type !== "multiple_choice") return;
  assert.deepEqual(p1.options, p2.options, "same seed → same option order");
  assert.equal(p1.options.length, 4, "no options lost");
  assert.equal(p1.options.filter((o) => o.correct).length, 1, "exactly one correct preserved");
  assert.equal(p1.options.find((o) => o.correct)?.text, "B", "correct answer still B");
});

test("prepareQuestion (MCQ) keeps order when shuffle_options is false", () => {
  const q = {
    id: "q2",
    type: "multiple_choice",
    prompt: "p",
    shuffle_options: false,
    options: [
      { text: "A", correct: true },
      { text: "B", correct: false },
    ],
  } as unknown as Question;
  const p = prepareQuestion(q, mulberry32(1));
  if (p.type !== "multiple_choice") throw new Error("expected mcq");
  assert.deepEqual(p.options.map((o) => o.text), ["A", "B"]);
});

test("prepareQuestion (text_input) resolves params and substitutes the prompt", () => {
  const q = {
    id: "q3",
    type: "text_input",
    prompt: "what is {{n}} squared?",
    parameters: { n: { random_int: [3, 3] } },
  } as unknown as Question;
  const p = prepareQuestion(q, mulberry32(1));
  if (p.type !== "text_input") throw new Error("expected text_input");
  assert.equal(p.params.n, "3");
  assert.equal(p.prompt, "what is 3 squared?");
});

test("prepareQuestion passes essay/code prompts through unchanged", () => {
  const essay = prepareQuestion({ id: "e", type: "essay", prompt: "discuss" } as Question, mulberry32(1));
  assert.deepEqual(essay, { id: "e", type: "essay", prompt: "discuss" });
  const code = prepareQuestion({ id: "c", type: "code", prompt: "implement" } as Question, mulberry32(1));
  assert.deepEqual(code, { id: "c", type: "code", prompt: "implement" });
});
