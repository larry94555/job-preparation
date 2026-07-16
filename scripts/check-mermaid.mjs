#!/usr/bin/env node
// Lightweight structural lint for ```mermaid blocks in lesson material. NOT a full
// parser — it catches the gross authoring mistakes (empty block, unknown diagram
// type) fast and with no dependencies. The real check is the client rendering the
// SVG (which degrades to showing the raw source on a parse error). Usage:
//   node scripts/check-mermaid.mjs            # all topics
//   node scripts/check-mermaid.mjs <slug>     # one topic
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const TOPICS = join(process.cwd(), "topics");
// Recognized mermaid v11 diagram openers (first non-blank, non-directive line).
const KINDS =
  /^(flowchart|graph|sequenceDiagram|stateDiagram(-v2)?|classDiagram|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph|quadrantChart|requirementDiagram|sankey-beta|xychart-beta|block-beta|C4Context)\b/;

const filter = process.argv[2];
let blocks = 0;
let bad = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith(".md")) checkFile(p);
  }
}

function checkFile(path) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const rel = path.slice(process.cwd().length + 1).replace(/\\/g, "/");
  for (let i = 0; i < lines.length; i++) {
    if (!/^```\s*mermaid\s*$/.test(lines[i])) continue;
    const start = i + 1;
    const code = [];
    i++;
    while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
    blocks++;
    const body = code.join("\n").trim();
    // First meaningful line = the diagram declaration (skip blanks + %% directives).
    const first = body
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s && !s.startsWith("%%")) ?? "";
    let problem = "";
    if (!body) problem = "empty mermaid block";
    else if (!KINDS.test(first)) problem = `unrecognized diagram type: "${first.slice(0, 48)}"`;
    if (problem) {
      bad++;
      console.log(`✗ ${rel}:${start} — ${problem}`);
    }
  }
}

const root = filter ? join(TOPICS, filter) : TOPICS;
walk(root);
console.log(`\n${blocks} mermaid block(s) checked, ${bad} problem(s).`);
process.exit(bad ? 1 : 0);
