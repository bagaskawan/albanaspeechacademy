import "server-only";
import { academyRequest } from "./academy-api";

export type ContactRow = { kind: "address" | "instagram" | "whatsapp" | "email"; value: string };

export async function readPublishedContacts(): Promise<ContactRow[]> {
  const rows = await academyRequest("contact_channels?select=kind,value&order=kind");
  if (!Array.isArray(rows)) throw new Error("Kanal kontak tidak valid.");
  return rows as ContactRow[];
}

export const ADDRESS_FALLBACK = "Tempat menyusul";

// Alamat pelaksanaan diambil dari menu Kontak, bukan dari batch. Kontak yang
// gagal dibaca tidak boleh menggagalkan halaman program atau pendaftaran.
export async function readAddressLabel(): Promise<string> {
  try {
    const rows = await readPublishedContacts();
    return rows.find((row) => row.kind === "address")?.value.trim() || ADDRESS_FALLBACK;
  } catch {
    return ADDRESS_FALLBACK;
  }
}

export function contactHref(row: ContactRow): string | undefined {
  if (row.kind === "email") return `mailto:${row.value}`;
  if (row.kind === "whatsapp") {
    const digits = row.value.replace(/\D/g, "");
    if (!digits) return undefined;
    return `https://wa.me/${digits.startsWith("0") ? `62${digits.slice(1)}` : digits}`;
  }
  if (row.kind === "instagram") return `https://www.instagram.com/${row.value.replace(/^@/, "")}`;
  return undefined;
}
