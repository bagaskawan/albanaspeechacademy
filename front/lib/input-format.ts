export const MAX_RUPIAH_DIGITS = 12;
export const MAX_PHONE_DIGITS = 14;

/** Teks bebas -> string digit Rupiah: buang bagian setelah koma, buang non-digit, buang nol di depan, potong 12 digit. "" bila tidak ada digit. */
export function rupiahDigits(text: string): string {
  const beforeComma = text.split(",")[0] ?? "";
  const digits = beforeComma.replace(/\D/g, "");
  if (!digits) return "";
  const trimmed = digits.replace(/^0+/, "") || "0";
  return trimmed.slice(0, MAX_RUPIAH_DIGITS);
}

/** "1500000" -> "1.500.000"; "" -> "". */
export function formatThousands(digits: string): string {
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Teks bebas -> maksimal 2 digit, tanpa nol di depan. */
export function percentDigits(text: string): string {
  const digits = text.replace(/\D/g, "").replace(/^0+/, "");
  return digits.slice(0, 2);
}

/** Teks bebas -> nomor Indonesia berformat 4-4-sisa: +62/62 -> 0, awalan 8 -> 08, maksimal 13 digit. */
export function formatPhone(text: string): string {
  let digits = text.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) digits = `0${digits.slice(2)}`;
  else if (digits.startsWith("8")) digits = `0${digits}`;
  digits = digits.slice(0, MAX_PHONE_DIGITS);
  const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8)].filter(Boolean);
  return parts.join("-");
}

/** Posisi kursor di `formatted` sesudah digit ke-`digitsBefore`; 0 bila digitsBefore = 0. */
export function caretFromDigits(formatted: string, digitsBefore: number): number {
  if (digitsBefore <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) {
      seen += 1;
      if (seen === digitsBefore) return i + 1;
    }
  }
  return formatted.length;
}
