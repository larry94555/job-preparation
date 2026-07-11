/**
 * Runnable grading worker (DESIGN §8). In production a pool of these long-running
 * processes drains the shared queue, each owning its own llama-server slot. Here
 * it polls the queue selected by env (QUEUE=memory|db), grades whatever it finds,
 * and sleeps briefly when the queue is empty.
 *
 *   npm run worker
 */
import { createJobQueue } from "@job-prep/store";
import { runWorker, wireDefaults } from "../src/worker.js";

const IDLE_MS = 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main(): Promise<void> {
  const queue = createJobQueue();
  const deps = wireDefaults();
  const once = process.argv.includes("--once");
  console.log(`[worker] started (queue=${process.env.QUEUE ?? "memory"})`);

  for (;;) {
    const n = await runWorker(queue, deps, {});
    if (n > 0) console.log(`[worker] graded ${n} job(s)`);
    if (once) break;
    await sleep(IDLE_MS);
  }
}

main().catch((err) => {
  console.error("[worker] fatal:", err);
  process.exit(1);
});
