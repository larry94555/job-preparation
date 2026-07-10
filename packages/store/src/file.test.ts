import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { FileProgressStore } from "./file.js";

test("FileProgressStore round-trips set / get / list for a user", async () => {
  const dir = mkdtempSync(join(tmpdir(), "job-prep-store-"));
  try {
    const store = new FileProgressStore(dir);
    const user = "local";

    // Nothing saved yet.
    assert.equal(await store.get(user, "alpha"), null);
    assert.deepEqual(await store.list(user), []);

    // Set two topics.
    await store.set(user, "alpha", { index: 1, seed: 42 });
    await store.set(user, "beta", { index: 3, seed: 7 });

    // Get them back.
    assert.deepEqual(await store.get(user, "alpha"), { index: 1, seed: 42 });
    assert.deepEqual(await store.get(user, "beta"), { index: 3, seed: 7 });

    // List returns both.
    const listed = await store.list(user);
    assert.equal(listed.length, 2);
    const byTopic = Object.fromEntries(listed.map((e) => [e.topicId, e.data]));
    assert.deepEqual(byTopic.alpha, { index: 1, seed: 42 });
    assert.deepEqual(byTopic.beta, { index: 3, seed: 7 });

    // Users are isolated.
    assert.deepEqual(await store.list("other"), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
