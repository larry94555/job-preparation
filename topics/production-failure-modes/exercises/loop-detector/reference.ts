export function isStuck(actions: string[], k: number): boolean {
  if (actions.length < k) return false;
  const tail = actions.slice(actions.length - k);
  const first = tail[0];
  return tail.every((a) => a === first);
}
