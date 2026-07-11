export interface Span {
  id: string;
  parentId: string | null;
}

export function rootOf(spans: Span[]): Record<string, string> {
  const parent = new Map<string, string | null>();
  for (const s of spans) parent.set(s.id, s.parentId);
  const root: Record<string, string> = {};
  for (const s of spans) {
    let cur = s.id;
    // Walk parentId up to the span whose parentId is null.
    while (parent.get(cur) !== null && parent.get(cur) !== undefined) {
      cur = parent.get(cur) as string;
    }
    root[s.id] = cur;
  }
  return root;
}
