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

export function parseRupiahInput(value: string): number | null {
  const stripped = value.trim().replace(/^rp\s*/i, "").replace(/[\s.]/g, "");
  if (!/^\d+$/.test(stripped)) return null;
  const amount = Number(stripped);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 1_000_000_000) return null;
  return amount;
}

export function paymentBalance(
  totalIdr: number,
  amountsIdr: readonly number[],
): { paidIdr: number; balanceIdr: number; state: "none" | "short" | "exact" | "over" } {
  const paidIdr = amountsIdr.reduce((sum, amount) => sum + amount, 0);
  const balanceIdr = totalIdr - paidIdr;
  if (amountsIdr.length === 0) return { paidIdr: 0, balanceIdr, state: "none" };
  if (balanceIdr > 0) return { paidIdr, balanceIdr, state: "short" };
  if (balanceIdr < 0) return { paidIdr, balanceIdr, state: "over" };
  return { paidIdr, balanceIdr: 0, state: "exact" };
}
