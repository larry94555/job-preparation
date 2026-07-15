import "server-only";
import { LlamaClient } from "@job-prep/evaluator";

/**
 * Optional LLM paraphrasing of question PROMPTS, so a lesson doesn't read exactly
 * the same every time. Deliberately conservative:
 *  - It rewords ONLY the prompt wording — never options, answer keys, or lesson
 *    material — so grading and correctness are untouched.
 *  - It preserves every technical term / code / backticked text verbatim.
 *  - It is CACHED and warmed in the BACKGROUND: a cache miss returns the original
 *    text immediately (no stall) and kicks off one batched LLM call that fills the
 *    cache for subsequent requests. Best-effort — if the LLM is unavailable the
 *    original wording is used.
 *
 * Toggle with PARAPHRASE=off. Cache is per-process (single web container); it is
 * keyed so lessons vary per session and the sample varies per process.
 */

/** Paraphrasing is on unless explicitly disabled. */
export function paraphraseEnabled(): boolean {
  return (process.env.PARAPHRASE ?? "on").toLowerCase() !== "off";
}

// key -> (questionId -> reworded prompt). Absent key = not warmed yet.
const cache = new Map<string, Map<string, string>>();
const inflight = new Set<string>();

/** One batched LLM call rewording several prompts; returns id -> reworded (falls
 *  back to the original text per item on any failure). */
async function paraphraseBatch(
  items: { id: string; text: string }[],
): Promise<Map<string, string>> {
  const out = new Map(items.map((i) => [i.id, i.text]));
  if (!items.length) return out;
  // A line-delimited (NOT JSON) contract on purpose: these prompts frequently
  // contain double-quotes (e.g. a status like "tool_use"), which the model emits
  // UNESCAPED inside a JSON string and breaks JSON.parse — so JSON mode would
  // silently fall back to originals for exactly the technical prompts we most
  // want to vary. One line per prompt, `id|||reworded`, survives any quotes/code.
  const sys =
    "You reword quiz/check question prompts to keep them fresh, WITHOUT changing their meaning, " +
    "scope, or difficulty, and WITHOUT changing the answer. Hard rules: preserve EXACTLY every " +
    "technical term, identifier, code, and anything inside `backticks` or quotes; keep it concise " +
    "(about the same length); only vary the phrasing. Output ONE line per prompt in the form " +
    "`<id>|||<reworded prompt>`, using the same ids you were given, and NOTHING else — no JSON, " +
    "no numbering, no commentary. The reworded text may contain any characters (quotes, code) freely.";
  const user = "Reword each prompt:\n" + items.map((i) => `${i.id}|||${i.text}`).join("\n");
  try {
    const raw = await new LlamaClient().chatText([
      { role: "system", content: sys },
      { role: "user", content: user },
    ]);
    for (const line of raw.split("\n")) {
      const sep = line.indexOf("|||");
      if (sep < 0) continue;
      const id = line.slice(0, sep).trim();
      const text = line.slice(sep + 3).trim();
      if (out.has(id) && text) out.set(id, text);
    }
  } catch {
    /* keep originals */
  }
  return out;
}

/**
 * Return the reworded prompts for `key` if they're cached; otherwise return an
 * empty map (callers use the originals) and warm the cache in the background so
 * later requests get the reworded versions. Never blocks, never throws.
 */
export function paraphrasedPrompts(
  key: string,
  questions: { id: string; prompt: string }[],
): Map<string, string> {
  if (!paraphraseEnabled() || questions.length === 0) return new Map();
  const hit = cache.get(key);
  if (hit) return hit;
  if (!inflight.has(key)) {
    inflight.add(key);
    void paraphraseBatch(questions.map((q) => ({ id: q.id, text: q.prompt })))
      .then((map) => cache.set(key, map))
      .finally(() => inflight.delete(key));
  }
  return new Map();
}
