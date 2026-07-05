import { z } from "zod";

/** Shape of `topic.yaml`. Projected into the `topics` table on import. */
export const Topic = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "topic id must be kebab-case"),
  title: z.string().min(1),
  description: z.string().default(""),
  /** Fraction of weighted points needed to pass, 0..1. */
  pass_threshold: z.number().min(0).max(1).default(0.7),
  /** tag -> weight multiplier used by the adaptive scheduler and scoring. */
  tag_weights: z.record(z.string(), z.number()).default({}),
});

export type Topic = z.infer<typeof Topic>;
