// Per-case diagnostic: grade each calibration case of a skill and print
// verdict vs expected. Usage:
//   node --import tsx --import ./utils/load-secrets.mjs utils/diag-skill.mjs <skillId>
import { resolve } from "node:path";
import { loadAllTopics } from "@job-prep/engine";
import { clientForSkill, gradeOpen } from "@job-prep/evaluator";

const skillId = process.argv[2];
if (!skillId) {
  console.error("usage: diag-skill.mjs <skillId>");
  process.exit(2);
}

const { topics } = loadAllTopics(resolve("topics"));
for (const topic of topics) {
  for (const cal of topic.calibration) {
    if (cal.skill !== skillId) continue;
    const skill = topic.skills.find((s) => s.frontmatter.id === cal.skill);
    if (!skill) continue;
    const judge = clientForSkill(skill);
    console.log(`# ${topic.topic?.id}/${cal.skill}  (judge ${judge.model})`);
    let i = 0;
    for (const c of cal.cases) {
      const others = { ...cal, cases: cal.cases.filter((x) => x !== c) };
      const r = await gradeOpen({ skill, answer: c.answer, calibration: others }, judge);
      const got = r.graded ? r.aggregate.verdict : "NOGRADE";
      const ok = got === c.expect.verdict ? "OK " : "MISS";
      const checks = r.graded ? JSON.stringify(r.aggregate.checks ?? r.checks ?? {}) : "-";
      console.log(`  [${ok}] case ${i} expect=${c.expect.verdict} got=${got}  ${checks}`);
      i++;
    }
  }
}
