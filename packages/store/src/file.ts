import { join } from "node:path";
import { listKeys, readProgress, writeProgress } from "./file-io.js";
import type { ProgressStore } from "./types.js";

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
}
