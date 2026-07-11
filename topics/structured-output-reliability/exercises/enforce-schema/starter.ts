/**
 * Enforce a JSON schema as a validated output contract.
 *
 * Structured/constrained decoding gives you a shape; enforcement turns that shape
 * into a *contract* by checking types, presence, and allowed values. Implement
 * `enforce(obj, schema)` that validates `obj` against a list of field rules and
 * collects every violation.
 *
 * For each field in `schema`:
 *   - If `field.required` and `field.key` is missing from `obj` → push `"<key>: missing"`.
 *   - If the key IS present:
 *       - If `typeof obj[key] !== field.type` → push `"<key>: expected <type>"`.
 *       - If `field.enum` is set and `obj[key]` is not one of its values → push `"<key>: not in enum"`.
 *   - An optional field that is missing is NOT an error.
 *
 * Collect all errors (do not stop at the first). `valid` is `errors.length === 0`.
 */
export interface Field {
  key: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  enum?: string[];
}

export function enforce(obj: Record<string, unknown>, schema: Field[]): { valid: boolean; errors: string[] } {
  throw new Error("not implemented");
}
