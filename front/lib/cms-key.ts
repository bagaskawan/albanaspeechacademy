export const NEW_RECORD_KEY = "baru";

const SEPARATOR = "~";

function encodePart(value: unknown) {
  // Pemisah kunci ikut di-encode agar nilai yang mengandung "~" tidak memecah kunci.
  return encodeURIComponent(String(value ?? "")).replaceAll("~", "%7E");
}

export function encodeCmsKey(key: Record<string, unknown>, names: string[]): string {
  if (!names.length) throw new Error("Kunci konten tidak valid.");
  return names.map((name) => encodePart(key[name])).join(SEPARATOR);
}

export function decodeCmsKey(value: string, names: string[]): Record<string, string> {
  if (!names.length) throw new Error("Kunci konten tidak valid.");
  const parts = names.length === 1 ? [value] : value.split(SEPARATOR);
  if (parts.length !== names.length) throw new Error("Kunci konten tidak valid.");
  const decoded = parts.map((part) => decodeURIComponent(part));
  return Object.fromEntries(names.map((name, index) => [name, decoded[index]]));
}
