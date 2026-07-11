import type { LoadedSkill } from "@job-prep/engine";
import type { CalibrationSet } from "@job-prep/schema";
import { type Aggregated, aggregateChecks } from "./aggregate.js";
import { type ChatMessage, LlamaClient } from "./llama.js";
import { getModelConfig, resolveModels } from "./model-config.js";

/**
 * Pick the judge client for a skill.
 *
 * A skill that declares `grader_model` is opting into the STRONGER (secondary)
 * judge tier. When `model_configuration.yaml` is present it is the source of
 * truth: such a skill grades with the configured `secondary` model (or the
 * `primary` if the secondary tier is disabled), and every other skill grades
 * with the configured `primary`. When no config file exists we fall back to the
 * legacy behavior — the skill's literal `grader_model`, else the env default
 * (`LLAMA_MODEL`). Base URL always comes from env (`LLAMA_BASE_URL`).
 *
 * Clients are cached by model name so a sweep reuses one connection per judge.
 */
const judgeCache = new Map<string, LlamaClient>();
export function clientForSkill(skill: { frontmatter?: { grader_model?: string } }): LlamaClient {
  const wantsSecondary = Boolean(skill.frontmatter?.grader_model);
  const cfg = getModelConfig();
  let model: string | undefined;
  if (cfg) {
    const { primary, secondary } = resolveModels(cfg);
    model = wantsSecondary && secondary ? secondary : primary;
  } else {
    // Legacy (no config): literal grader_model, else env default.
    model = skill.frontmatter?.grader_model;
  }
  const key = model ?? "__default__";
  let c = judgeCache.get(key);
  if (!c) {
    c = new LlamaClient(model ? { model } : {});
    judgeCache.set(key, c);
  }
  return c;
}

export interface GradeInput {
  skill: LoadedSkill;
  answer: string;
  referencePoints?: string[];
  calibration?: CalibrationSet;
  /** Extra context for the grader (e.g. code test/static signals). */
  evidence?: string;
}

export interface GradedOk {
  graded: true;
  checks: Record<string, boolean>;
  feedback: string;
  aggregate: Aggregated;
}
export interface GradedFail {
  graded: false;
  offline: boolean; // true = model unreachable; false = model replied but unusable
  reason: string;
}
export type GradeResult = GradedOk | GradedFail;

function parseJsonLoose(s: string): { checks?: Record<string, unknown>; feedback?: unknown } | null {
  try {
    return JSON.parse(s);
  } catch {
    const m = /\{[\s\S]*\}/.exec(s);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* ignore */
      }
    }
    return null;
  }
}

function userMessage(referencePoints: string[], answer: string, evidence?: string): string {
  let s = "";
  if (referencePoints.length) {
    s += "Reference key (ground truth):\n" + referencePoints.map((r) => "- " + r).join("\n") + "\n\n";
  }
  if (evidence) s += "Evidence:\n" + evidence + "\n\n";
  s += 'Answer to grade:\n"""\n' + answer + '\n"""';
  return s;
}

/**
 * Grade an open-ended answer (essay / code concepts) with the local model,
 * driven by the eval skill. The model returns booleans; `aggregateChecks` turns
 * them into a score/verdict deterministically.
 */
export async function gradeOpen(input: GradeInput, client: LlamaClient = new LlamaClient()): Promise<GradeResult> {
  const { skill, answer, referencePoints = [], calibration, evidence } = input;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        skill.body +
        '\n\nRespond with ONLY a JSON object: {"checks": {"<name>": true|false, ...}, "feedback": "one sentence"}.',
    },
  ];

  // Up to 2 calibration exemplars as few-shot anchors for the weak model.
  // Feedback is synthesized from the expected verdict so the model learns to
  // write its own one-liner (not parrot a fixed placeholder).
  const exemplarFeedback = (v: string): string =>
    v === "pass"
      ? "Correct, specific, and covers the key points."
      : v === "borderline"
        ? "On the right track but missing specifics or a key point."
        : "Misses key points or contains an incorrect claim.";
  for (const c of (calibration?.cases ?? []).slice(0, 2)) {
    messages.push({ role: "user", content: userMessage(referencePoints, c.answer, evidence) });
    messages.push({
      role: "assistant",
      content: JSON.stringify({ checks: c.expect.checks ?? {}, feedback: exemplarFeedback(c.expect.verdict) }),
    });
  }
  messages.push({ role: "user", content: userMessage(referencePoints, answer, evidence) });

  let raw: string;
  try {
    raw = await client.chatJson(messages);
  } catch (e) {
    return { graded: false, offline: true, reason: (e as Error).message };
  }

  const parsed = parseJsonLoose(raw);
  if (!parsed || typeof parsed.checks !== "object" || parsed.checks === null) {
    return { graded: false, offline: false, reason: "model output was not usable JSON" };
  }

  const checks: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(parsed.checks)) checks[k] = v === true || v === "true";
  const aggregate = aggregateChecks(checks, skill.frontmatter.gates);
  return { graded: true, checks, feedback: String(parsed.feedback ?? ""), aggregate };
}
