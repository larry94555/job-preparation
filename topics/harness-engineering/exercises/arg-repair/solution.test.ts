import assert from "node:assert/strict";
import { test } from "node:test";
import { repairToolArgs } from "./solution.js";

test("clean JSON: numeric-string value is coerced for keys in numberKeys", () => {
  const r = repairToolArgs('{"limit":"42","query":"cats"}', ["limit"]);
  assert.deepEqual(r, { limit: 42, query: "cats" });
});

test("JSON embedded in prose/backticks is extracted (first { to last })", () => {
  const raw = 'Sure! Here are the args:\n```json\n{"page":"3","topic":"kv"}\n```\nHope that helps.';
  const r = repairToolArgs(raw, ["page"]);
  assert.deepEqual(r, { page: 3, topic: "kv" });
});

test("unparseable / no object returns null", () => {
  assert.equal(repairToolArgs("no json here at all", ["x"]), null);
  assert.equal(repairToolArgs('{"broken": ', ["x"]), null);
});

test("keys not in numberKeys are left as-is (non-listed numeric string stays a string)", () => {
  const r = repairToolArgs('{"count":"7","code":"007"}', ["count"]);
  assert.deepEqual(r, { count: 7, code: "007" });
});
