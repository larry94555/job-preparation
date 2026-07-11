export function repairToolArgs(raw: string, numberKeys: string[]): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  for (const key of numberKeys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
      obj[key] = Number(v);
    }
  }
  return obj;
}
