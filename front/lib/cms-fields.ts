export type CmsField = { name: string; label: string; type?: "textarea" | "boolean" | "number" | "datetime" | "json" | "select"; options?: string[]; required?: boolean };
export type CmsCollection = { label: string; key: string; fields: CmsField[]; create?: boolean };

export const cmsCollections = {
  academy: { label: "Profil akademi", key: "id", fields: [
    { name: "name", label: "Nama", required: true }, { name: "teaching_method", label: "Metode belajar", type: "textarea" },
    { name: "reschedule_policy", label: "Ketentuan penjadwalan ulang", type: "textarea" },
  ] },
  trainers: { label: "Trainer", key: "slug", create: true, fields: [
    { name: "slug", label: "Slug", required: true }, { name: "name", label: "Nama", required: true },
    { name: "role", label: "Peran", required: true }, { name: "bio", label: "Bio", type: "textarea" },
    { name: "photo_url", label: "URL potret" },
    { name: "published", label: "Terbitkan profil", type: "boolean" },
  ] },
  programs: { label: "Program", key: "slug", create: true, fields: [
    { name: "slug", label: "Slug", required: true }, { name: "title", label: "Judul", required: true },
    { name: "summary", label: "Ringkasan", type: "textarea", required: true }, { name: "audience", label: "Sasaran", type: "textarea" },
    { name: "outcomes", label: "Hasil belajar", type: "textarea" }, { name: "format", label: "Format" },
    { name: "curriculum", label: "Kurikulum JSON (array kelompok materi)", type: "json" },
    { name: "inclusions", label: "Fasilitas", type: "textarea" }, { name: "certification", label: "Sertifikasi" },
    { name: "faq", label: "FAQ JSON (array)", type: "json" }, { name: "published", label: "Terbitkan program", type: "boolean" },
  ] },
  batches: { label: "Batch", key: "slug", create: true, fields: [
    { name: "slug", label: "Slug", required: true }, { name: "program_slug", label: "Slug program", required: true },
    { name: "title", label: "Judul", required: true }, { name: "venue", label: "Lokasi" }, { name: "address", label: "Alamat" },
    { name: "price_idr", label: "Harga final (Rp)", type: "number" }, { name: "fee_details", label: "Rincian biaya/promo", type: "textarea" },
    { name: "capacity", label: "Kapasitas (kosong bila belum disetujui)", type: "number" },
    { name: "closes_at", label: "Tenggat (WIB)", type: "datetime" },
    { name: "status", label: "Status", type: "select", options: ["draft","scheduled","open","running","running_open","full","closed","cancelled"] },
    { name: "form_kind", label: "Varian formulir", type: "select", options: ["","series","exclusive","bnsp"] },
    { name: "dp_percent", label: "DP persen", type: "number" },
    { name: "proof_on_followup", label: "Bukti disusulkan lewat admin", type: "boolean" },
  ] },
  sessions: { label: "Sesi", key: "batch_slug,sequence_no", create: true, fields: [
    { name: "batch_slug", label: "Slug batch", required: true }, { name: "sequence_no", label: "Urutan", type: "number", required: true },
    { name: "starts_at", label: "Mulai (WIB)", type: "datetime", required: true },
    { name: "ends_at", label: "Selesai (WIB)", type: "datetime", required: true },
  ] },
  contact_channels: { label: "Kanal kontak publik", key: "kind", create: true, fields: [
    { name: "kind", label: "Jenis", type: "select", options: ["address","instagram","whatsapp","email"], required: true },
    { name: "value", label: "Nilai", required: true }, { name: "published", label: "Tampilkan di situs", type: "boolean" },
  ] },
  bank_accounts: { label: "Rekening internal", key: "id", create: true, fields: [
    { name: "bank", label: "Bank", required: true }, { name: "account_number", label: "Nomor rekening", required: true },
    { name: "holder", label: "Atas nama", required: true }, { name: "active", label: "Aktif", type: "boolean" },
  ] },
  gallery: { label: "Galeri", key: "id", create: true, fields: [
    { name: "asset_url", label: "URL aset", required: true }, { name: "alt_text", label: "Teks alternatif", required: true },
    { name: "caption", label: "Keterangan" }, { name: "sort_order", label: "Urutan", type: "number" },
    { name: "published", label: "Terbitkan", type: "boolean" },
  ] },
  testimonials: { label: "Testimoni", key: "id", create: true, fields: [
    { name: "attribution", label: "Atribusi", required: true }, { name: "quote", label: "Kutipan", type: "textarea", required: true },
    { name: "published", label: "Terbitkan", type: "boolean" },
  ] },
  articles: { label: "Artikel", key: "slug", create: true, fields: [
    { name: "slug", label: "Slug", required: true }, { name: "title", label: "Judul", required: true },
    { name: "excerpt", label: "Ringkasan", type: "textarea", required: true },
    { name: "body", label: "Isi artikel (teks/Markdown)", type: "textarea", required: true },
    { name: "published", label: "Terbitkan", type: "boolean" },
  ] },
  media_assets: { label: "Aset media", key: "id", create: true, fields: [
    { name: "provider", label: "Penyedia (tautan manual: YouTube)", type: "select", options: ["youtube","supabase_storage","cloudinary"], required: true },
    { name: "kind", label: "Jenis", type: "select", options: ["image","video"], required: true },
    { name: "object_key", label: "Kunci objek / URL YouTube", required: true },
    { name: "alt_text", label: "Teks alternatif" },
    { name: "published", label: "Terbitkan", type: "boolean" },
  ] },
} satisfies Record<string, CmsCollection>;

export type CmsTable = keyof typeof cmsCollections;

export function isCmsTable(value: string): value is CmsTable { return Object.hasOwn(cmsCollections, value); }
