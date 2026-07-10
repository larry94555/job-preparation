/**
 * A paged KV-block allocator over a fixed pool of same-size blocks.
 *
 * TODO:
 *   - constructor(blockSize, numBlocks): start with blocks 0..numBlocks-1 all free.
 *   - freeBlocks(): how many blocks are currently free.
 *   - allocate(numTokens): need = ceil(numTokens / blockSize). If need > free count, return null.
 *       Otherwise remove `need` block indices from the free pool and return them.
 *   - free(blockIds): return those indices to the free pool.
 *   Two live allocations must never contain the same block index.
 */
export class PagedKVAllocator {
  constructor(blockSize: number, numBlocks: number) {
    throw new Error("not implemented");
  }

  freeBlocks(): number {
    throw new Error("not implemented");
  }

  allocate(numTokens: number): number[] | null {
    throw new Error("not implemented");
  }

  free(blockIds: number[]): void {
    throw new Error("not implemented");
  }
}
