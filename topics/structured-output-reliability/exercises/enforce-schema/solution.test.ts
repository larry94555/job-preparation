import assert from "node:assert/strict";
import { test } from "node:test";
import { enforce, type Field } from "./solution.js";

const schema: Field[] = [
  { key: "name", type: "string", required: true },
  { key: "age", type: "number", required: true },
  { key: "role", type: "string", required: true, enum: ["admin", "user"] },
  { key: "nickname", type: "string", required: false },
];

test("a fully valid object passes with no errors", () => {
  const r = enforce({ name: "Ada", age: 36, role: "admin" }, schema);
  assert.deepEqual(r, { valid: true, errors: [] });
});

test("a missing required field and a wrong type are both reported", () => {
  // name missing (required); age is a string, not a number.
  const r = enforce({ age: "36", role: "user" }, schema);
  assert.equal(r.valid, false);
  assert.deepEqual(r.errors, ["name: missing", "age: expected number"]);
});

test("an enum violation is flagged", () => {
  const r = enforce({ name: "Ada", age: 36, role: "superuser" }, schema);
  assert.equal(r.valid, false);
  assert.deepEqual(r.errors, ["role: not in enum"]);
});

test("an optional missing field is not an error", () => {
  // nickname (optional) is absent — must not produce an error.
  const r = enforce({ name: "Ada", age: 36, role: "user" }, schema);
  assert.deepEqual(r, { valid: true, errors: [] });
});
