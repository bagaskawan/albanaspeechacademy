import "server-only";
import { cmsCollections, type CmsTable } from "@/lib/cms-fields";

function base() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Koneksi CMS belum tersedia.");
  return { url, key };
}

async function request(table: CmsTable, token: string, method = "GET", query = "select=*", body?: Record<string, unknown>) {
  const { url, key } = base();
  const response = await fetch(new URL(`/rest/v1/${table}?${query}`, url), {
    method,
    headers: { apikey: key, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Perubahan CMS gagal disimpan. Periksa data dan izin akun.");
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error("Respons CMS tidak valid.");
  return rows as Record<string, unknown>[];
}

function keyQuery(table: CmsTable, key: Record<string, unknown>) {
  const keyNames = cmsCollections[table].key.split(",");
  if (Object.keys(key).length !== keyNames.length || keyNames.some((name) => !Object.hasOwn(key, name))) throw new Error("Kunci konten tidak valid.");
  const params = new URLSearchParams({ select: "*" });
  for (const name of keyNames) {
    const value = key[name];
    if (typeof value !== "string" && typeof value !== "number") throw new Error("Kunci konten tidak valid.");
    params.set(name, `eq.${value}`);
  }
  return params.toString();
}

export async function listCmsRows(table: CmsTable, token: string) {
  return request(table, token);
}

export async function findCmsRow(table: CmsTable, token: string, key: Record<string, unknown>) {
  const rows = await request(table, token, "GET", keyQuery(table, key));
  return rows[0] ?? null;
}

export async function writeCmsRow(table: CmsTable, token: string, body: Record<string, unknown>, key?: Record<string, unknown>) {
  return request(table, token, key ? "PATCH" : "POST", key ? keyQuery(table, key) : "select=*", body);
}

export async function deleteCmsRow(table: CmsTable, token: string, key: Record<string, unknown>) {
  return request(table, token, "DELETE", keyQuery(table, key));
}
