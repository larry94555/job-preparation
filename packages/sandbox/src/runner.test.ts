import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createCodeRunner, HttpRunner, LocalRunner } from "./runner.js";

const KEYS = ["SANDBOX", "SANDBOX_URL"] as const;
const saved: Record<string, string | undefined> = {};
for (const k of KEYS) saved[k] = process.env[k];
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

test("createCodeRunner: default → local, http needs SANDBOX_URL, unknown throws", () => {
  for (const k of KEYS) delete process.env[k];
  assert.ok(createCodeRunner() instanceof LocalRunner, "default is the in-process runner");

  process.env.SANDBOX = "http";
  assert.throws(() => createCodeRunner(), /SANDBOX_URL/);

  process.env.SANDBOX_URL = "http://sandbox:4500";
  assert.ok(createCodeRunner() instanceof HttpRunner, "http + SANDBOX_URL builds the remote runner");

  delete process.env.SANDBOX_URL;
  process.env.SANDBOX = "bogus";
  assert.throws(() => createCodeRunner(), /Unknown SANDBOX/);
});

test("LocalRunner.run: passing tests → passed:true", async () => {
  const runner = new LocalRunner();
  const res = await runner.run({
    solutionCode: "export const add = (a: number, b: number): number => a + b;",
    testCode:
      'import { test } from "node:test";\n' +
      'import assert from "node:assert/strict";\n' +
      'import { add } from "./solution.js";\n' +
      'test("adds", () => { assert.equal(add(2, 3), 5); });\n',
    timeoutMs: 20000,
  });
  assert.equal(res.timedOut, false);
  assert.equal(res.passed, true, res.output);
});

test("LocalRunner.run: failing tests → passed:false", async () => {
  const runner = new LocalRunner();
  const res = await runner.run({
    solutionCode: "export const add = (a: number, b: number): number => a + b;",
    testCode:
      'import { test } from "node:test";\n' +
      'import assert from "node:assert/strict";\n' +
      'import { add } from "./solution.js";\n' +
      'test("wrong", () => { assert.equal(add(2, 3), 6); });\n',
    timeoutMs: 20000,
  });
  assert.equal(res.passed, false);
});
