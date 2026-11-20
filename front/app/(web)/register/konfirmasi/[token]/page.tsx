import Link from "next/link";
import { notFound } from "next/navigation";
import { Landmark, Mail } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { CopyAccountButton } from "@/components/register/copy-account-button";
import { readReceiptToken } from "@/lib/receipt-token";
import {
  invoiceStageLabel,
  maskEmail,
  paymentProofMessage,
  type InvoiceStage,
  type PaymentMethod,
} from "@/lib/registration-email";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";

export const dynamic = "force-dynamic";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const statusBadge = {
  pending: {
    label: "Menunggu pembayaran",
    className:
      "border-[#D97706]/30 bg-[#FEF3C7] text-[#92400E] dark:border-amber-400/35 dark:bg-amber-500/15 dark:text-amber-200",
  },
  verified: {
    label: "Sudah diverifikasi",
    className:
      "border-[#16A34A]/30 bg-[#DCFCE7] text-[#166534] dark:border-emerald-400/35 dark:bg-emerald-500/15 dark:text-emerald-200",
  },
  rejected: {
    label: "Perlu ditinjau ulang",
    className:
      "border-danger/30 bg-danger/10 text-danger dark:border-rose-400/35 dark:bg-rose-500/15 dark:text-rose-300",
  },
} as const;

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const secret = process.env.REGISTRATION_RECEIPT_SECRET;
  const id = secret ? readReceiptToken(token, secret) : null;
  if (!id) notFound();

  const client = academyBillingClient();
  const { data: registration, error } = await client
    .from("academy_registrations")
    .select("id,full_name,email,offer_title,payment_method,price_idr_at_signup,received_at")
    .eq("id", id)
    .single();
  if (error || !registration) notFound();

  const { data: items, error: itemsError } = await client
    .from("academy_registration_items")
    .select("batch_slug,batches(title)")
    .eq("registration_id", id)
    .order("batch_slug");
  if (itemsError || !items?.length) notFound();

  const batchNames = items
    .map((item) => {
      const batch = Array.isArray(item.batches) ? item.batches[0] : item.batches;
      return batch?.title ?? item.batch_slug;
    })
    .join(" + ");

  const { data: invoices, error: invoiceError } = await client
    .from("academy_invoices")
    .select("id,stage,subtotal_idr,unique_code,total_idr,status,bank_accounts(bank,account_number,holder)")
    .eq("registration_id", id)
    .order("id", { ascending: false });
  if (invoiceError || !invoices?.length) notFound();

  const invoice = invoices.find((item) => item.status === "pending") ?? invoices[0];
  const bank = Array.isArray(invoice.bank_accounts)
    ? invoice.bank_accounts[0]
    : invoice.bank_accounts;
  if (!bank) notFound();

  const subtotal = Number(invoice.subtotal_idr);
  const code = Number(invoice.unique_code);
  const total = Number(invoice.total_idr);
  const stage = invoiceStageLabel(
    invoice.stage as InvoiceStage,
    registration.payment_method as PaymentMethod,
  );
  const badge =
    statusBadge[invoice.status as keyof typeof statusBadge] ?? {
      label: "Dibatalkan",
      className: "border-[var(--tone-rule)] bg-[var(--tone-bg)] text-[var(--tone-muted)]",
    };

  let whatsappHref: string | undefined;
  try {
    const contact = (await readPublishedContacts()).find((item) => item.kind === "whatsapp");
    whatsappHref = contact ? contactHref(contact) : undefined;
  } catch {
    /* The bank instructions remain available if contacts cannot load. */
  }
  if (whatsappHref) {
    whatsappHref += `?text=${encodeURIComponent(
      paymentProofMessage({
        registrationId: id,
        invoiceId: invoice.id,
        fullName: registration.full_name,
        offerTitle: registration.offer_title,
        batchNames,
        stageLabel: stage,
        totalIdr: total,
      }),
    )}`;
  }

  return (
    <main
      id="main-content"
      className="tone-mist min-h-screen bg-[var(--tone-bg)] px-4 py-8 text-[var(--tone-ink)] sm:px-8 sm:py-12"
    >
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--tone-rule)] pb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center"
              aria-label="Kembali ke beranda Albana"
            >
              <span
                className="academy-hero-logo-blue block aspect-[120/46] h-9 sm:h-10 dark:hidden"
                role="img"
                aria-label="Albana Speech Academy"
              />
              <BrandLogo
                src="/logo-white.png"
                imageClassName="object-contain"
                sizes="104px"
                className="hidden h-9 sm:h-10 dark:block"
              />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--tone-muted)]">
                Pendaftaran #{id}
              </p>
              <h1 className="font-display text-2xl font-bold text-[var(--tone-ink)] sm:text-3xl">
                Checkout pembayaran
              </h1>
            </div>
          </div>
          <span
            className={`inline-flex items-center border px-3 py-1.5 text-xs font-semibold tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        </header>

        <div className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(21rem,0.95fr)] lg:items-start lg:gap-8">
          <section className="space-y-6" aria-labelledby="receipt-heading">
            <div className="border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-5 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--tone-accent)]">
                Pendaftaranmu sudah kami terima
              </p>
              <h2 id="receipt-heading" className="mt-2 text-xl font-bold text-[var(--tone-ink)] sm:text-2xl">
                {registration.offer_title} – {batchNames}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--tone-muted)]">
                Admin akan memverifikasi pembayaran sebelum mengonfirmasi kepesertaanmu.
              </p>

              {invoice.status === "pending" ? (
                <div className="mt-4 flex items-start gap-2.5 border border-[var(--tone-rule)] bg-[var(--tone-bg)] px-3.5 py-3 text-sm text-[var(--tone-muted)]">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tone-accent)]" aria-hidden="true" />
                  <p>
                    Instruksi pembayaran juga kami kirim ke{" "}
                    <span className="font-medium text-[var(--tone-ink)]">{maskEmail(registration.email)}</span>.
                    Periksa folder Spam/Promosi bila belum masuk dalam 10 menit.
                  </p>
                </div>
              ) : null}

              <dl className="mt-6 border-t border-[var(--tone-rule)] pt-5">
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-semibold text-[var(--tone-ink)]">Tagihan #{invoice.id}</dt>
                  <dd className="border border-[var(--tone-rule)] bg-[var(--tone-bg)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--tone-ink)]">
                    {stage}
                  </dd>
                </div>
                <div className="mt-5 flex justify-between gap-3 text-sm">
                  <dt className="text-[var(--tone-muted)]">Subtotal</dt>
                  <dd className="tabular-nums font-medium text-[var(--tone-ink)]">{rupiah(subtotal)}</dd>
                </div>
                <div className="mt-2.5 flex justify-between gap-3 text-sm">
                  <dt className="text-[var(--tone-muted)]">Kode unik (3 digit)</dt>
                  <dd className="tabular-nums font-semibold text-[var(--tone-accent)]">+ {rupiah(code)}</dd>
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-[var(--tone-rule)] pt-4">
                  <dt className="text-base font-bold text-[var(--tone-ink)]">Total transfer</dt>
                  <dd className="tabular-nums text-xl font-bold text-danger dark:text-rose-400 sm:text-2xl">
                    {rupiah(total)}
                  </dd>
                </div>
              </dl>
            </div>

            {invoice.status === "pending" ? (
              <div className="border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-5 sm:p-7">
                <h3 className="font-display text-base font-bold text-[var(--tone-ink)]">
                  Langkah konfirmasi pembayaran
                </h3>
                <ol className="mt-4 grid gap-3 text-sm text-[var(--tone-ink)]">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--tone-rule)] bg-[var(--tone-bg)] font-mono text-xs font-bold text-[var(--tone-ink)]">
                      1
                    </span>
                    <span className="pt-0.5">
                      Transfer tepat sebesar total di atas, termasuk 3 digit kode unik.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--tone-rule)] bg-[var(--tone-bg)] font-mono text-xs font-bold text-[var(--tone-ink)]">
                      2
                    </span>
                    <span className="pt-0.5">Simpan bukti transfer.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--tone-rule)] bg-[var(--tone-bg)] font-mono text-xs font-bold text-[var(--tone-ink)]">
                      3
                    </span>
                    <span className="pt-0.5">
                      Kirim bukti lewat tombol WhatsApp di bawah; pesannya sudah berisi nomor
                      pendaftaran.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--tone-rule)] bg-[var(--tone-bg)] font-mono text-xs font-bold text-[var(--tone-ink)]">
                      4
                    </span>
                    <span className="pt-0.5">
                      Admin memverifikasi pembayaran, lalu mengirim email konfirmasi ke alamat yang
                      sama.
                    </span>
                  </li>
                </ol>

                {whatsappHref ? (
                  <a
                    className="mt-6 flex min-h-12 w-full items-center justify-center gap-2.5 bg-[#25D366] px-5 py-3 text-center font-display text-sm font-semibold text-[#072E16] transition-colors hover:bg-[#1FC25B] active:bg-[#19AA4F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M21 11.6a9 9 0 0 1-13.4 8L3 21l1.3-4.6A9 9 0 1 1 21 11.6Z" />
                      <path
                        d="M8.5 8c-.5.4-.8 1.4-.4 2.5 1.2 2.9 3.2 4.9 6.2 5.6.9.2 1.9-.4 2.2-1.4l-2.4-1.3-.9.9c-1.5-.7-2.4-1.6-3.2-3.1l.7-1.1-1.1-2.2Z"
                        fill="currentColor"
                        strokeWidth=".6"
                      />
                    </svg>
                    <span>Kirim Bukti Transfer ke WhatsApp</span>
                  </a>
                ) : (
                  <p className="mt-6 text-sm text-[var(--tone-muted)]">
                    Nomor WhatsApp admin belum tersedia di data kontak. Hubungi Albana melalui
                    kanal resmi untuk mengirim bukti transfer.
                  </p>
                )}

                <div className="mt-4 space-y-1.5 border-t border-[var(--tone-rule)] pt-4 text-xs leading-relaxed text-[var(--tone-muted)]">
                  {invoice.stage === "initial" ? (
                    <p>
                      Selama 30 menit ke depan, email dan nomor WhatsApp ini belum bisa dipakai
                      untuk pendaftaran baru, kecuali pembayaran sudah diverifikasi. Salah isi data?
                      Hubungi admin lewat WhatsApp.
                    </p>
                  ) : null}
                  <p>Pembayaran diverifikasi manual oleh admin Albana.</p>
                </div>
              </div>
            ) : (
              <div className="border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-5 sm:p-7">
                <p className="border-l-4 border-[var(--tone-accent)] pl-4 text-sm text-[var(--tone-ink)]">
                  Status tagihan:{" "}
                  {invoice.status === "verified"
                    ? "sudah diverifikasi"
                    : invoice.status === "rejected"
                      ? "perlu ditinjau ulang"
                      : "dibatalkan"}
                  . Hubungi admin jika membutuhkan bantuan.
                </p>
                <p className="mt-4 text-xs text-[var(--tone-muted)]">
                  Pembayaran diverifikasi manual oleh admin Albana.
                </p>
              </div>
            )}
          </section>

          <aside className="lg:sticky lg:top-8" aria-label="Rekening pembayaran">
            <div className="border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--tone-muted)]">
                    Transfer bank
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-[var(--tone-ink)]">
                    {bank.bank}
                  </h2>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--tone-rule)] bg-[var(--tone-bg)] text-[var(--tone-accent)]">
                  <Landmark className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-5 border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--tone-muted)]">
                  Nomor rekening
                </p>
                <p className="mt-1.5 break-all font-mono text-2xl font-bold tracking-wider text-[var(--tone-ink)] select-all">
                  {bank.account_number}
                </p>
                <p className="mt-2 text-sm text-[var(--tone-muted)]">
                  a.n. <span className="font-semibold text-[var(--tone-ink)]">{bank.holder}</span>
                </p>
                <div className="mt-4">
                  <CopyAccountButton account={bank.account_number} className="w-full" />
                </div>
              </div>

              {invoice.status === "pending" ? (
                <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-[var(--tone-rule)] pt-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--tone-muted)]">
                    Nominal transfer
                  </span>
                  <span className="tabular-nums text-lg font-bold text-danger dark:text-rose-400">
                    {rupiah(total)}
                  </span>
                </div>
              ) : null}

              <p className="mt-4 border-t border-[var(--tone-rule)] pt-4 text-xs leading-relaxed text-[var(--tone-muted)]">
                Pastikan nama penerima cocok sebelum mentransfer. Sertakan 3 digit kode unik pada
                nominal transfer agar verifikasi lebih cepat.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
