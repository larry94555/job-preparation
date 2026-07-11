import assert from "node:assert/strict";
import { test } from "node:test";
import type { EscalationGrade, GradeOpts, Verdict } from "@job-prep/evaluator";
import { InMemoryJobQueue } from "@job-prep/store";
import type { RunResult } from "@job-prep/sandbox";
import { runWorker, type WorkerDeps } from "./worker.js";

/** A stub grade that always returns the same verdict. */
const fixed =
  (verdict: Verdict) =>
  async (_opts: GradeOpts): Promise<EscalationGrade> => ({ verdict, feedback: `stub ${verdict}` });

/** A stub grade cycling verdicts to force a tie/no-majority across best-of-3. */
function cycling(seq: Verdict[]): (opts: GradeOpts) => Promise<EscalationGrade> {
  let i = 0;
  return async (): Promise<EscalationGrade> => {
    const v = seq[i % seq.length];
    i++;
    return { verdict: v, feedback: `stub ${v}` };
  };
}

/** CodeRunner.run stub — never actually runs code. */
const stubRun =
  (passed: boolean) =>
  async (): Promise<RunResult> => ({ passed, timedOut: false, output: "stub tests" });

test("worker: essay job with a clear-majority stub → done/pass", async () => {
  const queue = new InMemoryJobQueue();
  const id = await queue.enqueue({
    userId: "u1",
    topicId: "t1",
    questionId: "q1",
    kind: "essay",
    payload: { answer: "an answer" },
  });

  const deps: WorkerDeps = { grade: fixed("pass"), run: stubRun(true) };
  const n = await runWorker(queue, deps, {});

  assert.equal(n, 1, "one job processed");
  const job = await queue.get(id);
  assert.equal(job!.status, "done", "clear majority is completed, not flagged");
  const result = job!.result as { verdict: Verdict; needsReview: boolean };
  assert.equal(result.verdict, "pass");
  assert.equal(result.needsReview, false);
});

test("worker: essay tie escalates to bigGrade → done with big model's verdict", async () => {
  const queue = new InMemoryJobQueue();
  const id = await queue.enqueue({
    userId: "u1",
    topicId: "t1",
    questionId: "q2",
    kind: "essay",
    payload: { answer: "a contentious answer" },
  });

  // best-of-3 yields [pass, fail, borderline] — no majority → bigGrade decides.
  const deps: WorkerDeps = {
    grade: cycling(["pass", "fail", "borderline"]),
    bigGrade: fixed("pass"),
    run: stubRun(true),
  };
  const n = await runWorker(queue, deps, {});

  assert.equal(n, 1);
  const job = await queue.get(id);
  assert.equal(job!.status, "done", "big-model tiebreak resolves → done");
  const result = job!.result as { verdict: Verdict; needsReview: boolean; trail: string[] };
  assert.equal(result.verdict, "pass");
  assert.equal(result.needsReview, false);
  assert.ok(
    result.trail.some((t) => t.includes("escalated to big model")),
    "escalation trail records the big-model tiebreak",
  );
});

test("worker: essay tie with no bigGrade → flagged for human review", async () => {
  const queue = new InMemoryJobQueue();
  const id = await queue.enqueue({
    userId: "u1",
    topicId: "t1",
    questionId: "q3",
    kind: "essay",
    payload: { answer: "an ambiguous answer" },
  });

  // No majority and no bigGrade → needsReview → flagged.
  const deps: WorkerDeps = {
    grade: cycling(["pass", "fail", "borderline"]),
    run: stubRun(true),
  };
  const n = await runWorker(queue, deps, {});

  assert.equal(n, 1);
  const job = await queue.get(id);
  assert.equal(job!.status, "flagged", "no-confidence case is flagged for human review");
  const result = job!.result as { needsReview: boolean };
  assert.equal(result.needsReview, true);
});

test("worker: code job with failing tests → fail regardless of concept", async () => {
  const queue = new InMemoryJobQueue();
  const id = await queue.enqueue({
    userId: "u1",
    topicId: "t1",
    questionId: "q4",
    kind: "code",
    payload: { answer: "function f(){}", testCode: "import './solution.js';" },
  });

  // Concept would pass, but the tests fail → correctness gate caps to fail.
  const deps: WorkerDeps = { grade: fixed("pass"), run: stubRun(false) };
  const n = await runWorker(queue, deps, {});

  assert.equal(n, 1);
  const job = await queue.get(id);
  assert.equal(job!.status, "done");
  const result = job!.result as { verdict: Verdict; testsPassed: boolean };
  assert.equal(result.verdict, "fail", "failing tests force a fail verdict");
  assert.equal(result.testsPassed, false);
});

test("worker: drains multiple jobs and returns the count", async () => {
  const queue = new InMemoryJobQueue();
  for (let i = 0; i < 3; i++) {
    await queue.enqueue({
      userId: "u1",
      topicId: "t1",
      questionId: `q${i}`,
      kind: "essay",
      payload: { answer: `a${i}` },
    });
  }
  const deps: WorkerDeps = { grade: fixed("pass"), run: stubRun(true) };
  const n = await runWorker(queue, deps, {});
  assert.equal(n, 3, "all queued jobs drained");
  assert.equal(await queue.claim(), null, "queue empty after drain");
});
