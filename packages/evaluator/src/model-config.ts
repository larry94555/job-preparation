import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { type ModelConfig, ModelConfig as ModelConfigSchema, type ModelEntry, type ModelRole } from "@job-prep/schema";
import YAML from "yaml";

/**
 * Load, resolve, and persist `model_configuration.yaml` (see the schema in
 * `@job-prep/schema`). This is the single source of truth for WHICH local model
 * fills each grader tier; the grader (`clientForSkill`, the worker) reads it, and
 * the `/models` UI writes the `selection` back through `saveModelSelection`.
 *
 * Everything degrades gracefully: if the file is missing or invalid, the loader
 * returns `null` and callers fall back to their legacy env-based behavior, so the
 * existing zero-config setup keeps working unchanged.
 */

/** Absolute path to the config file (override with MODEL_CONFIG_PATH). */
export function modelConfigPath(): string {
  return resolve(process.env.MODEL_CONFIG_PATH ?? "model_configuration.yaml");
}

// Parse cache keyed by path+mtime so a running worker/gate picks up a UI edit on
// the next call without re-parsing the file every grade.
let cache: { path: string; mtimeMs: number; config: ModelConfig } | null = null;

/** Read + validate the model config, or null if absent/unreadable/invalid. */
export function getModelConfig(path: string = modelConfigPath()): ModelConfig | null {
  if (!existsSync(path)) return null;
  try {
    const { mtimeMs } = statSync(path);
    if (cache && cache.path === path && cache.mtimeMs === mtimeMs) return cache.config;
    const parsed = ModelConfigSchema.safeParse(YAML.parse(readFileSync(path, "utf8")));
    if (!parsed.success) return null;
    cache = { path, mtimeMs, config: parsed.data };
    return parsed.data;
  } catch {
    return null;
  }
}

/** The allowed catalog entries eligible for a tier. */
export function allowedModels(cfg: ModelConfig, role: ModelRole): ModelEntry[] {
  return cfg.models.filter((m) => m.status === "allowed" && m.roles.includes(role));
}

export interface ResolvedModels {
  /** The model id every skill grades with by default. */
  primary: string;
  /** The stronger judge, or null when the secondary tier is disabled/empty. */
  secondary: string | null;
}

/**
 * Resolve the effective (primary, secondary) model ids from a config, honoring
 * `secondary_model_allowed` and falling back to the first allowed model for a
 * tier if the recorded selection is missing or no longer allowed.
 */
export function resolveModels(cfg: ModelConfig): ResolvedModels {
  const primAllowed = allowedModels(cfg, "primary").map((m) => m.id);
  const primary = primAllowed.includes(cfg.selection.primary)
    ? cfg.selection.primary
    : (primAllowed[0] ?? cfg.selection.primary);

  let secondary: string | null = null;
  if (cfg.secondary_model_allowed) {
    const secAllowed = allowedModels(cfg, "secondary").map((m) => m.id);
    const sel = cfg.selection.secondary;
    secondary = sel && secAllowed.includes(sel) ? sel : (secAllowed[0] ?? null);
  }
  return { primary, secondary };
}

/**
 * Persist a new tier selection, validating each pick against the allowed catalog,
 * and preserving the file's comments/formatting (edits the YAML document in
 * place). Returns the reloaded config. Throws on an invalid selection.
 */
export function saveModelSelection(
  sel: { primary?: string; secondary?: string },
  path: string = modelConfigPath(),
): ModelConfig {
  const cfg = getModelConfig(path);
  if (!cfg) throw new Error(`no valid model configuration at ${path}`);
  const doc = YAML.parseDocument(readFileSync(path, "utf8"));

  if (sel.primary !== undefined) {
    if (!allowedModels(cfg, "primary").some((m) => m.id === sel.primary)) {
      throw new Error(`"${sel.primary}" is not an allowed primary model`);
    }
    doc.setIn(["selection", "primary"], sel.primary);
  }
  if (sel.secondary !== undefined) {
    if (!cfg.secondary_model_allowed) {
      throw new Error("the secondary model is disabled (secondary_model_allowed: false)");
    }
    if (!allowedModels(cfg, "secondary").some((m) => m.id === sel.secondary)) {
      throw new Error(`"${sel.secondary}" is not an allowed secondary model`);
    }
    doc.setIn(["selection", "secondary"], sel.secondary);
  }

  writeFileSync(path, String(doc));
  cache = null; // force re-read on next get
  return getModelConfig(path)!;
}
