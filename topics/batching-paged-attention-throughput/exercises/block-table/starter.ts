/**
 * Paged KV block-table allocator: map each sequence to its KV blocks.
 *
 * Paged attention stores each sequence's KV in fixed-size blocks (like OS pages)
 * that need not be contiguous in the pool — a per-sequence block table records
 * which block ids that sequence owns. Here you build that mapping from scratch.
 *
 * Assign contiguous, non-overlapping block ids to each sequence from a single
 * running counter that starts at 0. Sequence `i` needs
 * `Math.ceil(seqLens[i] / blockSize)` blocks; give it the next that-many
 * consecutive block ids, then advance the counter. Return one array of block ids
 * per sequence, in the same order as `seqLens`.
 *
 * Example: blockTable([3, 5], 2) → [[0, 1], [2, 3, 4]]
 *   (seq0 needs ceil(3/2)=2 blocks, seq1 needs ceil(5/2)=3 blocks).
 * A length-0 sequence needs ceil(0/blockSize)=0 blocks → [].
 */
export function blockTable(seqLens: number[], blockSize: number): number[][] {
  throw new Error("not implemented");
}
