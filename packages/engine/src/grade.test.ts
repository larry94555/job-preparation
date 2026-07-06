import assert from "node:assert/strict";
import { test } from "node:test";
import { gradeMultipleChoice, gradeTextInput, normalizeText } from "./grade.js";
import type { MultipleChoiceQuestion, TextInputQuestion } from "@job-prep/schema";

const mcq: MultipleChoiceQuestion = {
  id: "q",
  type: "multiple_choice",
  tags: [],
  prompt: "p",
  shuffle_options: true,
  options: [
    { text: "right", correct: true },
    { text: "wrong", correct: false },
  ],
};

test("multiple choice: correct option passes, wrong fails", () => {
  assert.equal(gradeMultipleChoice(mcq, "right"), true);
  assert.equal(gradeMultipleChoice(mcq, "wrong"), false);
});

test("normalizeText trims, lowercases, collapses whitespace", () => {
  assert.equal(normalizeText("  Max   Tokens "), "max tokens");
});

test("text input: equals with normalization", () => {
  const q: TextInputQuestion = {
    id: "q",
    type: "text_input",
    tags: [],
    prompt: "p",
    answer: { equals: "Repair", normalize: true },
  };
  assert.equal(gradeTextInput(q, "  repair "), true);
  assert.equal(gradeTextInput(q, "fallback"), false);
});

test("text input: parameterized numeric equals with tolerance", () => {
  const q: TextInputQuestion = {
    id: "q",
    type: "text_input",
    tags: [],
    prompt: "p",
    answer: { equals: "{{n}}", numeric_tolerance: 0, normalize: true },
  };
  assert.equal(gradeTextInput(q, "3", { n: "3" }), true);
  assert.equal(gradeTextInput(q, "4", { n: "3" }), false);
});

test("text input: case-insensitive regex", () => {
  const q: TextInputQuestion = {
    id: "q",
    type: "text_input",
    tags: [],
    prompt: "p",
    answer: { regex: "^(zod|ajv)$", normalize: true },
  };
  assert.equal(gradeTextInput(q, "Zod"), true);
  assert.equal(gradeTextInput(q, "lodash"), false);
});
