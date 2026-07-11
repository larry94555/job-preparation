import "server-only";
import { allowedModels, getModelConfig, resolveModels } from "@job-prep/evaluator";
import type { ModelEntry } from "@job-prep/schema";

/** A tier's current pick, its selectable options, and whether it's changeable. */
export interface TierView {
  selected: string | null;
  options: ModelEntry[];
  /** A single option (or none) ⇒ not changeable; the UI just displays it. */
  locked: boolean;
}

export interface ModelConfigView {
  secondaryAllowed: boolean;
  catalog: ModelEntry[];
  primary: TierView;
  secondary: TierView & { enabled: boolean };
}

/** Build the UI/API view of the model config, or null if none is configured. */
export function modelConfigView(): ModelConfigView | null {
  const cfg = getModelConfig();
  if (!cfg) return null;
  const { primary, secondary } = resolveModels(cfg);
  const primaryOptions = allowedModels(cfg, "primary");
  const secondaryOptions = allowedModels(cfg, "secondary");
  return {
    secondaryAllowed: cfg.secondary_model_allowed,
    catalog: cfg.models,
    primary: {
      selected: primary,
      options: primaryOptions,
      locked: primaryOptions.length <= 1,
    },
    secondary: {
      enabled: cfg.secondary_model_allowed,
      selected: secondary,
      options: secondaryOptions,
      locked: secondaryOptions.length <= 1,
    },
  };
}
