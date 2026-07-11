import assert from "node:assert/strict";
import { test } from "node:test";
import type { LoadedSkill } from "@job-prep/engine";
import { gradeOpen } from "./evaluator.js";
import type { LlamaClient } from "./llama.js";

// gradeOpen turns a model's JSON reply into a deterministic verdict. We stub the
// client so this exercises the parsing/coercion/aggregation logic with no model.

/** A fake LlamaClient that returns a fixed raw string (or throws). */
function stub(raw: string | (() => never)): LlamaClient {
  return {
    async chatJson() {
      if (typeof raw === "function") return raw();
      return raw;
    },
  } as unknown as LlamaClient;
}

const skill = {
  body: "Grade the answer. Return checks.",
  frontmatter: { id: "eval-x", applies_to: "essay", output_schema: "EssayCheckScore" },
} as unknown as LoadedSkill;

test("valid JSON → graded, checks parsed, verdict aggregated", async () => {
  const raw = JSON.stringify({
    checks: { technically_correct: true, concrete: true },
    feedback: "solid",
  });
  const r = await gradeOpen({ skill, answer: "an answer" }, stub(raw));
  assert.equal(r.graded, true);
  if (!r.graded) return;
  assert.deepEqual(r.checks, { technically_correct: true, concrete: true });
  assert.equal(r.feedback, "solid");
  assert.equal(r.aggregate.verdict, "pass");
});

test("a false gate check caps the verdict down", async () => {
  // 3/4 true would be pass, but the gate (technically_correct) is false → capped.
  const raw = JSON.stringify({
    checks: { addresses_question: true, covers_key_points: true, technically_correct: false, concrete: true },
    feedback: "one wrong claim",
  });
  const r = await gradeOpen({ skill, answer: "x" }, stub(raw));
  assert.equal(r.graded, true);
  if (!r.graded) return;
  assert.equal(r.aggregate.verdict, "borderline");
});

test("loose JSON embedded in prose / code fences is still extracted", async () => {
  const raw = 'Sure! Here is my grade:\n```json\n{"checks":{"technically_correct":true},"feedback":"ok"}\n```';
  const r = await gradeOpen({ skill, answer: "x" }, stub(raw));
  assert.equal(r.graded, true);
  if (!r.graded) return;
  assert.equal(r.checks.technically_correct, true);
});

test('string "true"/"false" are coerced to booleans', async () => {
  const raw = '{"checks":{"technically_correct":"true","concrete":"false"},"feedback":"x"}';
  const r = await gradeOpen({ skill, answer: "x" }, stub(raw));
  assert.equal(r.graded, true);
  if (!r.graded) return;
  assert.equal(r.checks.technically_correct, true);
  assert.equal(r.checks.concrete, false);
});

test("unparseable output → graded:false, offline:false (model replied but unusable)", async () => {
  const r = await gradeOpen({ skill, answer: "x" }, stub("I cannot produce JSON, sorry."));
  assert.equal(r.graded, false);
  if (r.graded) return;
  assert.equal(r.offline, false);
  assert.match(r.reason, /usable JSON/);
});

test("client/network error → graded:false, offline:true", async () => {
  const r = await gradeOpen(
    { skill, answer: "x" },
    stub(() => {
      throw new Error("ECONNREFUSED");
    }),
  );
  assert.equal(r.graded, false);
  if (r.graded) return;
  assert.equal(r.offline, true);
  assert.match(r.reason, /ECONNREFUSED/);
});

test("calibration exemplars + reference points + evidence still grade cleanly", async () => {
  const raw = '{"checks":{"technically_correct":true},"feedback":"ok"}';
  const calibration = {
    skill: "eval-x",
    cases: [
      { answer: "good one", expect: { verdict: "pass" as const, checks: { technically_correct: true } } },
      { answer: "bad one", expect: { verdict: "fail" as const, checks: { technically_correct: false } } },
    ],
  };
  const r = await gradeOpen(
    { skill, answer: "x", referencePoints: ["point A", "point B"], evidence: "tests: 2/2", calibration },
    stub(raw),
  );
  assert.equal(r.graded, true);
});
