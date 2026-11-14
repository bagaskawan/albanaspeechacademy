import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { saveBundle } from "./actions";

export const dynamic = "force-dynamic";

export default async function BundleAdminPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminMember();
  const client = academyBillingClient();
  const [{ data: programs }, { data: offer }, query] = await Promise.all([
    client.from("programs").select("slug,title").order("title"),
    client.from("bundle_offers").select("*").eq("slug", "speaker-sertifikasi").maybeSingle(),
    searchParams,
  ]);
  return <main className="max-w-3xl space-y-6 p-5 sm:p-8">
    <div><h1 className="text-2xl font-bold">Bundling Speaker–Sertifikasi</h1>
      <p className="mt-2 text-sm text-muted">Isi harga sebelum mengaktifkan. Penawaran hanya tampil saat batch kedua program terbuka.</p></div>
    {query.error ? <p role="alert" className="border-l-4 border-danger p-3">{query.error === "invalid" ? "Periksa judul, program, harga, dan DP." : "Penawaran gagal disimpan. Coba lagi."}</p> : null}
    {query.saved ? <p role="status" className="border-l-4 border-accent p-3">Penawaran tersimpan.</p> : null}
    <form action={saveBundle} className="grid gap-5 rounded-xl border border-rule bg-card p-5">
      <label className="grid gap-2 text-sm font-semibold">Judul paket<input name="title" required maxLength={160} defaultValue={offer?.title ?? "Speaker + Sertifikasi"} className="min-h-11 rounded border border-rule bg-surface px-3" /></label>
      <label className="grid gap-2 text-sm font-semibold">Program Speaker<select name="speaker" required defaultValue={offer?.speaker_program_slug ?? ""} className="min-h-11 rounded border border-rule bg-surface px-3"><option value="">Pilih program</option>{programs?.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}</select></label>
      <label className="grid gap-2 text-sm font-semibold">Program Sertifikasi<select name="certification" required defaultValue={offer?.certification_program_slug ?? ""} className="min-h-11 rounded border border-rule bg-surface px-3"><option value="">Pilih program</option>{programs?.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}</select></label>
      <label className="grid gap-2 text-sm font-semibold">Harga bundling (Rp)<input name="price" type="number" min="1" step="1" defaultValue={offer?.price_idr ?? ""} className="min-h-11 rounded border border-rule bg-surface px-3" /></label>
      <label className="grid gap-2 text-sm font-semibold">DP (%)<input name="dp" type="number" min="1" max="99" step="1" defaultValue={offer?.dp_percent ?? ""} className="min-h-11 rounded border border-rule bg-surface px-3" /><span className="font-normal text-muted">Kosongkan jika hanya menerima pembayaran lunas.</span></label>
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" name="active" defaultChecked={offer?.active ?? false} />Aktifkan penawaran</label>
      <button type="submit" className="button-primary justify-self-start">Simpan bundling</button>
    </form>
  </main>;
}
