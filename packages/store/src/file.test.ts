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

test("FileProgressStore.update serializes concurrent read-modify-write across SEPARATE instances (no lost updates)", async () => {
  const dir = mkdtempSync(join(tmpdir(), "job-prep-store-"));
  try {
    const user = "local";

    // Each update goes through a FRESHLY constructed store instance — mirroring
    // the web app, which calls createStore() per request. The lock must be
    // process-global (not instance-level) or these would clobber each other and
    // the final array would be far shorter than N.
    const N = 50;
    await Promise.all(
      Array.from({ length: N }, (_, i) =>
        new FileProgressStore(dir).update(user, "alpha", (prev) => {
          const cur = (prev as { items?: number[] } | null)?.items ?? [];
          return { items: [...cur, i] };
        }),
      ),
    );

    const saved = (await new FileProgressStore(dir).get(user, "alpha")) as { items: number[] };
    assert.equal(saved.items.length, N, "every concurrent update must be preserved");
    // All indices 0..N-1 present exactly once.
    assert.deepEqual([...saved.items].sort((a, b) => a - b), Array.from({ length: N }, (_, i) => i));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("FileProgressStore.update creates the row on first write and returns the value", async () => {
  const dir = mkdtempSync(join(tmpdir(), "job-prep-store-"));
  try {
    const store = new FileProgressStore(dir);
    assert.equal(await store.get("u", "t"), null);
    const returned = await store.update("u", "t", (prev) => {
      assert.equal(prev, null);
      return { index: 1 };
    });
    assert.deepEqual(returned, { index: 1 });
    assert.deepEqual(await store.get("u", "t"), { index: 1 });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
