export function cohenKappa(a: boolean[], b: boolean[]): number {
  const n = a.length;
  let agree = 0;
  let aTrue = 0;
  let bTrue = 0;
  for (let i = 0; i < n; i++) {
    if (a[i] === b[i]) agree++;
    if (a[i]) aTrue++;
    if (b[i]) bTrue++;
  }
  const po = agree / n;
  const pTrue = (aTrue / n) * (bTrue / n);
  const pFalse = ((n - aTrue) / n) * ((n - bTrue) / n);
  const pe = pTrue + pFalse;
  if (pe === 1) return 1;
  return (po - pe) / (1 - pe);
}
