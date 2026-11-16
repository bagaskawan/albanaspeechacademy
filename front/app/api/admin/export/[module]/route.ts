import { createClient } from "@/lib/supabase/server";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { EXPORT_ROW_LIMIT, exportFileName, isExportModule, toCsv, wibDateTime, type ExportColumn, type ExportModule } from "@/lib/admin-export";
import { ilikePattern } from "@/lib/ilike";

export const runtime = "nodejs";

type Row = Record<string, unknown>;
type Loaded = { rows: Row[]; columns: ExportColumn<Row>[] };

const text = (value: unknown) => (value === null || value === undefined ? "" : value);
const yesNo = (value: unknown) => (value ? "Ya" : "Tidak");
const invoices = (row: Row) => ((row.academy_invoices as Row[] | null) ?? []).slice().sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
const answer = (row: Row, key: string) => {
  const value = ((row.answers as Row | null) ?? {})[key];
  return typeof value === "boolean" ? yesNo(value) : text(value);
};

// Route handlers cannot use the page guard's redirect(): a fetch would follow it and save the login page as CSV.
async function isAdmin() {
  const session = await createClient();
  const { data } = await session.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return false;
  const { data: admin } = await session.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(admin);
}

async function load(module: ExportModule, params: URLSearchParams): Promise<Loaded> {
  const db = academyBillingClient();
  const q = params.get("q")?.trim();
  const limit = EXPORT_ROW_LIMIT + 1;
  const run = async (request: PromiseLike<{ data: unknown; error: { message: string } | null }>) => {
    const { data, error } = await request;
    if (error) throw new Error(error.message);
    return (data ?? []) as Row[];
  };

  switch (module) {
    case "pendaftar":
      return {
        rows: await run((q
          ? db.from("academy_registrations").select("received_at,full_name,email,whatsapp,offer_title,primary_batch_slug,payment_method,answers,academy_invoices(status,total_idr,created_at)").or(`full_name.ilike.${ilikePattern(q)},email.ilike.${ilikePattern(q)}`)
          : db.from("academy_registrations").select("received_at,full_name,email,whatsapp,offer_title,primary_batch_slug,payment_method,answers,academy_invoices(status,total_idr,created_at)"))
          .order("received_at", { ascending: false }).limit(limit)),
        columns: [
          { header: "Masuk (WIB)", value: (row) => wibDateTime(row.received_at as string) },
          { header: "Nama", value: (row) => row.full_name },
          { header: "Email", value: (row) => row.email },
          { header: "WhatsApp", value: (row) => row.whatsapp },
          { header: "Program/bundling", value: (row) => row.offer_title },
          { header: "Batch", value: (row) => row.primary_batch_slug },
          { header: "Metode bayar", value: (row) => (row.payment_method === "dp" ? "DP" : "Lunas") },
          { header: "Status tagihan terakhir", value: (row) => invoices(row).at(-1)?.status },
          { header: "Total tagihan terakhir", value: (row) => invoices(row).at(-1)?.total_idr },
          { header: "Panggilan", value: (row) => answer(row, "nickname") },
          { header: "Domisili", value: (row) => answer(row, "domicile") },
          { header: "Usia", value: (row) => answer(row, "age") },
          { header: "Jenis kelamin", value: (row) => answer(row, "gender") },
          { header: "Profesi", value: (row) => answer(row, "profession") },
          { header: "Instansi", value: (row) => answer(row, "institution") },
          { header: "Pernah pelatihan", value: (row) => answer(row, "priorExperience") },
          { header: "Tujuan", value: (row) => answer(row, "goal") },
          { header: "Tantangan", value: (row) => answer(row, "challenge") },
          { header: "Sumber informasi", value: (row) => answer(row, "source") },
        ],
      };
    case "tagihan":
      return {
        rows: await run(db.from("academy_invoices")
          .select("created_at,stage,subtotal_idr,unique_code,total_idr,status,reviewed_by,reviewed_at,academy_registrations(full_name,offer_title,primary_batch_slug)")
          .order("created_at", { ascending: false }).limit(limit)),
        columns: [
          { header: "Dibuat (WIB)", value: (row) => wibDateTime(row.created_at as string) },
          { header: "Nama", value: (row) => (row.academy_registrations as Row | null)?.full_name },
          { header: "Program – batch", value: (row) => { const r = row.academy_registrations as Row | null; return r ? `${r.offer_title} – ${r.primary_batch_slug ?? ""}` : ""; } },
          { header: "Tahap", value: (row) => (row.stage === "remaining" ? "Pelunasan" : "Awal") },
          { header: "Subtotal", value: (row) => row.subtotal_idr },
          { header: "Kode unik", value: (row) => row.unique_code },
          { header: "Total", value: (row) => row.total_idr },
          { header: "Status", value: (row) => row.status },
          { header: "Diperiksa oleh", value: (row) => row.reviewed_by },
          { header: "Diperiksa pada (WIB)", value: (row) => wibDateTime(row.reviewed_at as string) },
        ],
      };
    case "program": {
      let request = db.from("programs").select("slug,title,price_idr,original_price_idr,dp_percent,materials").order("title").limit(limit);
      if (q) request = request.ilike("title", ilikePattern(q));
      const [rows, batches] = await Promise.all([run(request), run(db.from("batches").select("program_slug"))]);
      const count = (slug: unknown) => batches.filter((batch) => batch.program_slug === slug).length;
      return {
        rows,
        columns: [
          { header: "Nama", value: (row) => row.title },
          { header: "Harga", value: (row) => row.price_idr },
          { header: "Harga coret", value: (row) => row.original_price_idr },
          { header: "DP (%)", value: (row) => row.dp_percent },
          { header: "Jumlah materi", value: (row) => (Array.isArray(row.materials) ? row.materials.length : 0) },
          { header: "Jumlah batch", value: (row) => count(row.slug) },
        ],
      };
    }
    case "batch": {
      let request = db.from("batches").select("title,program_slug,sessions,registration_open").order("title").limit(limit);
      if (q) request = request.ilike("title", ilikePattern(q));
      const open = params.get("registration_open");
      if (open === "true" || open === "false") request = request.eq("registration_open", open === "true");
      const sessions = (row: Row) => (Array.isArray(row.sessions) ? (row.sessions as Row[]) : []);
      return {
        rows: await run(request),
        columns: [
          { header: "Judul", value: (row) => row.title },
          { header: "Program", value: (row) => row.program_slug },
          { header: "Sesi pertama (WIB)", value: (row) => wibDateTime(sessions(row)[0]?.starts_at as string | undefined) },
          { header: "Jumlah sesi", value: (row) => sessions(row).length },
          { header: "Pendaftaran dibuka", value: (row) => yesNo(row.registration_open) },
        ],
      };
    }
    case "trainer": {
      let request = db.from("trainers").select("name,expertise,bio").order("name").limit(limit);
      if (q) request = request.ilike("name", ilikePattern(q));
      return {
        rows: await run(request),
        columns: [
          { header: "Nama", value: (row) => row.name },
          { header: "Keahlian", value: (row) => row.expertise },
          { header: "Bio", value: (row) => row.bio },
        ],
      };
    }
    case "artikel": {
      let request = db.from("articles").select("title,published,published_at,updated_at,slug").order("updated_at", { ascending: false }).limit(limit);
      if (q) request = request.ilike("title", ilikePattern(q));
      const status = params.get("status");
      if (status === "terbit" || status === "draf") request = request.eq("published", status === "terbit");
      return {
        rows: await run(request),
        columns: [
          { header: "Judul", value: (row) => row.title },
          { header: "Status", value: (row) => (row.published ? "Terbit" : "Draf") },
          { header: "Terbit (WIB)", value: (row) => wibDateTime(row.published_at as string) },
          { header: "Diperbarui (WIB)", value: (row) => wibDateTime(row.updated_at as string) },
          { header: "Slug", value: (row) => row.slug },
        ],
      };
    }
    case "testimoni": {
      let request = db.from("testimonials").select("attribution,role_label,quote,published").order("id", { ascending: false }).limit(limit);
      if (q) request = request.ilike("attribution", ilikePattern(q));
      const published = params.get("published");
      if (published === "true" || published === "false") request = request.eq("published", published === "true");
      return {
        rows: await run(request),
        columns: [
          { header: "Nama", value: (row) => row.attribution },
          { header: "Peran", value: (row) => row.role_label },
          { header: "Kutipan", value: (row) => row.quote },
          { header: "Terbit", value: (row) => yesNo(row.published) },
        ],
      };
    }
    case "partner": {
      let request = db.from("academy_partners").select("name,published,sort_order").order("sort_order").limit(limit);
      if (q) request = request.ilike("name", ilikePattern(q));
      return {
        rows: await run(request),
        columns: [
          { header: "Nama", value: (row) => row.name },
          { header: "Terbit", value: (row) => yesNo(row.published) },
          { header: "Urutan", value: (row) => row.sort_order },
        ],
      };
    }
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ module: string }> }) {
  if (!(await isAdmin())) return new Response("Sesi admin diperlukan.", { status: 401 });
  const { module } = await params;
  if (!isExportModule(module)) return new Response("Modul ini tidak dapat diekspor.", { status: 404 });

  let loaded: Loaded;
  try {
    loaded = await load(module, new URL(request.url).searchParams);
  } catch {
    return new Response("Data gagal dimuat untuk ekspor.", { status: 500 });
  }
  if (loaded.rows.length > EXPORT_ROW_LIMIT) {
    return new Response(`Lebih dari ${EXPORT_ROW_LIMIT.toLocaleString("id-ID")} baris. Persempit saringan lalu ekspor lagi.`, { status: 413 });
  }

  return new Response(toCsv(loaded.rows, loaded.columns), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${exportFileName(module, new Date())}"`,
      "Cache-Control": "no-store",
    },
  });
}
