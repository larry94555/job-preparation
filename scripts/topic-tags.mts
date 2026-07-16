// Prints the data needed to re-section a topic by subtopic: which tags each
// lesson teaches, the deterministic (MC/text) question pool per tag (an
// assessment can draw `count` items from tags whose pool >= count), and the
// current sections. Usage:  npx tsx scripts/topic-tags.mts <topic-slug>
import { FileContentSource } from "../packages/store/src/index.ts";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: npx tsx scripts/topic-tags.mts <topic-slug>");
  process.exit(1);
}
const topics = await new FileContentSource("topics").loadTopics();
const t = topics.find((x) => x.topic?.id === slug);
if (!t) {
  console.error("topic not found:", slug);
  process.exit(1);
}
const qById = new Map(t.questions.map((q) => [q.id, q]));

console.log("=== lessons, and the tags each one TEACHES (from its check/apply questions) ===");
console.log("(a lesson with no tags is a roadmap/expert/frontier page — assign it to the most relevant section)");
for (const lsn of t.lessons) {
  const tags = new Set<string>();
  for (const seg of lsn.segments) {
    const id = (seg as { check?: string; apply?: string }).check ?? (seg as { apply?: string }).apply;
    const q = id ? qById.get(id) : undefined;
    if (q) for (const tg of q.tags) tags.add(tg);
  }
  console.log(`  ${lsn.id.padEnd(30)} -> [${[...tags].join(", ")}]`);
}

console.log("\n=== assessment pool: deterministic (MC/text) question count per tag ===");
console.log("(a section's assessment `from_tags` must be tags its lessons teach, and the combined pool must be >= count)");
const det = t.questions.filter((q) => q.type === "multiple_choice" || q.type === "text_input");
const by: Record<string, number> = {};
for (const q of det) for (const tg of q.tags) by[tg] = (by[tg] ?? 0) + 1;
for (const [tg, n] of Object.entries(by).sort((a, b) => b[1] - a[1])) console.log(`  ${tg}: ${n}`);

console.log("\n=== current sections ===");
for (const s of t.sections) {
  console.log(
    `  ${s.id}: [${s.lessons.join(", ")}]  assess from_tags=[${s.assessment.from_tags.join(
      ", ",
    )}] count=${s.assessment.count}`,
  );
}
