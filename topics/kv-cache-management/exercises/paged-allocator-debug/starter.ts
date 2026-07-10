/**
 * DEBUGGING EXERCISE — this allocator is BROKEN.
 *
 * Symptom reported in production: two concurrent sequences are corrupting each
 * other's KV cache. A sequence starts generating and its cached keys/values get
 * overwritten by a *different* request, producing garbage tokens. `freeBlocks()`
 * also reports the wrong count — it never seems to go down after an allocation.
 *
 * There is exactly ONE bug. Find it and fix it so that:
 *   - allocate() actually removes the blocks it hands out from the free pool,
 *   - freeBlocks() reflects the blocks in use,
 *   - two live allocations never share a block.
 *
 * Do NOT rewrite the class — make the minimal correct fix.
 */
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
    // BUG: slice() COPIES the first `need` block ids but leaves them in the pool,
    // so the very next allocate() hands the SAME blocks to another sequence.
    return this.freePool.slice(0, need);
  }

  free(blockIds: number[]): void {
    this.freePool.push(...blockIds);
  }
}
