import assert from "node:assert/strict";
import { test } from "node:test";
import { Router } from "./solution.js";

test("returns the first provider that succeeds", () => {
  const r = new Router(3);
  const res = r.run([{ name: "a", call: () => "A" }, { name: "b", call: () => "B" }]);
  assert.deepEqual(res, { ok: true, provider: "a", value: "A" });
});

test("falls through to the next provider on error", () => {
  const r = new Router(3);
  const res = r.run([
    { name: "a", call: () => { throw new Error("down"); } },
    { name: "b", call: () => "B" },
  ]);
  assert.equal(res.ok, true);
  assert.equal((res as any).provider, "b");
});

test("all providers failing returns all_failed (no throw)", () => {
  const r = new Router(3);
  const res = r.run([{ name: "a", call: () => { throw 1; } }]);
  assert.deepEqual(res, { ok: false, error: "all_failed" });
});

test("circuit breaker skips a provider after threshold failures", () => {
  const r = new Router(2);
  const bad = { name: "a", call: () => { throw 1; } };
  const good = { name: "b", call: () => "B" };
  r.run([bad, good]); // a fails (1)
  r.run([bad, good]); // a fails (2) → breaker open
  let aCalled = 0;
  const aNow = { name: "a", call: () => { aCalled++; return "A"; } };
  const res = r.run([aNow, good]);
  assert.equal(aCalled, 0); // a is skipped without being called
  assert.equal((res as any).provider, "b");
});
