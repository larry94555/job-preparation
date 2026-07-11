/**
 * Prompt-level fencing / provenance tagging of untrusted spans.
 *
 * You are assembling a prompt from ordered spans, each marked as trusted or
 * untrusted. Untrusted text (retrieved documents, tool output, user-supplied
 * content) must be fenced with provenance tags so the model treats it as DATA,
 * not instructions.
 *
 * TODO: assemble `spans` into one prompt string, in order.
 *   - Wrap each UNTRUSTED span's text as `<untrusted>` + text + `</untrusted>`.
 *   - Leave TRUSTED spans' text unchanged.
 *   - Join all pieces with a single space.
 *   - An empty array → "".
 */
export interface Span {
  text: string;
  trusted: boolean;
}

export function fence(spans: Span[]): string {
  throw new Error("not implemented");
}
