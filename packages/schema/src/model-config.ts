import { z } from "zod";

/**
 * Contract for `model_configuration.yaml` — the human-editable catalog of local
 * open-source LLMs the grader may use, and which one currently fills each tier.
 *
 * Two tiers exist (mirroring the runtime's confidence design):
 *   - primary   — faster, less reliable; the default judge for every skill.
 *   - secondary — slower, more reliable; used for skills that opt into the
 *                 stronger judge, and as the escalation tiebreaker.
 *
 * The `/models` UI only ever changes `selection`. The catalog, each model's
 * `status` (allowed/disallowed), its eligible `roles`, and the master
 * `secondary_model_allowed` switch are file-managed (edited by whoever owns the
 * deploy). Base URL stays in env (`LLAMA_BASE_URL`); this file names models only.
 */

/** Informational hardware/footprint requirements, surfaced in the UI. */
export const ModelRequirements = z.object({
  /** Approx. system RAM needed to run the model, in GB. */
  ram_gb: z.number().nonnegative().optional(),
  /** True if a GPU is required (false ⇒ runs on CPU). */
  gpu_required: z.boolean().optional(),
  /** True if it runs on CPU/RAM only (no GPU needed). */
  cpu_only: z.boolean().optional(),
  /** Approx. disk space for the model weights, in GB. */
  disk_gb: z.number().nonnegative().optional(),
  /** Free-form extra requirements / compatibility notes. */
  notes: z.string().optional(),
});
export type ModelRequirements = z.infer<typeof ModelRequirements>;

/** Which grader tier a model is eligible to fill. */
export const ModelRole = z.enum(["primary", "secondary"]);
export type ModelRole = z.infer<typeof ModelRole>;

/** One catalog entry. `id` is the runtime identifier (the Ollama model tag). */
export const ModelEntry = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Source Hugging Face repo (GGUF), for reference / pulling. */
  huggingface: z.string().optional(),
  /** Tiers this model may be selected for. */
  roles: z.array(ModelRole).min(1),
  /** Only `allowed` models are selectable in the UI. */
  status: z.enum(["allowed", "disallowed"]),
  requirements: ModelRequirements.optional(),
});
export type ModelEntry = z.infer<typeof ModelEntry>;

export const ModelConfig = z.object({
  /** Master switch: when false, only the primary model is ever used. */
  secondary_model_allowed: z.boolean(),
  /** The currently selected model id for each tier (UI-editable). */
  selection: z.object({
    primary: z.string().min(1),
    secondary: z.string().min(1).optional(),
  }),
  /** The catalog of known models. */
  models: z.array(ModelEntry).min(1),
});
export type ModelConfig = z.infer<typeof ModelConfig>;
