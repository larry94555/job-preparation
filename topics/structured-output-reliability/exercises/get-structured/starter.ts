// Exercise: implement getStructured with validation, a BOUNDED repair loop, and a fallback.
//
// A `schema` here is anything with a `safeParse(value)` method returning either
// { success: true, data } or { success: false, error } (e.g. a Zod schema).

export interface Schema<T> {
  safeParse(value: unknown): { success: true; data: T } | { success: false; error: Error };
}

export interface GetStructuredOptions<T> {
  /** Maximum number of REPAIR attempts after the initial call. */
  maxRepairs: number;
  /** Returned when validation still fails after all repairs. */
  fallback: T;
}

/**
 * `callModel(repairError?)` returns the model's raw text. When called with a
 * `repairError`, the implementation should ask the model to fix its previous output.
 *
 * TODO:
 *   1. Call the model, parse JSON, validate with schema.safeParse.
 *   2. On failure, feed the validation error back via callModel, up to maxRepairs times.
 *   3. If still invalid, return opts.fallback. Never loop unboundedly.
 */
export async function getStructured<T>(
  callModel: (repairError?: string) => Promise<string>,
  schema: Schema<T>,
  opts: GetStructuredOptions<T>,
): Promise<T> {
  throw new Error("not implemented");
}
