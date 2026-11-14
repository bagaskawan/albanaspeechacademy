import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { resolveInvoice } from "./actions";

export const dynamic = "force-dynamic";

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default async function BillingPage() {
  await requireAdminMember();
  const { data, error } = await academyBillingClient().from("academy_registrations")
    .select("id,full_name,email,whatsapp,offer_title,received_at,academy_registration_items(batch_slug),academy_invoices(id,stage,subtotal_idr,unique_code,total_idr,status,reviewed_by,reviewed_at)")
    .order("received_at", { ascending: false }).limit(200);
  if (error) throw new Error("Tagihan belum bisa dimuat.");
  return <div className="space-y-6 p-5 sm:p-8">
    <div><h1 className="text-2xl font-bold">Tagihan Albana</h1><p className="mt-2 text-sm text-muted">Cocokkan bukti WhatsApp dan nominal persis sebelum memverifikasi. DP yang diverifikasi menerbitkan tagihan pelunasan baru.</p></div>
    {!data?.length ? <p>Belum ada pendaftaran dan tagihan.</p> : <div className="grid gap-5">
      {data.map((row) => <article key={row.id} className="rounded-xl border border-rule bg-card p-5">
        <div className="flex flex-wrap justify-between gap-2"><h2 className="font-semibold">#{row.id} · {row.full_name}</h2><time className="text-sm text-muted">{new Date(row.received_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</time></div>
        <p className="mt-2 text-sm">{row.offer_title} · {row.academy_registration_items.map((item) => item.batch_slug).join(" + ")}</p>
        <p className="mt-1 text-sm text-muted">{row.email} · {row.whatsapp}</p>
        <div className="mt-4 grid gap-3">
          {row.academy_invoices.sort((a, b) => a.id - b.id).map((invoice) => <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3 text-sm">
            <div><p className="font-semibold">Tagihan #{invoice.id} · {invoice.stage === "remaining" ? "Pelunasan" : "Awal"} · {invoice.status}</p>
              <p>Subtotal {rupiah(Number(invoice.subtotal_idr))} + kode {String(invoice.unique_code).padStart(3, "0")} = <strong>{rupiah(Number(invoice.total_idr))}</strong></p>
              {invoice.reviewed_at ? <p className="text-muted">Diperiksa {new Date(invoice.reviewed_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</p> : null}</div>
            {invoice.status === "pending" ? <div className="flex gap-2">
              <form action={resolveInvoice}><input type="hidden" name="invoiceId" value={invoice.id} /><input type="hidden" name="decision" value="verified" /><button className="button-primary" type="submit">Verifikasi</button></form>
              <form action={resolveInvoice}><input type="hidden" name="invoiceId" value={invoice.id} /><input type="hidden" name="decision" value="rejected" /><button className="button-secondary" type="submit">Tolak</button></form>
            </div> : null}
          </div>)}
        </div>
      </article>)}
    </div>}
  </div>;
}
