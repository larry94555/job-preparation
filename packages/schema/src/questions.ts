import { z } from "zod";

/**
 * Shared fields on every question. Spread into each concrete question schema.
 * Kept as a plain shape (not a ZodObject) so members stay pure ZodObjects and
 * can participate in `z.discriminatedUnion` (refinements would break that).
 */
const base = {
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "id must be kebab-case (a-z, 0-9, hyphen)"),
  tags: z.array(z.string()).default([]),
  difficulty: z.number().int().min(1).max(5).optional(),
};

/* ------------------------------- multiple choice ------------------------------ */

export const McqOption = z.object({
  text: z.string().min(1),
  correct: z.boolean().default(false),
});

export const MultipleChoiceQuestion = z.object({
  ...base,
  type: z.literal("multiple_choice"),
  prompt: z.string().min(1),
  shuffle_options: z.boolean().default(true),
  options: z.array(McqOption).min(2, "need at least two options"),
  explanation: z.string().optional(),
});

/* --------------------------------- text input --------------------------------- */

/** A parameter generator. Extend with more generator kinds over time. */
export const ParamGenerator = z.object({
  random_int: z.tuple([z.number().int(), z.number().int()]),
});

export const TextInputQuestion = z.object({
  ...base,
  type: z.literal("text_input"),
  prompt: z.string().min(1),
  /** name -> generator; values substituted into `{{name}}` placeholders. */
  parameters: z.record(z.string(), ParamGenerator).optional(),
  answer: z.object({
    equals: z.string().optional(),
    regex: z.string().optional(),
    numeric_tolerance: z.number().optional(),
    normalize: z.boolean().default(true),
  }),
});

/* ----------------------------------- essay ------------------------------------ */
/** `length: long` represents the "long-form / prompt / write-up" question type. */

export const EssayQuestion = z.object({
  ...base,
  type: z.literal("essay"),
  length: z.enum(["short", "long"]).default("short"),
  prompt: z.string().min(1),
  eval_skill: z.string().min(1),
  reference_points: z.array(z.string()).default([]),
});

/* ------------------------------ programming code ------------------------------ */

export const CodeQuestion = z.object({
  ...base,
  type: z.literal("code"),
  language: z.string().min(1),
  prompt: z.string().min(1),
  starter_file: z.string().optional(),
  test_command: z.string().min(1),
  runner_image: z.string().min(1),
  timeout_sec: z.number().int().positive().default(30),
  eval_skill: z.string().optional(),
  concept_checks: z
    .object({
      must_use: z.array(z.string()).default([]),
      avoid_antipattern: z.array(z.string()).default([]),
    })
    .optional(),
});

/* --------------------------------- the union ---------------------------------- */

export const Question = z.discriminatedUnion("type", [
  MultipleChoiceQuestion,
  TextInputQuestion,
  EssayQuestion,
  CodeQuestion,
]);

/** A question file is a YAML list of questions. */
export const QuestionFile = z.array(Question);

export type McqOption = z.infer<typeof McqOption>;
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestion>;
export type TextInputQuestion = z.infer<typeof TextInputQuestion>;
export type EssayQuestion = z.infer<typeof EssayQuestion>;
export type CodeQuestion = z.infer<typeof CodeQuestion>;
export type Question = z.infer<typeof Question>;
export type QuestionType = Question["type"];
