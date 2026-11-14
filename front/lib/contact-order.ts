// Urutan tampilan tetap; jangan ikuti urutan baris database yang berubah setelah update.
const contactKindOrder = ["email", "instagram", "whatsapp", "address"];

function rank(kind: unknown) {
  const index = contactKindOrder.indexOf(typeof kind === "string" ? kind : "");
  return index === -1 ? contactKindOrder.length : index;
}

export function sortContactRows<T extends Record<string, unknown>>(rows: T[]): T[] {
  return [...rows].sort((a, b) => rank(a.kind) - rank(b.kind) || String(a.kind).localeCompare(String(b.kind)));
}
