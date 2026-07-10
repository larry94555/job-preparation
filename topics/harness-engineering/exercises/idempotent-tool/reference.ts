export function runIdempotent(key: string, run: () => string, done: Map<string, string>): string {
  if (done.has(key)) return done.get(key)!;
  const result = run();
  done.set(key, result);
  return result;
}
