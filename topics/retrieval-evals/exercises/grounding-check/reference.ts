export function isGrounded(claim: string, sources: string[]): boolean {
  const normalize = (s: string): string => s.toLowerCase().trim().replace(/\s+/g, " ");
  const needle = normalize(claim);
  return sources.some((src) => normalize(src).includes(needle));
}
