export function blockTable(seqLens: number[], blockSize: number): number[][] {
  let next = 0;
  const table: number[][] = [];
  for (const len of seqLens) {
    const need = Math.ceil(len / blockSize);
    const blocks: number[] = [];
    for (let i = 0; i < need; i++) blocks.push(next++);
    table.push(blocks);
  }
  return table;
}
