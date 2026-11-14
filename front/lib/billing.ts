export type PaymentMethod = "full" | "dp";

export function initialBill(priceIdr: number, method: PaymentMethod, dpPercent: number | null) {
  if (!Number.isSafeInteger(priceIdr) || priceIdr < 0) throw new Error("Harga tidak sah.");
  if (method === "full") return { subtotalIdr: priceIdr, remainingIdr: 0 };
  if (!Number.isInteger(dpPercent) || dpPercent === null || dpPercent < 1 || dpPercent > 99) {
    throw new Error("Persentase DP tidak sah.");
  }
  const subtotalIdr = Math.round((priceIdr * dpPercent) / 100);
  return { subtotalIdr, remainingIdr: priceIdr - subtotalIdr };
}

export function nextUniqueCode(occupied: ReadonlySet<number>): number | null {
  for (let code = 1; code <= 999; code += 1) {
    if (!occupied.has(code)) return code;
  }
  return null;
}
