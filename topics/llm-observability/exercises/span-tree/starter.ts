/**
 * Correlation-ID propagation over a span tree.
 *
 * A trace is a tree of spans linked by `parentId`. The ROOT span of a trace has
 * `parentId === null`; every other span points at its parent. Every span in one
 * trace shares a single root — that root id is effectively the trace/correlation
 * ID that stitches the fan-out back together.
 *
 * Implement `rootOf`: return a map from EVERY span id to the id of its root
 * ancestor. To find a span's root, walk `parentId` upward until you reach the
 * span whose `parentId` is null; that span's id is the root. A lone root maps to
 * itself. Assume the input forms valid trees (no cycles).
 */
export interface Span {
  id: string;
  parentId: string | null;
}

export function rootOf(spans: Span[]): Record<string, string> {
  throw new Error("not implemented");
}
