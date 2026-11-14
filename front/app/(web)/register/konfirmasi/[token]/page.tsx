import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandLogo } from "@/components/layout/brand-logo";
import { CopyAccountButton } from "@/components/register/copy-account-button";
import { readReceiptToken } from "@/lib/receipt-token";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";

export const dynamic = "force-dynamic";

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default async function ConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const secret = process.env.REGISTRATION_RECEIPT_SECRET;
  const id = secret ? readReceiptToken(token, secret) : null;
  if (!id) notFound();

  const client = academyBillingClient();
  const { data: registration, error } = await client.from("academy_registrations")
    .select("id,offer_title,payment_method,price_idr_at_signup,received_at")
    .eq("id", id).single();
  if (error || !registration) notFound();
  const { data: invoices, error: invoiceError } = await client.from("academy_invoices")
    .select("id,stage,subtotal_idr,unique_code,total_idr,status,bank_accounts(bank,account_number,holder)")
    .eq("registration_id", id).order("id", { ascending: false });
  if (invoiceError || !invoices?.length) notFound();
  const invoice = invoices.find((item) => item.status === "pending") ?? invoices[0];
  const bank = Array.isArray(invoice.bank_accounts) ? invoice.bank_accounts[0] : invoice.bank_accounts;
  if (!bank) notFound();
  const subtotal = Number(invoice.subtotal_idr);
  const code = Number(invoice.unique_code);
  const total = Number(invoice.total_idr);
  const stage = invoice.stage === "remaining" ? "Pelunasan" : registration.payment_method === "dp" ? "DP" : "Pembayaran lunas";
  let whatsappHref: string | undefined;
  try {
    const contact = (await readPublishedContacts()).find((item) => item.kind === "whatsapp");
    whatsappHref = contact ? contactHref(contact) : undefined;
  } catch { /* The bank instructions remain available if contacts cannot load. */ }
  if (whatsappHref) whatsappHref += `?text=${encodeURIComponent(`Halo Admin Albana, saya mengirim bukti transfer untuk pendaftaran #${id}, tagihan #${invoice.id} (${stage}), total ${rupiah(total)}.`)}`;

  return <main id="main-content" className="min-h-screen bg-surface px-4 py-8 text-ink sm:px-8 sm:py-12">
    <div className="mx-auto max-w-6xl">
      <header className="flex items-center gap-4 border-b border-rule pb-6">
        <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Kembali ke beranda Albana"><BrandLogo className="h-12 w-28" /></Link>
        <div><p className="text-xs font-semibold uppercase tracking-widest text-muted">Pendaftaran #{id}</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Konfirmasi pembayaran</h1></div>
      </header>
      <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(19rem,0.9fr)] lg:gap-12">
        <section aria-labelledby="receipt-heading">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Pendaftaran berhasil diproses</p>
          <h2 id="receipt-heading" className="mt-2 text-xl font-semibold">{registration.offer_title}</h2>
          <p className="mt-2 text-sm text-muted">Akun dan kepesertaan diaktifkan setelah admin memverifikasi pembayaran.</p>
          <dl className="mt-8 border border-rule bg-card p-5 sm:p-7">
            <div className="flex justify-between gap-3 font-semibold"><dt>Tagihan #{invoice.id}</dt><dd>{stage}</dd></div>
            <div className="mt-6 flex justify-between gap-3 text-sm"><dt>Subtotal</dt><dd>{rupiah(subtotal)}</dd></div>
            <div className="mt-3 flex justify-between gap-3 text-sm"><dt>Kode unik</dt><dd>+ {rupiah(code)}</dd></div>
            <div className="mt-5 flex justify-between gap-3 border-t border-rule pt-5 text-lg font-bold"><dt>Total transfer</dt><dd className="text-danger">{rupiah(total)}</dd></div>
          </dl>
          {invoice.status === "pending" ? <>
            <ol className="mt-8 grid gap-3 border-y border-rule py-5 text-sm">
              <li><strong>01.</strong> Transfer tepat {rupiah(total)}, termasuk kode unik.</li>
              <li><strong>02.</strong> Ambil tangkapan layar bukti transfer.</li>
              <li><strong>03.</strong> Kirim bukti ke WhatsApp admin dengan tombol di bawah.</li>
            </ol>
            {whatsappHref ? <a className="button-primary mt-6 flex min-h-12 items-center justify-center text-center" href={whatsappHref} target="_blank" rel="noopener noreferrer">Kirim bukti transfer ke WhatsApp</a> : <p className="mt-6 text-sm text-muted">Nomor WhatsApp admin belum tersedia di data kontak. Hubungi Albana melalui kanal resmi untuk mengirim bukti transfer.</p>}
          </> : <p className="mt-7 border-l-4 border-accent pl-4">Status tagihan: {invoice.status === "verified" ? "sudah diverifikasi" : invoice.status === "rejected" ? "perlu ditinjau ulang" : "dibatalkan"}. Hubungi admin jika membutuhkan bantuan.</p>}
          <p className="mt-12 text-xs text-muted">Pembayaran diverifikasi manual oleh admin Albana.</p>
        </section>
        <aside className="border-t border-rule pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0" aria-label="Rekening pembayaran">
          <div className="border border-rule bg-card p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Transfer bank</p>
            <h2 className="mt-3 text-2xl font-bold">{bank.bank}</h2>
            <p className="mt-8 text-sm text-muted">Nomor rekening</p>
            <p className="mt-1 break-all font-mono text-2xl font-bold tracking-wide">{bank.account_number}</p>
            <p className="mt-2 text-sm">a.n. {bank.holder}</p>
            <div className="mt-7"><CopyAccountButton account={bank.account_number} /></div>
            <p className="mt-8 border-t border-rule pt-5 text-sm text-muted">Pastikan nama penerima cocok sebelum mentransfer. Sertakan kode unik pada nominal transfer.</p>
          </div>
        </aside>
      </div>
    </div>
  </main>;
}
