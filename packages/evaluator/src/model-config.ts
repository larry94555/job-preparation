import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type BackendEntry,
  type DeployEnv,
  type ModelConfig,
  ModelConfig as ModelConfigSchema,
  type ModelEntry,
  type ModelRole,
} from "@job-prep/schema";
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

// ---- Backends (where the model is served) --------------------------------

/** The current deployment environment (DEPLOY_ENV=hosted ⇒ hosted, else local). */
export function currentDeployEnv(): DeployEnv {
  return process.env.DEPLOY_ENV === "hosted" ? "hosted" : "local";
}

/** Backends eligible in the given environment. */
export function eligibleBackends(cfg: ModelConfig, env: DeployEnv): BackendEntry[] {
  return (cfg.backends ?? []).filter((b) => b.environments.includes(env));
}

/**
 * Resolve the active backend. In `hosted` the hosted-eligible backend is forced
 * (the `backend` selection is ignored) — so a deploy always uses the single
 * intended service. In `local` the `backend` selection wins when it's eligible,
 * else the first eligible backend. Returns null when no backends are configured
 * (callers then fall back to the LLAMA_BASE_URL env / client default).
 */
export function resolveBackend(
  cfg: ModelConfig,
  env: DeployEnv = currentDeployEnv(),
): BackendEntry | null {
  const eligible = eligibleBackends(cfg, env);
  if (eligible.length === 0) return null;
  if (env === "hosted") {
    // Forced: prefer the recorded selection only if it is itself hosted-eligible.
    return eligible.find((b) => b.id === cfg.backend) ?? eligible[0];
  }
  return eligible.find((b) => b.id === cfg.backend) ?? eligible[0];
}

export interface ResolvedGrader {
  /** Deployment environment this was resolved for. */
  env: DeployEnv;
  /** The active backend, or null if none configured. */
  backend: BackendEntry | null;
  /** OpenAI-compatible base URL (LLAMA_BASE_URL overrides the backend's). */
  baseUrl: string | undefined;
  /** Effective primary model id. */
  primary: string;
  /** Effective secondary model id, or null (disabled, or single-model backend). */
  secondary: string | null;
}

/**
 * Fully resolve how grading should talk to a model: the active backend, the base
 * URL, and the effective primary/secondary model ids. A `single_model` backend
 * (e.g. llama-server hosting one GGUF, as on Oracle Cloud) forces the secondary
 * tier off — there is only one model to grade with.
 */
export function resolveGrader(
  cfg: ModelConfig,
  env: DeployEnv = currentDeployEnv(),
): ResolvedGrader {
  const backend = resolveBackend(cfg, env);
  const { primary, secondary } = resolveModels(cfg);
  const baseUrl = process.env.LLAMA_BASE_URL ?? backend?.base_url;
  return {
    env,
    backend,
    baseUrl,
    primary,
    secondary: backend?.single_model ? null : secondary,
  };
}

/**
 * Persist a new backend selection (local/dev only). Rejects an ineligible backend
 * and refuses to write in a hosted environment (the hosted backend is fixed at
 * deploy time). Preserves comments. Returns the reloaded config.
 */
export function saveBackendSelection(id: string, path: string = modelConfigPath()): ModelConfig {
  const cfg = getModelConfig(path);
  if (!cfg) throw new Error(`no valid model configuration at ${path}`);
  if (currentDeployEnv() === "hosted") {
    throw new Error("the backend is fixed in a hosted environment and cannot be changed here");
  }
  if (!eligibleBackends(cfg, "local").some((b) => b.id === id)) {
    throw new Error(`"${id}" is not a backend available in the local environment`);
  }
  const doc = YAML.parseDocument(readFileSync(path, "utf8"));
  doc.set("backend", id);
  writeFileSync(path, String(doc));
  cache = null;
  return getModelConfig(path)!;
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
  if (currentDeployEnv() === "hosted") {
    throw new Error("the model is fixed in a hosted environment and cannot be changed here");
  }
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
