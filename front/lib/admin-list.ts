import type { CmsCollection, CmsField } from "./cms-fields";
import { formatRupiah } from "./format";

// shortcut: limit pagination tetap; ganti ke system_settings saat modul pengaturan dibangun.
export const ADMIN_PAGE_SIZE = 10;

export type RowStatus = { label: string; tone: "positive" | "neutral" | "negative" };

const PRIMARY_NAMES = ["title", "name", "slug", "kind", "id"];

const STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  scheduled: "Terjadwal",
  open: "Dibuka",
  running: "Berjalan",
  running_open: "Berjalan & dibuka",
  full: "Penuh",
  closed: "Ditutup",
  cancelled: "Dibatalkan",
  published: "Terbit",
};

const adminDateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function primaryValue(row: Record<string, unknown>, collection: CmsCollection): string {
  for (const name of PRIMARY_NAMES) {
    const value = row[name];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  const fallback = collection.fields.find((field) => typeof row[field.name] === "string");
  return fallback ? String(row[fallback.name]) : "Tanpa judul";
}

export function listFields(collection: CmsCollection): CmsField[] {
  const candidates = collection.fields.filter(
    (field) =>
      field.type !== "textarea" &&
      field.type !== "json" &&
      field.type !== "boolean" &&
      field.name !== "status",
  );
  const identity = PRIMARY_NAMES
    .map((name) => candidates.find((field) => field.name === name))
    .find((field) => field !== undefined);
  const ordered = identity ? [identity, ...candidates.filter((field) => field !== identity)] : candidates;
  return ordered.slice(0, 4);
}

export function displayValue(field: Pick<CmsField, "name" | "type">, row: Record<string, unknown>): string {
  const value = row[field.name];
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "boolean") return value === true ? "Ya" : "Tidak";
  if (typeof value === "number") {
    return field.name.includes("price") || field.name.includes("idr") ? formatRupiah(value) : String(value);
  }
  if (field.type === "datetime" && typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? value : adminDateFormatter.format(date);
  }
  return typeof value === "string" ? value : "—";
}

export function statusOf(collection: CmsCollection, row: Record<string, unknown>): RowStatus | null {
  if (collection.fields.some((field) => field.name === "published")) {
    return row.published === true
      ? { label: "Terbit", tone: "positive" }
      : { label: "Draf", tone: "neutral" };
  }
  if (collection.fields.some((field) => field.name === "status") && typeof row.status === "string" && row.status) {
    const label = STATUS_LABELS[row.status] ?? row.status;
    const tone = ["cancelled", "closed"].includes(row.status)
      ? "negative"
      : row.status === "draft"
        ? "neutral"
        : "positive";
    return { label, tone };
  }
  if (collection.fields.some((field) => field.name === "active")) {
    return row.active === true
      ? { label: "Aktif", tone: "positive" }
      : { label: "Nonaktif", tone: "neutral" };
  }
  return null;
}

export function filterRows(
  rows: Record<string, unknown>[],
  collection: CmsCollection,
  query: string,
): Record<string, unknown>[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    collection.fields.some((field) => {
      if (field.type === "json") return false;
      const value = row[field.name];
      return typeof value === "string" && value.toLowerCase().includes(needle);
    }),
  );
}

export function paginateRows(rows: Record<string, unknown>[], page: number) {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const current = Math.min(Math.max(1, Number.isFinite(page) ? Math.trunc(page) : 1), totalPages);
  const offset = (current - 1) * ADMIN_PAGE_SIZE;
  const items = rows.slice(offset, offset + ADMIN_PAGE_SIZE);
  return {
    items,
    page: current,
    totalPages,
    total,
    start: total ? offset + 1 : 0,
    end: offset + items.length,
  };
}
