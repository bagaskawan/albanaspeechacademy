"use client";

import { useEffect, useRef } from "react";
import type { RegistrationBatch } from "@/lib/registration";

export function RegistrationReceipt({ batch, whatsappHref }: { batch: RegistrationBatch; whatsappHref?: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => titleRef.current?.focus(), []);

  return (
    <section className="mt-10 border-t border-rule pt-8" aria-labelledby="receipt-title">
      <p className="eyebrow">Formulir diterima</p>
      <h2 id="receipt-title" ref={titleRef} tabIndex={-1} className="mt-2 text-2xl font-semibold">
        Pendaftaranmu sudah kami terima
      </h2>
      <p className="mt-4 text-muted">
        Admin akan menghubungimu melalui WhatsApp atau email untuk {batch.programName} · {batch.batchName}.
        Kepesertaan dikonfirmasi setelah pembayaran diverifikasi admin.
      </p>
      <ol className="mt-6 grid list-decimal gap-3 pl-5">
        <li>Admin mengirim nominal dan petunjuk pembayaran.</li>
        <li>Setelah membayar, kirim bukti melalui WhatsApp resmi.</li>
        <li>Admin memverifikasi pembayaran dan mengonfirmasi pendaftaran.</li>
      </ol>
      {whatsappHref ? <a className="button-primary mt-7" href={whatsappHref} rel="noopener noreferrer" target="_blank">
        Hubungi admin via WhatsApp <span aria-hidden="true">↗</span>
      </a> : <p className="mt-7 text-sm text-muted">Kanal WhatsApp sedang tidak tersedia. Admin akan menghubungi melalui data yang kamu kirim.</p>}
      <p className="mt-6 border-t border-rule pt-5 text-sm text-muted">
        Jika berhalangan hadir, ajukan penjadwalan ulang melalui admin. Pembayaran tidak dikembalikan.
      </p>
    </section>
  );
}
