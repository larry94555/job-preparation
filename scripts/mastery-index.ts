#!/usr/bin/env tsx
/**
 * Topic Mastery Index (Goals §8/§9). Reads every `topics/<t>/expert-surface.md`,
 * parses its machine-readable coverage line
 *     <!-- coverage: items=N covered=X partial=Y gap=Z -->
 * and reports per-topic weighted coverage (covered=1, partial=0.5, gap=0) plus a
 * repo-wide index. Run: `npm run mastery`.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "topics");
const topics = readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

type Track = "core" | "agentic";

interface Row {
  topic: string;
  track: Track;
  items: number;
  covered: number;
  partial: number;
  gap: number;
  pct: number | null;
}

const re = /<!--\s*coverage:\s*items=(\d+)\s+covered=(\d+)\s+partial=(\d+)\s+gap=(\d+)\s*-->/;
// The topic's track lives in topic.yaml (`track: agentic`, default `core`). Read
// it directly so the index can report the two curricula as independent sub-totals.
const trackRe = /^track:\s*(\w+)/m;
const rows: Row[] = [];

function trackOf(topic: string): Track {
  const path = join(root, topic, "topic.yaml");
  if (!existsSync(path)) return "core";
  const m = readFileSync(path, "utf8").match(trackRe);
  return m?.[1] === "agentic" ? "agentic" : "core";
}

for (const topic of topics) {
  const track = trackOf(topic);
  const path = join(root, topic, "expert-surface.md");
  if (!existsSync(path)) {
    rows.push({ topic, track, items: 0, covered: 0, partial: 0, gap: 0, pct: null });
    continue;
  }
  const m = readFileSync(path, "utf8").match(re);
  if (!m) {
    rows.push({ topic, track, items: 0, covered: 0, partial: 0, gap: 0, pct: null });
    continue;
  }
  const [items, covered, partial, gap] = m.slice(1, 5).map(Number);
  const pct = items ? (covered + 0.5 * partial) / items : 0;
  rows.push({ topic, track, items, covered, partial, gap, pct });
}

const withSurface = rows.filter((r) => r.pct !== null);
const missing = rows.filter((r) => r.pct === null);

const pad = (s: string, n: number) => s.padEnd(n);
console.log(pad("topic", 40) + pad("items", 7) + pad("cov", 5) + pad("part", 6) + pad("gap", 5) + "coverage");
console.log("-".repeat(70));
for (const r of rows) {
  const cov = r.pct === null ? "— (no surface)" : `${Math.round(r.pct * 100)}%`;
  console.log(pad(r.topic, 40) + pad(String(r.items), 7) + pad(String(r.covered), 5) + pad(String(r.partial), 6) + pad(String(r.gap), 5) + cov);
}
console.log("-".repeat(70));

const totItems = withSurface.reduce((a, r) => a + r.items, 0);
const totWeighted = withSurface.reduce((a, r) => a + r.covered + 0.5 * r.partial, 0);
const tmi = totItems ? totWeighted / totItems : 0;
console.log(
  `Topics with an Expert Surface: ${withSurface.length}/${topics.length}` +
    (missing.length ? ` (missing: ${missing.map((m) => m.topic).join(", ")})` : ""),
);
console.log(`Enumerated surface items: ${totItems} · weighted covered: ${totWeighted.toFixed(1)}`);
console.log(`Topic Mastery Index (weighted coverage across all surfaced topics): ${Math.round(tmi * 100)}%`);

// Per-track sub-totals: the core curriculum and the independent agentic track are
// scored separately so each reads as its own complete program (roadmap §"Mastery
// Index gains an Agentic-track sub-total").
console.log("");
for (const track of ["core", "agentic"] as const) {
  const trackRows = withSurface.filter((r) => r.track === track);
  if (!trackRows.length) continue;
  const ti = trackRows.reduce((a, r) => a + r.items, 0);
  const tw = trackRows.reduce((a, r) => a + r.covered + 0.5 * r.partial, 0);
  const pct = ti ? tw / ti : 0;
  const label = track === "core" ? "Core curriculum" : "Agentic track";
  console.log(
    `${pad(label + " sub-index", 30)} ${trackRows.length} topics · ${ti} items · ${Math.round(pct * 100)}%`,
  );
}
