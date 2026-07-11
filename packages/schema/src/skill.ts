import { z } from "zod";

/**
 * Frontmatter of an eval-skill Markdown file (`skills/<id>.md`). The Markdown
 * body holds the rubric/instructions given to the grading model.
 */
export const EvalSkillFrontmatter = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "skill id must be kebab-case"),
  /** Which question kind this skill grades. */
  applies_to: z.enum(["essay", "long_form", "code"]),
  /** Name of the Zod schema the engine enforces on the model's JSON output. */
  output_schema: z.string().min(1),
  model_hint: z.string().optional(),
  /**
   * Check names that act as scoring gates: if a gate check is false, the verdict
   * is capped one level down (pass→borderline, borderline→fail). Defaults to any
   * check whose name contains "correct".
   */
  gates: z.array(z.string()).optional(),
});

export type EvalSkillFrontmatter = z.infer<typeof EvalSkillFrontmatter>;

/**
 * A single labeled exemplar in a skill's calibration set. The meta-eval gate
 * checks that the grader reproduces `expect` for each `answer`.
 */
export const CalibrationCase = z.object({
  answer: z.string().min(1),
  expect: z.object({
    verdict: z.enum(["pass", "borderline", "fail"]),
    /** Optional per-check expectations (check name -> expected boolean). */
    checks: z.record(z.string(), z.boolean()).optional(),
  }),
});

/** Shape of `calibration/<skill-id>.yaml`. */
export const CalibrationSet = z.object({
  skill: z.string().min(1),
  cases: z.array(CalibrationCase).min(1, "a calibration set needs at least one case"),
});

export type CalibrationCase = z.infer<typeof CalibrationCase>;
export type CalibrationSet = z.infer<typeof CalibrationSet>;
