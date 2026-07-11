import type { LoadedSkill } from "@job-prep/engine";
import type { CalibrationSet } from "@job-prep/schema";
import {
  clientForSkill,
  type EscalationGrade,
  type GradeOpts,
  gradeOpen,
  gradeWithEscalation,
  LlamaClient,
  type Verdict,
} from "@job-prep/evaluator";
import { type CodeRunner, createCodeRunner } from "@job-prep/sandbox";
import type { Job, JobQueue } from "@job-prep/store";

/**
 * The grading worker (DESIGN §8). It claims `queued` grading jobs, grades the
 * open-ended submission with confidence escalation, and moves each job to a
 * terminal state (`done`, or `flagged` when the escalation policy asks for human
 * review). Deterministic MC/text checks never reach here — they grade inline.
 *
 * Every model touch is injected via `deps` (`grade`, optional `bigGrade`,
 * `run`), so the whole worker is exercised with STUB graders and no live model.
 * Code execution goes through the `CodeRunner` seam (DESIGN §9): local dev runs
 * the in-process subprocess, hosting runs an isolated HTTP sandbox service — the
 * grading logic here is identical either way. `wireDefaults()` builds the real
 * deps from `@job-prep/evaluator` (llama-server) + `createCodeRunner()` + env
 * models.
 */

/** The submission + everything a worker needs to grade it (job.payload). */
export interface GradingPayload {
  answer: string;
  /** The eval skill, serialized into the job (workers are stateless). */
  skill?: LoadedSkill;
  referencePoints?: string[];
  calibration?: CalibrationSet;
  /** For code jobs: the test file to gate correctness. */
  testCode?: string;
}

export interface WorkerDeps {
  grade: (opts: GradeOpts) => Promise<EscalationGrade>;
  bigGrade?: (opts: GradeOpts) => Promise<EscalationGrade>;
  /** Executes code submissions via the isolated-execution seam (DESIGN §9). */
  run: CodeRunner["run"];
}

/** The result the worker writes back onto the job. */
export interface JobResult {
  verdict: Verdict;
  score?: number;
  feedback?: string;
  needsReview: boolean;
  trail: string[];
  /** Present for code jobs: whether the correctness tests passed. */
  testsPassed?: boolean;
  testOutput?: string;
}

/**
 * Grade one job. Essay → confidence escalation over the concept skill. Code →
 * run the tests first (correctness gate); a failing/absent-passing run caps the
 * verdict, then grade the concept with escalation. A failed test run yields a
 * low verdict regardless of concept.
 */
export async function gradeJob(job: Job, deps: WorkerDeps): Promise<JobResult> {
  const payload = (job.payload ?? {}) as GradingPayload;
  const { grade, bigGrade } = deps;
  const base = {
    grade,
    bigGrade,
    skill: payload.skill,
    answer: payload.answer ?? "",
    calibration: payload.calibration,
  };

  if (job.kind === "code") {
    let testsPassed: boolean | undefined;
    let testOutput = "";
    if (payload.testCode) {
      const res = await deps.run({
        solutionCode: payload.answer ?? "",
        testCode: payload.testCode,
        timeoutMs: 15000,
      });
      testsPassed = res.passed;
      testOutput = res.timedOut ? "Timed out." : res.output;
    }

    const concept = await gradeWithEscalation(base);
    // Correctness gate: a failing test run can't earn a pass (DESIGN §5).
    const verdict: Verdict = testsPassed === false ? "fail" : concept.verdict;
    return {
      verdict,
      score: concept.score,
      feedback: concept.feedback,
      needsReview: concept.needsReview,
      trail:
        testsPassed === undefined
          ? concept.trail
          : [`tests_passed: ${testsPassed}`, ...concept.trail],
      testsPassed,
      testOutput: testOutput.slice(-600),
    };
  }

  // Essay (and any non-code open-ended kind): pure confidence escalation.
  const r = await gradeWithEscalation(base);
  return {
    verdict: r.verdict,
    score: r.score,
    feedback: r.feedback,
    needsReview: r.needsReview,
    trail: r.trail,
  };
}

/**
 * Drain the queue: claim → grade → complete (or flag when needsReview). Processes
 * up to `max` jobs (default: until `claim()` returns null). Returns the count
 * processed. A job that throws is `fail()`ed and counted, so the loop never
 * wedges on a poison job.
 */
export async function runWorker(
  queue: JobQueue,
  deps: WorkerDeps,
  opts: { max?: number } = {},
): Promise<number> {
  const max = opts.max ?? Number.POSITIVE_INFINITY;
  let processed = 0;
  while (processed < max) {
    const job = await queue.claim();
    if (!job) break;
    try {
      const result = await gradeJob(job, deps);
      if (result.needsReview) await queue.flag(job.id, result);
      else await queue.complete(job.id, result);
    } catch (err) {
      await queue.fail(job.id, err);
    }
    processed++;
  }
  return processed;
}

/**
 * Build the real production deps: `gradeOpen` (llama-server) wrapped so it fits
 * the escalation `grade` signature, an optional bigger-model tiebreaker
 * (LLAMA_BIG_MODEL), and the code runner from `createCodeRunner()` (in-process
 * `LocalRunner` for local dev, isolated `HttpRunner` when SANDBOX=http). No model
 * is contacted and no code is run until a job is actually graded.
 */
export function wireDefaults(): WorkerDeps {
  const bigModel = process.env.LLAMA_BIG_MODEL;

  // Grade with the client chosen for `opts.skill` when `client` is omitted:
  // that routes each skill to its `grader_model` (stronger-judge tier, DESIGN §7)
  // or the pinned default. Pass an explicit client for the fixed big-model tiebreak.
  const wrap =
    (client?: LlamaClient) =>
    async (opts: GradeOpts): Promise<EscalationGrade> => {
      const skill = opts.skill as LoadedSkill;
      const r = await gradeOpen(
        { skill, answer: opts.answer, calibration: opts.calibration },
        client ?? clientForSkill(skill),
      );
      if (!r.graded) {
        // Model unusable/offline → borderline so escalation/human-review kicks in.
        return { verdict: "borderline", feedback: r.reason };
      }
      return { verdict: r.aggregate.verdict, score: r.aggregate.score, feedback: r.feedback };
    };

  const grade = wrap();
  const bigGrade = bigModel ? wrap(new LlamaClient({ model: bigModel })) : undefined;
  const runner = createCodeRunner();
  return { grade, bigGrade, run: (opts) => runner.run(opts) };
}
