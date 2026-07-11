import type { Verdict } from "./aggregate.js";
import type { CalibrationSet } from "@job-prep/schema";

/**
 * Confidence escalation at runtime (DESIGN §7.4): a weak single-slot grader can
 * disagree with itself run-to-run. Rather than surface a silent coin-flip, we
 * grade with self-consistency best-of-N (temp 0), take the majority verdict, and
 * escalate on disagreement — to a bigger model, then to human review. Users
 * always see "graded" vs "flagged for review", never an unstable score.
 *
 * `grade`/`bigGrade` are INJECTED (they wrap the real evaluator in production),
 * so this whole policy is unit-testable with stub graders and no model.
 */

/**
 * The normalized grade signal the escalation policy reasons over. Named
 * `EscalationGrade` to avoid colliding with the evaluator's richer `GradeResult`
 * (which is a graded/offline union); the worker maps between the two.
 */
export interface EscalationGrade {
  verdict: Verdict;
  score?: number;
  feedback?: string;
}

export interface GradeOpts {
  skill: unknown;
  answer: string;
  calibration?: CalibrationSet;
}

export interface EscalationArgs {
  grade: (opts: GradeOpts) => Promise<EscalationGrade>;
  /** Optional bigger-model tiebreaker; called once on a tie/no-majority. */
  bigGrade?: (opts: GradeOpts) => Promise<EscalationGrade>;
  skill: unknown;
  answer: string;
  calibration?: CalibrationSet;
  /** Self-consistency sample count (default 3). */
  samples?: number;
}

export interface EscalationResult {
  verdict: Verdict;
  score?: number;
  feedback?: string;
  needsReview: boolean;
  trail: string[];
}

/** Verdict with the most votes (plurality) and its count; ties resolved by ORDER. */
function plurality(verdicts: Verdict[]): { verdict: Verdict; count: number } {
  const counts = new Map<Verdict, number>();
  for (const v of verdicts) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best: Verdict = verdicts[0];
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return { verdict: best, count: bestCount };
}

/**
 * Grade with self-consistency best-of-N + escalation.
 *
 * 1. Sample `grade` `samples` times (default 3).
 * 2. If one verdict has a clear majority (> half), return it (needsReview:false).
 * 3. On a tie / no majority, if `bigGrade` is provided, use its single verdict.
 * 4. If still no confidence, return the plurality verdict with needsReview:true.
 */
export async function gradeWithEscalation(args: EscalationArgs): Promise<EscalationResult> {
  const { grade, bigGrade, skill, answer, calibration, samples = 3 } = args;
  const trail: string[] = [];

  const results: EscalationGrade[] = [];
  for (let i = 0; i < samples; i++) {
    results.push(await grade({ skill, answer, calibration }));
  }
  const verdicts = results.map((r) => r.verdict);
  trail.push(`best-of-${samples}: [${verdicts.join(", ")}]`);

  const { verdict: majVerdict, count } = plurality(verdicts);
  // A clear majority is strictly more than half the samples.
  if (count > samples / 2) {
    trail.push(`clear majority: ${majVerdict} (${count}/${samples})`);
    const chosen = results.find((r) => r.verdict === majVerdict)!;
    return {
      verdict: majVerdict,
      score: chosen.score,
      feedback: chosen.feedback,
      needsReview: false,
      trail,
    };
  }

  trail.push(`no clear majority (plurality ${majVerdict} ${count}/${samples})`);

  // Tie / no majority → escalate to the bigger model, if available.
  if (bigGrade) {
    const big = await bigGrade({ skill, answer, calibration });
    trail.push(`escalated to big model: ${big.verdict}`);
    return {
      verdict: big.verdict,
      score: big.score,
      feedback: big.feedback,
      needsReview: false,
      trail,
    };
  }

  // Still no confidence → flag for human review with the plurality verdict.
  trail.push("no big model available → flagged for human review");
  const chosen = results.find((r) => r.verdict === majVerdict)!;
  return {
    verdict: majVerdict,
    score: chosen.score,
    feedback: chosen.feedback,
    needsReview: true,
    trail,
  };
}
