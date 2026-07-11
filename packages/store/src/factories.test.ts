import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  createContentSource,
  createJobQueue,
  createStore,
  DbContentSource,
  DbJobQueue,
  FileContentSource,
  FileProgressStore,
  InMemoryJobQueue,
  PgProgressStore,
} from "./index.js";

// The env-selected factories are the seams the whole local-first/hosted split
// rests on. These lock the selection + the "missing DATABASE_URL" guards without
// touching a real database (constructing the pg-backed variants is lazy).

const KEYS = ["STORE", "QUEUE", "CONTENT", "DATABASE_URL", "PROGRESS_DIR"] as const;
const saved: Record<string, string | undefined> = {};
for (const k of KEYS) saved[k] = process.env[k];

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function clearEnv() {
  for (const k of KEYS) delete process.env[k];
}

test("createStore: default → file, pg needs DATABASE_URL, unknown throws", () => {
  clearEnv();
  assert.ok(createStore() instanceof FileProgressStore, "default is the file store");

  process.env.STORE = "pg";
  assert.throws(() => createStore(), /DATABASE_URL/);

  process.env.DATABASE_URL = "postgres://u:p@localhost:5432/db";
  assert.ok(createStore() instanceof PgProgressStore, "pg + DATABASE_URL builds pg store");

  clearEnv();
  process.env.STORE = "bogus";
  assert.throws(() => createStore(), /Unknown STORE/);
});

test("createJobQueue: default → in-memory, db needs DATABASE_URL, unknown throws", () => {
  clearEnv();
  assert.ok(createJobQueue() instanceof InMemoryJobQueue, "default is the in-memory queue");

  process.env.QUEUE = "db";
  assert.throws(() => createJobQueue(), /DATABASE_URL/);

  process.env.DATABASE_URL = "postgres://u:p@localhost:5432/db";
  assert.ok(createJobQueue() instanceof DbJobQueue, "db + DATABASE_URL builds db queue");

  clearEnv();
  process.env.QUEUE = "bogus";
  assert.throws(() => createJobQueue(), /Unknown QUEUE/);
});

test("createContentSource: default → file, db needs DATABASE_URL, unknown throws", () => {
  clearEnv();
  assert.ok(createContentSource() instanceof FileContentSource, "default is the file source");

  process.env.CONTENT = "db";
  assert.throws(() => createContentSource(), /DATABASE_URL/);

  process.env.DATABASE_URL = "postgres://u:p@localhost:5432/db";
  assert.ok(createContentSource() instanceof DbContentSource, "db + DATABASE_URL builds db source");

  clearEnv();
  process.env.CONTENT = "bogus";
  assert.throws(() => createContentSource(), /Unknown CONTENT/);
});
