import { z } from "zod";

/** Shape of `topic.yaml`. Projected into the `topics` table on import. */
export const Topic = z.object({
  id: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "topic id must be kebab-case"),
  title: z.string().min(1),
  description: z.string().default(""),
  /**
   * Which learning track this topic belongs to. "core" (default) is the original
   * AI-engineering curriculum; "agentic" is the independent "Becoming an Agentic
   * AI Engineer in 6 Months" track. The home page renders each track separately.
   */
  track: z.enum(["core", "agentic"]).default("core"),
  /** Fraction of weighted points needed to pass, 0..1. */
  pass_threshold: z.number().min(0).max(1).default(0.7),
  /** tag -> weight multiplier used by the adaptive scheduler and scoring. */
  tag_weights: z.record(z.string(), z.number()).default({}),
});

export type Topic = z.infer<typeof Topic>;
