/**
 * Argument validation / repair for malformed tool-call JSON.
 *
 * A model asked to emit a tool-call argument object often wraps it in prose or
 * markdown fences ("Sure! Here are the args: ```{ ... }```"). The harness owns
 * repairing this before dispatch, rather than trusting the raw string.
 *
 * Implement `repairToolArgs(raw, numberKeys)`:
 *   - Extract the JSON object by taking the substring from the FIRST `{` to the
 *     LAST `}` and `JSON.parse` it. If there is no `{`/`}` or parse fails,
 *     return `null`.
 *   - Then for every key listed in `numberKeys` whose parsed value is a numeric
 *     STRING (e.g. "42", "3.5"), coerce it to a Number.
 *   - Return the repaired object.
 */
export function repairToolArgs(raw: string, numberKeys: string[]): Record<string, unknown> | null {
  throw new Error("not implemented");
}
