/**
 * DEBUGGING EXERCISE — this JSON extractor is BROKEN.
 *
 * Context: models often wrap their JSON in prose ("Sure! Here is the object:
 * {...}. Let me know if you need anything else."). `extractJson()` is supposed
 * to pull just the JSON object out of that reply and parse it.
 *
 * Symptom reported in production: it works on flat single-line objects, but
 * fails on ANY object that has a nested object inside it, and also fails when
 * the model adds a trailing sentence after the JSON. The parse either throws
 * or returns a truncated object that is missing its later fields — as if the
 * extractor stops reading too early.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - extractJson() returns the FULL object even when it contains nested {...},
 *   - trailing prose after the object is ignored,
 *   - flat objects keep working.
 *
 * Do NOT rewrite the function — make the minimal correct fix.
 */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  // BUG: this grabs the FIRST closing brace, so as soon as the object contains
  // a nested `{...}` the slice ends at the inner object's `}` and the outer
  // object is cut short (and trailing prose can leave the wrong `}` in range).
  const end = text.indexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("no JSON object found in text");
  }
  const slice = text.slice(start, end + 1);
  return JSON.parse(slice);
}
