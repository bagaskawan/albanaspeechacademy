import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { AlbanaMediaUpload } from "./AlbanaMediaUpload";
import { addYoutube, saveMediaSettings, setMediaPublished } from "./actions";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdminMember();
  const client = academyBillingClient();
  const [programsResult, batchesResult, mediaResult, settingsResult] = await Promise.all([
    client.from("programs").select("slug,title").order("title"),
    client.from("batches").select("slug,title").order("title"),
    client.from("media_assets").select("id,provider,kind,object_key,alt_text,program_slug,batch_slug,published,created_at").order("created_at", { ascending: false }).limit(100),
    client.from("system_settings").select("key,value").in("key", ["albana_media_min_image_width", "albana_media_min_image_height", "albana_media_min_video_short_side"]),
  ]);
  if (programsResult.error || batchesResult.error || mediaResult.error || settingsResult.error) throw new Error("Pustaka media belum bisa dimuat.");
  const programs = programsResult.data ?? [];
  const batches = batchesResult.data ?? [];
  const media = mediaResult.data ?? [];
  const settings = Object.fromEntries((settingsResult.data ?? []).map((item) => [item.key, item.value]));
  return <main className="mx-auto max-w-5xl space-y-8 p-5 sm:p-8">
    <div><h1 className="text-2xl font-bold">Media Albana</h1><p className="mt-2 text-sm text-muted">Kelola foto dan video per program. Berkas draf hanya terlihat oleh admin; terbitkan setelah diperiksa.</p></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <AlbanaMediaUpload programs={programs} batches={batches} />
      <form action={addYoutube} className="grid content-start gap-4 rounded-xl border border-rule bg-card p-5">
        <h2 className="text-lg font-semibold">Tambahkan video YouTube</h2>
        <label className="grid gap-2 text-sm">URL video<input name="url" type="url" required className="min-h-11 border border-rule bg-surface px-3" /></label>
        <label className="grid gap-2 text-sm">Program<select name="programSlug" required className="min-h-11 border border-rule bg-surface px-3"><option value="">Pilih program</option>{programs.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Batch (opsional)<select name="batchSlug" className="min-h-11 border border-rule bg-surface px-3"><option value="">Semua batch program</option>{batches.map((item) => <option value={item.slug} key={item.slug}>{item.title}</option>)}</select></label>
        <label className="grid gap-2 text-sm">Keterangan<input name="description" maxLength={500} className="min-h-11 border border-rule bg-surface px-3" /></label>
        <button type="submit" className="button-primary justify-self-start">Simpan sebagai draf</button>
      </form>
    </div>
    <form action={saveMediaSettings} className="grid gap-4 rounded-xl border border-rule bg-card p-5 sm:grid-cols-3">
      <h2 className="text-lg font-semibold sm:col-span-3">Resolusi minimum</h2>
      <label className="grid gap-2 text-sm">Lebar gambar<input type="number" name="imageWidth" min="320" max="8192" required defaultValue={settings.albana_media_min_image_width ?? 1280} className="min-h-11 border border-rule bg-surface px-3" /></label>
      <label className="grid gap-2 text-sm">Tinggi gambar<input type="number" name="imageHeight" min="320" max="8192" required defaultValue={settings.albana_media_min_image_height ?? 720} className="min-h-11 border border-rule bg-surface px-3" /></label>
      <label className="grid gap-2 text-sm">Sisi pendek MP4<input type="number" name="videoShortSide" min="320" max="8192" required defaultValue={settings.albana_media_min_video_short_side ?? 720} className="min-h-11 border border-rule bg-surface px-3" /></label>
      <p className="text-sm text-muted sm:col-span-3">Batas byte tetap di server: gambar sumber 10 MiB, gambar hasil 5 MiB, MP4 25 MiB.</p>
      <button type="submit" className="button-secondary justify-self-start sm:col-span-3">Simpan batas resolusi</button>
    </form>
    <section aria-labelledby="media-list-title"><h2 id="media-list-title" className="text-xl font-semibold">Aset tersimpan</h2>
      {!media.length ? <p className="mt-4 text-sm text-muted">Belum ada media Albana.</p> : <div className="mt-4 grid gap-3">
        {media.map((asset) => <article key={asset.id} className="flex flex-wrap items-center justify-between gap-3 border border-rule bg-card p-4">
          <div><p className="font-semibold">#{asset.id} · {asset.kind === "image" ? "Gambar" : "Video"} · {asset.program_slug ?? "Tanpa program"}</p>
            <p className="mt-1 break-all text-sm text-muted">{asset.alt_text || asset.object_key}</p>
            <p className="mt-1 text-xs text-muted">{asset.batch_slug || "Semua batch"} · {asset.published ? "Terbit" : "Draf"}</p></div>
          <div className="flex items-center gap-3"><a className="text-sm font-semibold underline" href={asset.provider === "youtube" ? asset.object_key : `/api/media/${asset.id}`} target="_blank" rel="noopener noreferrer">Pratinjau</a>
            <form action={setMediaPublished}><input type="hidden" name="id" value={asset.id} /><input type="hidden" name="published" value={asset.published ? "false" : "true"} />
              <button type="submit" className="button-secondary">{asset.published ? "Tarik" : "Terbitkan"}</button></form></div>
        </article>)}
      </div>}
    </section>
  </main>;
}
