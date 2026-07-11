// Reference fix — the one-line change is slice -> splice so the blocks are
// actually REMOVED from the free pool when handed out. (Kept out of the repo's
// starter; used only to sandbox-verify the exercise.)
export class PagedKVAllocator {
  private blockSize: number;
  private freePool: number[];

  constructor(blockSize: number, numBlocks: number) {
    this.blockSize = blockSize;
    this.freePool = Array.from({ length: numBlocks }, (_, i) => i);
  }

  freeBlocks(): number {
    return this.freePool.length;
  }

  allocate(numTokens: number): number[] | null {
    const need = Math.ceil(numTokens / this.blockSize);
    if (need > this.freePool.length) return null;
    // splice removes AND returns the first `need` ids, so they leave the pool.
    return this.freePool.splice(0, need);
  }

  free(blockIds: number[]): void {
    this.freePool.push(...blockIds);
  }
}
