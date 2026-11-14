import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { savePartner, togglePartner } from "./actions";

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
  await requireAdminMember();
  const { data, error } = await academyBillingClient().from("academy_partners").select("id,name,logo_url,published,sort_order").order("sort_order").order("id");
  if (error) throw new Error("Partner belum bisa dimuat.");
  return <main className="mx-auto max-w-4xl space-y-7 p-5 sm:p-8">
    <div><h1 className="text-2xl font-bold">Partner Inhouse</h1><p className="mt-2 text-sm text-muted">Tambahkan nama dan logo yang sesuai. Partner baru disimpan sebagai draf sampai diterbitkan.</p></div>
    <form action={savePartner} className="grid gap-4 rounded-xl border border-rule bg-card p-5">
      <label className="grid gap-2 text-sm">Nama partner<input name="name" required maxLength={160} className="min-h-11 border border-rule bg-surface px-3" /></label>
      <label className="grid gap-2 text-sm">URL logo (opsional)<input name="logo" className="min-h-11 border border-rule bg-surface px-3" placeholder="https://... atau /api/media/ID" /></label>
      <label className="grid gap-2 text-sm">Urutan<input name="order" type="number" min="0" max="10000" defaultValue="0" className="min-h-11 border border-rule bg-surface px-3" /></label>
      <button type="submit" className="button-primary justify-self-start">Tambah partner</button>
    </form>
    <section aria-label="Daftar partner" className="grid gap-3">{!data?.length ? <p>Belum ada partner.</p> : data.map((partner) => <div key={partner.id} className="flex flex-wrap items-center justify-between gap-3 border border-rule bg-card p-4">
      <div className="flex items-center gap-4">{partner.logo_url ? <img src={partner.logo_url} alt="" className="max-h-14 max-w-24 object-contain" /> : null}<span>{partner.name} · {partner.published ? "Terbit" : "Draf"}</span></div>
      <form action={togglePartner}><input type="hidden" name="id" value={partner.id} /><input type="hidden" name="published" value={partner.published ? "false" : "true"} /><button type="submit" className="button-secondary">{partner.published ? "Tarik" : "Terbitkan"}</button></form>
    </div>)}</section>
  </main>;
}
