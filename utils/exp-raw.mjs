// Print the RAW model output for a specific calibration case, to see WHY it
// fails to parse. Usage:
//   node --import tsx --import ./utils/load-secrets.mjs utils/exp-raw.mjs <skillId> <caseIndex>
import { resolve } from "node:path";
import { loadAllTopics } from "@job-prep/engine";
import { clientForSkill, getModelConfig, resolveGrader } from "@job-prep/evaluator";

const [skillId, idxArg] = process.argv.slice(2);
const idx = Number(idxArg ?? 3);
const { topics } = loadAllTopics(resolve("topics"));
let found;
for (const t of topics)
  for (const cal of t.calibration)
    if (cal.skill === skillId) found = { t, cal };
const { t, cal } = found;
const skill = t.skills.find((s) => s.frontmatter.id === skillId);
const judge = clientForSkill(skill);

const refPts =
  skill.frontmatter.applies_to === "essay"
    ? [...new Set(t.questions.flatMap((q) => (q.type === "essay" && q.eval_skill === skillId ? (q.reference_points ?? []) : [])))].slice(0, 4)
    : [];

const um = (rp, ans) =>
  (rp.length ? "Reference key (ground truth):\n" + rp.map((r) => "- " + r).join("\n") + "\n\n" : "") +
  'Answer to grade:\n"""\n' + ans + '\n"""';
const fb = (v) => (v === "pass" ? "Correct, specific, and covers the key points." : "Misses key points or contains an incorrect claim.");
const pass = cal.cases.find((c) => c.expect.verdict === "pass");
const fail = cal.cases.find((c) => c.expect.verdict !== "pass");
const target = cal.cases[idx];

const messages = [
  { role: "system", content: skill.body + '\n\nRespond with ONLY a JSON object: {"checks": {"<name>": true|false, ...}, "feedback": "one sentence"}.' },
  { role: "user", content: um([], pass.answer) },
  { role: "assistant", content: JSON.stringify({ checks: pass.expect.checks ?? {}, feedback: fb("pass") }) },
  { role: "user", content: um([], fail.answer) },
  { role: "assistant", content: JSON.stringify({ checks: fail.expect.checks ?? {}, feedback: fb("fail") }) },
  { role: "user", content: um(refPts, target.answer) },
];

const raw = await judge.chatJson(messages);
console.log("=== RAW OUTPUT (len " + raw.length + ", maxTokens " + judge.maxTokens + ") ===");
console.log(raw);
console.log("=== END ===");
