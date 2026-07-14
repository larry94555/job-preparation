import type { LoadedSkill } from "@job-prep/engine";
import type { CalibrationSet } from "@job-prep/schema";
import { type Aggregated, aggregateChecks } from "./aggregate.js";
import { type ChatMessage, LlamaClient } from "./llama.js";
import { getModelConfig, resolveGrader } from "./model-config.js";

/**
 * Pick the judge client for a skill.
 *
 * A skill that declares `grader_model` is opting into the STRONGER (secondary)
 * judge tier. When `model_configuration.yaml` is present it is the source of
 * truth: such a skill grades with the configured `secondary` model (or the
 * `primary` if the secondary tier is disabled), and every other skill grades
 * with the configured `primary`. When no config file exists we fall back to the
 * legacy behavior — the skill's literal `grader_model`, else the env default
 * (`LLM_MODEL`). Base URL always comes from env (`LLM_BASE_URL`).
 *
 * Clients are cached by model name so a sweep reuses one connection per judge.
 */
const judgeCache = new Map<string, LlamaClient>();
export function clientForSkill(skill: { frontmatter?: { grader_model?: string } }): LlamaClient {
  const wantsSecondary = Boolean(skill.frontmatter?.grader_model);
  const cfg = getModelConfig();
  let model: string | undefined;
  let baseUrl: string | undefined;
  if (cfg) {
    // Resolve the active backend + tiers. A single-model backend (e.g. Oracle
    // llama-server) reports secondary=null, so every skill uses the one model.
    const g = resolveGrader(cfg);
    model = wantsSecondary && g.secondary ? g.secondary : g.primary;
    baseUrl = g.baseUrl;
  } else {
    // Legacy (no config): literal grader_model, else env default.
    model = skill.frontmatter?.grader_model;
  }
  // Cache per (baseUrl, model): the backend can differ between environments.
  const key = `${baseUrl ?? ""}::${model ?? "__default__"}`;
  let c = judgeCache.get(key);
  if (!c) {
    c = new LlamaClient({ ...(model ? { model } : {}), ...(baseUrl ? { baseUrl } : {}) });
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
        "\n\nThe reference key (when provided) is CONTEXT for what is correct, not a checklist the answer must exhaust: credit the answer for the points it does address, and do NOT mark it down for omitting points that belong to a different sub-question or are outside what was asked. A blatantly wrong, off-topic, or internally incorrect answer still fails." +
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
  // Pick a CONTRASTIVE pair (one pass + one fail) rather than the first two
  // cases: a weak 8B judge grades far more reliably when it can see both sides
  // of the boundary, not just two positive examples. Falls back to the first
  // two when a set lacks one polarity.
  const pickExemplars = (cases: CalibrationSet["cases"]): CalibrationSet["cases"] => {
    const pass = cases.find((c) => c.expect.verdict === "pass");
    const fail = cases.find((c) => c.expect.verdict !== "pass");
    return pass && fail ? [pass, fail] : cases.slice(0, 2);
  };
  for (const c of pickExemplars(calibration?.cases ?? [])) {
    // Exemplars demonstrate the answer→checks mapping; they do NOT repeat the
    // reference key. Repeating it in every exemplar tripled the prompt and made
    // the 8B emit non-JSON. The key belongs only with the answer being graded.
    messages.push({ role: "user", content: userMessage([], c.answer, evidence) });
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

  let parsed = parseJsonLoose(raw);
  if (!parsed || typeof parsed.checks !== "object" || parsed.checks === null) {
    // The 8B intermittently wraps the JSON in prose or emits a stray token. The
    // backend is deterministic (temp 0, greedy), so retrying the SAME prompt just
    // reproduces the bad output — instead re-ask CORRECTIVELY: append the failed
    // reply and an instruction to emit only JSON. The changed prompt yields
    // different greedy output and recovers almost all of these. Helps production
    // grading too, not just the meta-eval gate.
    try {
      const retry = await client.chatJson([
        ...messages,
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            'That was not valid JSON. Reply with ONLY the JSON object — {"checks": { ... }, "feedback": "..."} — and nothing else.',
        },
      ]);
      parsed = parseJsonLoose(retry);
    } catch {
      /* fall through to the NOGRADE return below */
    }
  }
  if (!parsed || typeof parsed.checks !== "object" || parsed.checks === null) {
    return { graded: false, offline: false, reason: "model output was not usable JSON" };
  }

  const checks: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(parsed.checks)) checks[k] = v === true || v === "true";
  const aggregate = aggregateChecks(checks, skill.frontmatter.gates);
  return { graded: true, checks, feedback: String(parsed.feedback ?? ""), aggregate };
}
