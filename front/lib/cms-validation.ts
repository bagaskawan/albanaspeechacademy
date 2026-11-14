import { cmsCollections, type CmsCollection, type CmsTable } from "./cms-fields";

type Row = Record<string, unknown>;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseCmsInput(table: CmsTable, input: unknown, existing: Row = {}): Row | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const source = input as Row;
  const collection: CmsCollection = cmsCollections[table];
  if (Object.keys(source).some((key) => !collection.fields.some((field) => field.name === key))) return null;

  const result: Row = {};
  for (const field of collection.fields) {
    if (!(field.name in source)) continue;
    const value = source[field.name];
    if (field.type === "boolean") {
      if (typeof value !== "boolean") return null;
      result[field.name] = value;
    } else if (field.type === "number") {
      if (value === "" || value === null) result[field.name] = field.name === "sort_order" ? 0 : null;
      else if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) result[field.name] = value;
      else return null;
    } else if (field.type === "datetime") {
      if (value === "" || value === null) result[field.name] = null;
      else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}:00+07:00`))) result[field.name] = `${value}:00+07:00`;
      else return null;
    } else if (field.type === "json") {
      if (typeof value !== "string" || value.length > 20000) return null;
      try {
        const parsed: unknown = JSON.parse(value || "[]");
        if (!Array.isArray(parsed)) return null;
        result[field.name] = parsed;
      } catch { return null; }
    } else {
      if (typeof value !== "string" || value.length > 10000 || (field.options && !field.options.includes(value))) return null;
      result[field.name] = value.trim() || null;
    }
  }
  const full = { ...existing, ...result };
  if (collection.fields.some((field) => field.required && !full[field.name])) return null;
  if (table === "programs" && full.published && (!Array.isArray(full.curriculum) || !full.curriculum.every((group) => group && typeof group === "object" && Array.isArray(group.materi) && group.materi.length > 0 && group.materi.every((item: unknown) => typeof item === "string" && item.trim())))) return null;
  if (table === "batches" && !["draft", "cancelled"].includes(String(full.status)) && (!full.venue || !full.address || full.price_idr === null || full.price_idr === undefined)) return null;
  if (table === "batches" && ["open", "running_open"].includes(String(full.status)) && (!full.form_kind || !full.proof_on_followup || full.capacity !== null && full.capacity !== undefined)) return null;
  if (table === "media_assets" && full.published && full.kind === "image" && !full.alt_text) return null;
  if (table === "media_assets" && full.provider === "youtube") {
    if (full.kind !== "video") return null;
    try {
      const video = new URL(String(full.object_key));
      if (video.protocol !== "https:" || !["www.youtube.com", "youtube.com", "youtu.be"].includes(video.hostname)) return null;
    } catch { return null; }
  }
  if (table === "contact_channels" && full.published) {
    const value = String(full.value ?? "");
    if (full.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
    if (full.kind === "whatsapp" && !/^\+?[\d\s-]{8,20}$/.test(value)) return null;
    if (full.kind === "instagram" && !/^@?[a-zA-Z0-9._]{1,30}$/.test(value)) return null;
  }
  if (["gallery", "trainers"].includes(table)) {
    const url = String(full.asset_url ?? full.photo_url ?? "");
    if (url && !/^https:\/\//.test(url) && !/^\/api\/media\/[1-9]\d*$/.test(url)) return null;
  }
  if (["trainers", "programs", "batches", "articles"].includes(table) && full.slug && !slug.test(String(full.slug))) return null;
  if (table === "articles" && full.published) result.published_at = existing.published_at ?? new Date().toISOString();
  return result;
}
