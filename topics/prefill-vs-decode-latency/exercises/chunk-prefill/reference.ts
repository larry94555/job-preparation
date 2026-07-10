export function planChunks(promptTokens: number, chunkSize: number): number[] {
  const chunks: number[] = [];
  let remaining = promptTokens;
  while (remaining > 0) {
    const take = Math.min(chunkSize, remaining);
    chunks.push(take);
    remaining -= take;
  }
  return chunks;
}
