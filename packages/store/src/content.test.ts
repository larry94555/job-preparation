import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { contentHash } from "./content-hash.js";
import { FileContentSource } from "./content.js";

// Resolve the repo's topics/ dir relative to this test file so it works from any cwd.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const topicsDir = resolve(repoRoot, "topics");

test("contentHash is stable across key reorderings and changes when data changes", () => {
  const a = { topic: { id: "x", title: "T" }, questions: [1, 2, 3] };
  const b = { questions: [1, 2, 3], topic: { title: "T", id: "x" } };

  // Same data, different key order → same hash.
  assert.equal(contentHash(a), contentHash(b));

  // Changed data → different hash.
  const c = { topic: { id: "x", title: "T" }, questions: [1, 2, 4] };
  assert.notEqual(contentHash(a), contentHash(c));

  // Array order is significant → different hash.
  const d = { topic: { id: "x", title: "T" }, questions: [3, 2, 1] };
  assert.notEqual(contentHash(a), contentHash(d));
});

test("FileContentSource().loadTopics() returns 36 topics with non-empty ids", async () => {
  const topics = await new FileContentSource(topicsDir).loadTopics();
  assert.equal(topics.length, 36);
  for (const t of topics) {
    const id = t.topic?.id;
    assert.ok(id && id.length > 0, `topic in ${t.dir} has a non-empty id`);
  }
});
