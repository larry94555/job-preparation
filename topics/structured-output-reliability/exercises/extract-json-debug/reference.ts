// Reference fix — the one-char change is indexOf('}') -> lastIndexOf('}') so the
// slice ends at the OUTERMOST closing brace, capturing nested objects and
// ignoring trailing prose. (Kept out of the repo's starter; used only to
// sandbox-verify the exercise.)
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("no JSON object found in text");
  }
  const slice = text.slice(start, end + 1);
  return JSON.parse(slice);
}
