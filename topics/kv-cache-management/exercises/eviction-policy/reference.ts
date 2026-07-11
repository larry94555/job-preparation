export interface Seq {
  id: string;
  blocks: number;
  lastUsed: number;
}

export function planAdmission(capacity: number, live: Seq[], need: number): { admit: boolean; evict: string[] } {
  if (need > capacity) return { admit: false, evict: [] };
  const used = live.reduce((a, s) => a + s.blocks, 0);
  let free = capacity - used;
  if (free >= need) return { admit: true, evict: [] };
  const byLru = [...live].sort((a, b) => a.lastUsed - b.lastUsed);
  const evict: string[] = [];
  for (const s of byLru) {
    if (free >= need) break;
    evict.push(s.id);
    free += s.blocks;
  }
  return free >= need ? { admit: true, evict } : { admit: false, evict: [] };
}
