import assert from "node:assert/strict";
import { test } from "node:test";
import { isGrounded } from "./solution.js";

test("supported claim is grounded despite case and whitespace differences", () => {
  const sources = ["The   Treaty of   Westphalia was signed in 1648."];
  assert.equal(isGrounded("treaty of westphalia was signed in 1648", sources), true);
});

test("a claim in no source is fabricated → false", () => {
  const sources = ["Photosynthesis converts light into chemical energy."];
  assert.equal(isGrounded("The mitochondria signed the Treaty of Westphalia", sources), false);
});

test("supported by the second of multiple sources → true", () => {
  const sources = [
    "Recall@k measures how many relevant items land in the top k.",
    "Grounding asks whether each claim is entailed by the retrieved context.",
  ];
  assert.equal(isGrounded("grounding asks whether each claim is entailed", sources), true);
});

test("empty sources → false", () => {
  assert.equal(isGrounded("any claim at all", []), false);
});
