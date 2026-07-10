import assert from "node:assert/strict";
import { test } from "node:test";
import { runIdempotent } from "./solution.js";

test("runs once for a new key and returns its result", () => {
  const done = new Map<string, string>();
  let calls = 0;
  const r = runIdempotent("a", () => { calls++; return "v1"; }, done);
  assert.equal(r, "v1");
  assert.equal(calls, 1);
  assert.equal(done.get("a"), "v1");
});

test("retry with the same key is cached: run is called exactly once", () => {
  const done = new Map<string, string>();
  let counter = 0;
  const run = () => { counter++; return `n${counter}`; };
  const first = runIdempotent("k", run, done);
  const second = runIdempotent("k", run, done);
  assert.equal(first, "n1");
  assert.equal(second, "n1"); // same value both times
  assert.equal(counter, 1); // run invoked exactly once across two calls
});

test("different keys each call run", () => {
  const done = new Map<string, string>();
  let counter = 0;
  const run = () => { counter++; return `n${counter}`; };
  assert.equal(runIdempotent("a", run, done), "n1");
  assert.equal(runIdempotent("b", run, done), "n2");
  assert.equal(counter, 2);
  assert.equal(done.size, 2);
});

test("does not call run when key is already present in done", () => {
  const done = new Map<string, string>([["seen", "cached"]]);
  let called = false;
  const r = runIdempotent("seen", () => { called = true; return "fresh"; }, done);
  assert.equal(r, "cached");
  assert.equal(called, false);
});
