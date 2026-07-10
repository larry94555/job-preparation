export interface Span {
  text: string;
  trusted: boolean;
}

export function fence(spans: Span[]): string {
  return spans
    .map((s) => (s.trusted ? s.text : `<untrusted>${s.text}</untrusted>`))
    .join(" ");
}
