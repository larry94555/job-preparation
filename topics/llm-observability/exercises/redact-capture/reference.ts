export function redact(obj: unknown, sensitiveKeys: string[]): unknown {
  const sensitive = new Set(sensitiveKeys);

  function walk(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(walk);
    }
    if (value !== null && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        out[key] = sensitive.has(key) ? "[REDACTED]" : walk(val);
      }
      return out;
    }
    return value;
  }

  return walk(obj);
}
