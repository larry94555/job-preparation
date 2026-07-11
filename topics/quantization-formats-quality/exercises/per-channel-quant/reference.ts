export function quantizePerChannel(matrix: number[][]): { codes: number[][]; scales: number[] } {
  const rows = matrix.length;
  const cols = rows === 0 ? 0 : matrix[0].length;
  const scales: number[] = new Array(cols).fill(1);

  for (let c = 0; c < cols; c++) {
    let maxAbs = 0;
    for (let r = 0; r < rows; r++) {
      const a = Math.abs(matrix[r][c]);
      if (a > maxAbs) maxAbs = a;
    }
    // All-zeros column guard: keep scale 1 to avoid divide-by-zero.
    scales[c] = maxAbs === 0 ? 1 : maxAbs / 127;
  }

  const codes: number[][] = matrix.map((row) =>
    row.map((v, c) => {
      const q = Math.round(v / scales[c]);
      return Math.max(-127, Math.min(127, q));
    }),
  );

  return { codes, scales };
}
