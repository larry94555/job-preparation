// Exercise: classify a raw model response as malformed JSON, a schema violation, or valid.

export interface Schema {
  safeParse(value: unknown): { success: boolean };
}

export type FailureClass = "malformed_json" | "schema_violation" | "valid";

/**
 * TODO:
 *   1. Try to JSON.parse(raw). If it throws, return "malformed_json".
 *   2. If it parses but schema.safeParse(...).success is false, return "schema_violation".
 *   3. Otherwise return "valid".
 * Do not collapse the two failure types into one generic catch.
 */
export function classifyFailure(raw: string, schema: Schema): FailureClass {
  throw new Error("not implemented");
}
