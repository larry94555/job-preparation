import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyFailure } from "./solution.js";

// valid iff it parses to an object containing a `name` key
const schema = {
  safeParse(v: unknown) {
    return { success: !!v && typeof v === "object" && "name" in (v as object) };
  },
};

test("unparseable input → malformed_json", () => {
  assert.equal(classifyFailure("{ not valid json", schema), "malformed_json");
});

test("parses but violates schema → schema_violation", () => {
  assert.equal(classifyFailure('{"x": 1}', schema), "schema_violation");
});

test("parses and matches schema → valid", () => {
  assert.equal(classifyFailure('{"name": "ok"}', schema), "valid");
});
