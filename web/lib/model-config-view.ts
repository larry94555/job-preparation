import "server-only";
import {
  allowedModels,
  currentDeployEnv,
  eligibleBackends,
  getModelConfig,
  resolveGrader,
} from "@job-prep/evaluator";
import type { BackendEntry, DeployEnv, ModelEntry } from "@job-prep/schema";

/** A tier's current pick, its selectable options, and whether it's changeable. */
export interface TierView {
  selected: string | null;
  options: ModelEntry[];
  /** A single option (or none), or a hosted deploy ⇒ not changeable. */
  locked: boolean;
}

export interface BackendView {
  selected: string | null;
  entry: BackendEntry | null;
  options: BackendEntry[];
  locked: boolean;
}

export interface ModelConfigView {
  /** Deployment environment; in `hosted` the whole page is read-only. */
  env: DeployEnv;
  readOnly: boolean;
  backend: BackendView;
  /** Resolved base URL the grader will call (backend's, or LLM_BASE_URL). */
  baseUrl: string | null;
  /** True when the active backend hosts a single model (secondary disabled). */
  singleModel: boolean;
  secondaryAllowed: boolean;
  catalog: ModelEntry[];
  primary: TierView;
  secondary: TierView & { enabled: boolean };
}

/** Build the UI/API view of the model config, or null if none is configured. */
export function modelConfigView(): ModelConfigView | null {
  const cfg = getModelConfig();
  if (!cfg) return null;
  const env = currentDeployEnv();
  const g = resolveGrader(cfg, env);
  const hosted = env === "hosted";
  const primaryOptions = allowedModels(cfg, "primary");
  const secondaryOptions = allowedModels(cfg, "secondary");
  const eligible = eligibleBackends(cfg, env);
  const singleModel = Boolean(g.backend?.single_model);

  return {
    env,
    readOnly: hosted,
    backend: {
      selected: g.backend?.id ?? null,
      entry: g.backend,
      options: eligible,
      // Forced in hosted; also locked when there is only one local option.
      locked: hosted || eligible.length <= 1,
    },
    baseUrl: g.baseUrl ?? null,
    singleModel,
    // A single-model backend disables the secondary tier regardless of the switch.
    secondaryAllowed: cfg.secondary_model_allowed && !singleModel,
    catalog: cfg.models,
    primary: {
      selected: g.primary,
      options: primaryOptions,
      locked: hosted || primaryOptions.length <= 1,
    },
    secondary: {
      enabled: cfg.secondary_model_allowed && !singleModel,
      selected: g.secondary,
      options: secondaryOptions,
      locked: hosted || secondaryOptions.length <= 1,
    },
  };
}
