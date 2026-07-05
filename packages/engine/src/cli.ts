#!/usr/bin/env tsx
import { resolve } from "node:path";
import { loadAllTopics } from "./loader.js";

/**
 * Content validation CLI.
 *
 *   tsx packages/engine/src/cli.ts validate [topicsDir]
 *
 * Exits non-zero if any topic has validation issues, so it can gate CI.
 */
function main(argv: string[]): number {
  const [command, dirArg] = argv;

  if (command !== "validate") {
    console.error("usage: cli validate [topicsDir]");
    return 2;
  }

  const topicsDir = resolve(dirArg ?? "topics");
  const { topics, ok } = loadAllTopics(topicsDir);

  if (topics.length === 0) {
    console.error(`No topics found under ${topicsDir}`);
    return 1;
  }

  let totalIssues = 0;
  for (const t of topics) {
    const name = t.topic?.id ?? t.dir;
    if (t.issues.length === 0) {
      console.log(
        `✓ ${name}  (${t.questions.length} questions, ${t.skills.length} skills, ${t.calibration.length} calibration sets)`,
      );
      continue;
    }
    console.log(`✗ ${name}`);
    for (const issue of t.issues) {
      totalIssues++;
      const where = issue.file ? `${issue.file}: ` : "";
      console.log(`    ${where}${issue.message}`);
    }
  }

  console.log("");
  if (ok) {
    console.log(`All ${topics.length} topic(s) valid.`);
    return 0;
  }
  console.log(`${totalIssues} issue(s) across ${topics.length} topic(s).`);
  return 1;
}

process.exit(main(process.argv.slice(2)));
