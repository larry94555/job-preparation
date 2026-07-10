import assert from "node:assert/strict";
import { test } from "node:test";
import { getStructured } from "./solution.js";

// A duck-typed schema: valid iff it's an object with a string `name`.
const schema = {
  safeParse(v: unknown) {
    return v && typeof v === "object" && typeof (v as { name?: unknown }).name === "string"
      ? { success: true as const, data: v as { name: string } }
      : { success: false as const, error: new Error("expected { name: string }") };
  },
};

test("returns the parsed value when the model is valid first try", async () => {
  const r = await getStructured(async () => JSON.stringify({ name: "ok" }), schema, {
    maxRepairs: 2,
    fallback: { name: "fallback" },
  });
  assert.equal(r.name, "ok");
});

test("repairs then succeeds within budget", async () => {
  let call = 0;
  const r = await getStructured(
    async () => {
      call++;
      return call === 1 ? "not json at all" : JSON.stringify({ name: "fixed" });
    },
    schema,
    { maxRepairs: 2, fallback: { name: "fb" } },
  );
  assert.equal(r.name, "fixed");
  assert.ok(call >= 2, "should have retried at least once");
});

test("falls back after exhausting a bounded number of repairs", async () => {
  let call = 0;
  const r = await getStructured(
    async () => {
      call++;
      return "always broken";
    },
    schema,
    { maxRepairs: 2, fallback: { name: "fb" } },
  );
  assert.equal(r.name, "fb", "should return the fallback");
  assert.ok(call <= 3, "must be bounded: 1 initial + at most maxRepairs calls");
});
