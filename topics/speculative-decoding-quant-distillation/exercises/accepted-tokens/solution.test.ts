import assert from "node:assert/strict";
import { test } from "node:test";
import { acceptedTokens } from "./solution.js";

test("accepts leading matches plus one bonus token", () => {
  assert.equal(acceptedTokens([true, true, false]), 3);
});

test("a fully-rejected draft still yields one real token", () => {
  assert.equal(acceptedTokens([false, true, true]), 1); // stop at first reject; later matches don't count
});

test("all drafted tokens accepted → all plus a bonus", () => {
  assert.equal(acceptedTokens([true, true, true]), 4);
});

test("empty draft yields one token", () => {
  assert.equal(acceptedTokens([]), 1);
});
