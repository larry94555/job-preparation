import { z } from "zod";

const kebab = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "must be kebab-case");

/**
 * A lesson segment is exactly one of:
 *   { present: <material-heading-slug> }   — show a piece of material
 *   { check:   <question-id> }             — a formative check (never gates)
 *   { apply:   <question-id> }             — an application task
 */
export const LessonSegment = z.union([
  z.object({ present: z.string().min(1) }).strict(),
  z.object({ check: z.string().min(1) }).strict(),
  z.object({ apply: z.string().min(1) }).strict(),
]);

/** `lessons/<id>.yaml` — the ordered present→check→apply flow of one lesson. */
export const LessonManifest = z.object({
  id: kebab,
  title: z.string().min(1),
  /** Markdown file (relative to `lessons/`) holding the presentation material. */
  material: z.string().min(1),
  segments: z.array(LessonSegment).min(1),
});

/** How a section assessment draws its summative items from the topic's bank. */
export const SectionAssessment = z.object({
  title: z.string().min(1),
  /** Draw items whose tags intersect these (must be taught in the section). */
  from_tags: z.array(z.string()).default([]),
  /** …and/or these explicit question ids (must be taught in the section). */
  from_ids: z.array(z.string()).default([]),
  count: z.number().int().positive(),
  pass_threshold: z.number().min(0).max(1).optional(),
});

export const Section = z.object({
  id: kebab,
  title: z.string().min(1),
  lessons: z.array(z.string()).min(1),
  assessment: SectionAssessment,
});

/** `sections.yaml` — ordered sections; presence makes a topic a "lesson", not just an item bank. */
export const SectionsFile = z.object({
  sections: z.array(Section).min(1),
});

export type LessonSegment = z.infer<typeof LessonSegment>;
export type LessonManifest = z.infer<typeof LessonManifest>;
export type SectionAssessment = z.infer<typeof SectionAssessment>;
export type Section = z.infer<typeof Section>;
export type SectionsFile = z.infer<typeof SectionsFile>;
