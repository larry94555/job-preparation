export interface Span {
  name: string;
  tokens: number;
  children: Span[];
}

/**
 * TODO: return the total tokens in the subtree — this span's own tokens plus the rollup of each child,
 * recursively. A leaf (empty children) totals just its own tokens.
 */
export function rollupTokens(span: Span): number {
  throw new Error("not implemented");
}
