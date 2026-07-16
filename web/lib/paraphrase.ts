import "server-only";
import { LlamaClient } from "@job-prep/evaluator";

/**
 * Optional LLM paraphrasing so a lesson doesn't read exactly the same every time.
 * It rewords two kinds of text — question PROMPTS and lesson MATERIAL prose — but
 * never options, answer keys, code, or technical terms, so grading and correctness
 * are untouched. Deliberately conservative and quality-gated:
 *
 *  1. GENERATE: one call rewords a batch, told to produce clean, natural, fluent
 *     English and to preserve verbatim everything in `backticks`, "quotes", and
 *     any <html tags> (so inline code / emphasis / links survive).
 *  2. REVIEW: a second call judges each rewrite for smoothness + fidelity and
 *     REJECTS any that isn't clean — rejected items fall back to the original.
 *
 * Both calls use the quote-proof `<id>|||text` line format (NOT JSON): these
 * prompts routinely contain double-quotes, which the model emits unescaped inside
 * JSON strings and breaks JSON.parse. Results are CACHED and warmed in the
 * BACKGROUND: a cache miss returns the original text immediately (no stall) and
 * kicks off the batched calls that fill the cache for subsequent requests.
 *
 * Two independent toggles, each defaulting on (legacy `PARAPHRASE` is the shared
 * fallback): PARAPHRASE_LESSONS (material + formative-check prompts) and
 * PARAPHRASE_TESTS (section-assessment prompts). Callers decide which items to
 * submit based on these flags; this module just rewords whatever it's given.
 */

const on = (v: string | undefined): boolean => (v ?? "on").toLowerCase() !== "off";

/** Reword lesson material + formative check/apply prompts (default on). */
export function paraphraseLessonsEnabled(): boolean {
  return on(process.env.PARAPHRASE_LESSONS ?? process.env.PARAPHRASE);
}
/** Reword section-assessment ("test") prompts (default on). */
export function paraphraseTestsEnabled(): boolean {
  return on(process.env.PARAPHRASE_TESTS ?? process.env.PARAPHRASE);
}
/** True if either paraphrase surface is enabled. */
export function paraphraseEnabled(): boolean {
  return paraphraseLessonsEnabled() || paraphraseTestsEnabled();
}

// key -> (itemId -> reworded text). Absent key = not warmed yet.
const cache = new Map<string, Map<string, string>>();
const inflight = new Set<string>();

const GEN_SYS =
  "You reword lesson text (a quiz question prompt or a paragraph of teaching prose) to keep it " +
  "fresh, WITHOUT changing its meaning, scope, difficulty, or (for questions) the answer. Write " +
  "CLEAN, natural, fluent, grammatical English that a careful human writer would be happy to " +
  "publish: vary the sentence structure and word choice, but stay crisp — no awkward phrasing, no " +
  "filler, no padding, roughly the same length. HARD RULES: preserve EXACTLY, character for " +
  "character, everything inside `backticks`, everything inside \"quotes\", and every <html tag> and " +
  "its attributes (e.g. <code>…</code>, <em>, <strong>, <a href=…>) — reword only the plain words " +
  "around them; never invent or drop information. Output ONE line per item in the form " +
  "`<id>|||<reworded text>`, reusing the ids you were given, and NOTHING else — no JSON, no " +
  "numbering, no commentary, and no line breaks inside a rewrite.";

const REVIEW_SYS =
  "You are a strict copy editor. For each ORIGINAL/REWRITE pair, decide whether the REWRITE is " +
  "publishable: clean, natural, fluent, grammatical English that reads at least as smoothly as the " +
  "original, with the SAME meaning and every technical term, `code`, \"quote\", and <html tag> " +
  "preserved. FAIL it if it is awkward, clunky, ungrammatical, garbled, truncated, repetitive, " +
  "changes the meaning, or alters any code/term/tag. When in doubt, FAIL. Output ONE line per item " +
  "in the form `<id>|||PASS` or `<id>|||FAIL`, and nothing else.";

interface Item {
  id: string;
  text: string;
}

/** Parse the `<id>|||value` line protocol into an id→value map. */
function parseLines(raw: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of raw.split("\n")) {
    const sep = line.indexOf("|||");
    if (sep < 0) continue;
    const id = line.slice(0, sep).trim();
    const value = line.slice(sep + 3).trim();
    if (id) out.set(id, value);
  }
  return out;
}

/** One GENERATE call: returns id -> reworded text (line protocol). */
async function generate(client: LlamaClient, batch: Item[]): Promise<Map<string, string>> {
  const user = "Reword each item:\n" + batch.map((i) => `${i.id}|||${i.text}`).join("\n");
  const raw = await client.chatText([
    { role: "system", content: GEN_SYS },
    { role: "user", content: user },
  ]);
  return parseLines(raw);
}

/** One REVIEW call: returns the set of ids whose rewrite is clean enough to keep. */
async function review(
  client: LlamaClient,
  pairs: { id: string; original: string; reworded: string }[],
): Promise<Set<string>> {
  const user =
    "Judge each rewrite:\n" +
    pairs
      .map((p) => `id: ${p.id}\nORIGINAL: ${p.original}\nREWRITE: ${p.reworded}\n---`)
      .join("\n");
  const raw = await client.chatText([
    { role: "system", content: REVIEW_SYS },
    { role: "user", content: user },
  ]);
  const verdicts = parseLines(raw);
  const pass = new Set<string>();
  for (const [id, v] of verdicts) if (v.toUpperCase().startsWith("PASS")) pass.add(id);
  return pass;
}

/**
 * Generate → review a batch of items, returning id -> text where each value is
 * the reworded text ONLY if it changed AND passed review; otherwise the original.
 * Chunked (material can be many paragraphs) with a per-chunk try/catch so one bad
 * chunk degrades to originals without losing the rest. Best-effort throughout.
 */
async function paraphraseBatch(items: Item[]): Promise<Map<string, string>> {
  const out = new Map(items.map((i) => [i.id, i.text]));
  if (!items.length) return out;
  // Roomier token budget than the grader default — a chunk of prose rewrites is
  // longer than a single JSON grade.
  const client = new LlamaClient({ maxTokens: 2048 });
  const CHUNK = 6;
  for (let start = 0; start < items.length; start += CHUNK) {
    const batch = items.slice(start, start + CHUNK);
    try {
      const gen = await generate(client, batch);
      // Only review items the model actually changed.
      const changed = batch
        .map((i) => ({ id: i.id, original: i.text, reworded: gen.get(i.id) ?? "" }))
        .filter((c) => c.reworded && c.reworded !== c.original);
      if (!changed.length) continue;
      const pass = await review(client, changed);
      for (const c of changed) if (pass.has(c.id)) out.set(c.id, c.reworded);
    } catch {
      /* keep originals for this chunk */
    }
  }
  return out;
}

/**
 * Return the reworded text for `key` if it's cached; otherwise return an empty
 * map (callers use the originals) and warm the cache in the background so later
 * requests get the reworded versions. Never blocks, never throws. Scope gating is
 * the caller's job (it decides which items to submit); passing no items is a no-op.
 */
export function paraphrasedPrompts(key: string, items: Item[]): Map<string, string> {
  if (items.length === 0) return new Map();
  const hit = cache.get(key);
  if (hit) return hit;
  if (!inflight.has(key)) {
    inflight.add(key);
    void paraphraseBatch(items)
      .then((map) => cache.set(key, map))
      .finally(() => inflight.delete(key));
  }
  return new Map();
}
