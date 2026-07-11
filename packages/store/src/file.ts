import { join } from "node:path";
import { listKeys, readProgress, writeProgress } from "./file-io.js";
import type { ProgressStore } from "./types.js";

/**
 * Process-global per-key update chains. Keyed by absolute-ish
 * `<baseDir>\0<userId>\0<topicId>` so that EVERY FileProgressStore instance in
 * this process serializes on the same key — the web app builds a fresh store per
 * request (`createStore()`), so an instance-level lock would not coordinate
 * concurrent requests. A module-level map does. The file store is single-node by
 * construction, so a process-global in-process lock is a complete guarantee.
 */
const updateChains = new Map<string, Promise<void>>();

/**
 * File-backed ProgressStore. Scopes each user to a subdirectory
 * <baseDir>/<userId>/, storing one <topicId>.json per topic. Uses the shared
 * synchronous file-io helpers under async method signatures.
 *
 * This is the zero-dependency default path used by the local lesson runner.
 */
export class FileProgressStore implements ProgressStore {
  private readonly baseDir: string;

  constructor(baseDir = ".progress") {
    this.baseDir = baseDir;
  }

  private userDir(userId: string): string {
    return join(this.baseDir, userId);
  }

  async get(userId: string, topicId: string): Promise<unknown | null> {
    return readProgress(this.userDir(userId), topicId);
  }

  async set(userId: string, topicId: string, data: unknown): Promise<void> {
    writeProgress(this.userDir(userId), topicId, data);
  }

  async list(userId: string): Promise<{ topicId: string; data: unknown }[]> {
    const dir = this.userDir(userId);
    const out: { topicId: string; data: unknown }[] = [];
    for (const topicId of listKeys(dir)) {
      out.push({ topicId, data: readProgress(dir, topicId) });
    }
    return out;
  }

  async update(
    userId: string,
    topicId: string,
    mutator: (prev: unknown | null) => unknown,
  ): Promise<unknown> {
    const key = `${this.baseDir}::${userId}::${topicId}`;
    const prior = updateChains.get(key) ?? Promise.resolve();
    let result: unknown;
    const run = prior.then(async () => {
      const cur = await this.get(userId, topicId);
      result = mutator(cur);
      await this.set(userId, topicId, result);
    });
    // Chain the NEXT waiter off a non-throwing tail so one failed update doesn't
    // wedge the key; drop the entry once this run is the tail (bounds the map).
    const tail = run.catch(() => {});
    updateChains.set(key, tail);
    try {
      await run;
      return result;
    } finally {
      if (updateChains.get(key) === tail) updateChains.delete(key);
    }
  }
}
