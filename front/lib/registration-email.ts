export type EmailKind = "payment_instructions" | "payment_confirmed" | "payment_rejected";
export type InvoiceStage = "initial" | "remaining";
export type PaymentMethod = "full" | "dp";
export type InvoiceAmounts = {
  invoiceId: number;
  subtotalIdr: number;
  uniqueCode: number;
  totalIdr: number;
};
export type InvoiceEmailData = {
  registrationId: number;
  fullName: string;
  offerTitle: string;
  batchNames: string;
  paymentMethod: PaymentMethod;
  stage: InvoiceStage;
  invoice: InvoiceAmounts;
  bank: { bank: string; accountNumber: string; holder: string };
  receiptUrl: string;
  whatsappUrl: string | null;
  firstSessionAt: string | null;
  remaining: InvoiceAmounts | null;
};
export type RenderedEmail = { subject: string; html: string; text: string };

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const wibFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatRupiah(amount: number): string {
  return idrFormatter.format(amount);
}

function formatWibSchedule(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return `${wibFormatter.format(date)} WIB`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function invoiceStageLabel(
  stage: InvoiceStage,
  method: PaymentMethod,
): "Pembayaran lunas" | "DP" | "Pelunasan" {
  if (stage === "remaining") return "Pelunasan";
  return method === "dp" ? "DP" : "Pembayaran lunas";
}

export function paymentProofMessage(d: {
  registrationId: number;
  invoiceId: number;
  fullName: string;
  offerTitle: string;
  batchNames: string;
  stageLabel: string;
  totalIdr: number;
}): string {
  return `Halo Admin Albana, saya ${d.fullName} mengirim bukti transfer untuk pendaftaran #${d.registrationId} (${d.offerTitle} – ${d.batchNames}), tagihan #${d.invoiceId} (${d.stageLabel}), total ${formatRupiah(d.totalIdr)}.`;
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 0) return "***";
  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function wrapEmailHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f7f6f2;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#1f2421;line-height:1.55;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e2da;border-radius:10px;">
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6b685f;">Albana Speech Academy</p>
        ${bodyHtml}
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderAmountsTable(label: string, amounts: InvoiceAmounts): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;border:1px solid #e5e2da;border-radius:8px;border-collapse:collapse;">
    <tr><td colspan="2" style="padding:10px 14px;background:#f7f6f2;font-size:13px;font-weight:600;border-bottom:1px solid #e5e2da;">Tagihan #${amounts.invoiceId} · ${escapeHtml(label)}</td></tr>
    <tr><td style="padding:8px 14px;font-size:14px;color:#55524b;">Subtotal</td><td style="padding:8px 14px;font-size:14px;text-align:right;">${escapeHtml(formatRupiah(amounts.subtotalIdr))}</td></tr>
    <tr><td style="padding:8px 14px;font-size:14px;color:#55524b;">Kode unik</td><td style="padding:8px 14px;font-size:14px;text-align:right;">${escapeHtml(formatRupiah(amounts.uniqueCode))}</td></tr>
    <tr><td style="padding:10px 14px;font-size:15px;font-weight:700;border-top:1px solid #e5e2da;">Total transfer</td><td style="padding:10px 14px;font-size:15px;font-weight:700;text-align:right;border-top:1px solid #e5e2da;">${escapeHtml(formatRupiah(amounts.totalIdr))}</td></tr>
  </table>`;
}

function renderBankBox(bank: InvoiceEmailData["bank"]): string {
  return `<div style="margin:16px 0;padding:12px 14px;background:#f7f6f2;border:1px solid #e5e2da;border-radius:8px;font-size:14px;">
    <div style="font-weight:600;margin-bottom:4px;">Rekening tujuan</div>
    <div>Bank: <strong>${escapeHtml(bank.bank)}</strong></div>
    <div>Nomor rekening: <strong>${escapeHtml(bank.accountNumber)}</strong></div>
    <div>Atas nama: <strong>${escapeHtml(bank.holder)}</strong></div>
  </div>`;
}

function renderButton(href: string, label: string, primary = true): string {
  const style = primary
    ? "display:inline-block;padding:11px 18px;background:#1f2421;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;"
    : "display:inline-block;padding:10px 16px;background:#ffffff;color:#1f2421;border:1px solid #1f2421;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;";
  return `<a href="${escapeHtml(href)}" style="${style}">${escapeHtml(label)}</a>`;
}

export function paymentInstructionsEmail(d: InvoiceEmailData): RenderedEmail {
  const subject = `Instruksi pembayaran pendaftaran #${d.registrationId} – Albana Speech Academy`;
  const stageLabel = invoiceStageLabel(d.stage, d.paymentMethod);
  const programLine = `${d.offerTitle} – ${d.batchNames}`;

  const waButton = d.whatsappUrl
    ? `<p style="margin:12px 0;">${renderButton(d.whatsappUrl, "Kirim bukti ke WhatsApp Admin", false)}</p>`
    : "";

  const html = wrapEmailHtml(
    subject,
    `<p style="margin:0 0 12px;">Halo ${escapeHtml(d.fullName)},</p>
    <p style="margin:0 0 14px;">Pendaftaranmu untuk <strong>${escapeHtml(programLine)}</strong> sudah kami terima.</p>
    ${renderAmountsTable(stageLabel, d.invoice)}
    ${renderBankBox(d.bank)}
    <p style="margin:16px 0 6px;font-weight:600;">Cara pembayaran:</p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:14px;">
      <li>Transfer <strong>tepat</strong> sebesar total di atas termasuk kode unik.</li>
      <li>Simpan bukti transfer.</li>
      <li>Kirim bukti transfer lewat WhatsApp admin.</li>
      <li>Admin akan memverifikasi pembayaranmu lalu mengirim email konfirmasi.</li>
    </ol>
    ${waButton}
    <p style="margin:16px 0;">${renderButton(d.receiptUrl, "Lihat halaman pembayaran", true)}</p>
    <p style="margin:16px 0 0;font-size:12px;color:#6b685f;">Tautan berlaku 30 hari. Abaikan email ini jika kamu tidak merasa mendaftar.</p>`,
  );

  const textLines = [
    `Halo ${d.fullName},`,
    "",
    `Pendaftaranmu untuk ${programLine} sudah kami terima.`,
    "",
    `Tagihan #${d.invoice.invoiceId} · ${stageLabel}`,
    `Subtotal: ${formatRupiah(d.invoice.subtotalIdr)}`,
    `Kode unik: ${formatRupiah(d.invoice.uniqueCode)}`,
    `Total transfer: ${formatRupiah(d.invoice.totalIdr)}`,
    "",
    "Rekening tujuan:",
    `Bank: ${d.bank.bank}`,
    `Nomor rekening: ${d.bank.accountNumber}`,
    `Atas nama: ${d.bank.holder}`,
    "",
    "Cara pembayaran:",
    "1. Transfer tepat sebesar total di atas termasuk kode unik.",
    "2. Simpan bukti transfer.",
    "3. Kirim bukti transfer lewat WhatsApp admin.",
    "4. Admin akan memverifikasi pembayaranmu lalu mengirim email konfirmasi.",
    ...(d.whatsappUrl ? ["", `WhatsApp Admin: ${d.whatsappUrl}`] : []),
    "",
    `Lihat halaman pembayaran: ${d.receiptUrl}`,
    "",
    "Tautan berlaku 30 hari. Abaikan email ini jika kamu tidak merasa mendaftar.",
  ];

  return { subject, html, text: textLines.join("\n") };
}

export function paymentConfirmedEmail(d: InvoiceEmailData): RenderedEmail {
  const isDpInitial = d.stage === "initial" && d.paymentMethod === "dp";
  const stageLabel = invoiceStageLabel(d.stage, d.paymentMethod);
  const programLine = `${d.offerTitle} – ${d.batchNames}`;
  const firstSession = formatWibSchedule(d.firstSessionAt);

  if (isDpInitial) {
    const subject = `DP diterima – pendaftaran #${d.registrationId}`;
    const remainingBlockHtml = d.remaining
      ? `<p style="margin:16px 0 6px;font-weight:600;">Sisa pembayaran</p>
         ${renderAmountsTable("Pelunasan", d.remaining)}
         ${renderBankBox(d.bank)}
         <p style="margin:12px 0;font-size:14px;">Silakan transfer sisa pembayaran sebelum sesi pertama dimulai.</p>`
      : "";
    const waButton = d.whatsappUrl
      ? `<p style="margin:12px 0;">${renderButton(d.whatsappUrl, "Hubungi Admin via WhatsApp", false)}</p>`
      : "";

    const html = wrapEmailHtml(
      subject,
      `<p style="margin:0 0 12px;">Halo ${escapeHtml(d.fullName)},</p>
      <p style="margin:0 0 14px;">DP sebesar <strong>${escapeHtml(formatRupiah(d.invoice.totalIdr))}</strong> untuk pendaftaran <strong>#${d.registrationId}</strong> (${escapeHtml(programLine)}) sudah kami terima. Tempat kelasmu sudah diamankan.</p>
      ${remainingBlockHtml}
      ${firstSession ? `<p style="margin:12px 0;font-size:14px;">Sesi pertama: <strong>${escapeHtml(firstSession)}</strong></p>` : ""}
      <p style="margin:16px 0;">${renderButton(d.receiptUrl, "Lihat tagihan pelunasan", true)}</p>
      ${waButton}`,
    );

    const textLines = [
      `Halo ${d.fullName},`,
      "",
      `DP sebesar ${formatRupiah(d.invoice.totalIdr)} untuk pendaftaran #${d.registrationId} (${programLine}) sudah kami terima. Tempat kelasmu sudah diamankan.`,
      ...(d.remaining
        ? [
            "",
            "Sisa pembayaran",
            `Tagihan #${d.remaining.invoiceId} · Pelunasan`,
            `Subtotal: ${formatRupiah(d.remaining.subtotalIdr)}`,
            `Kode unik: ${formatRupiah(d.remaining.uniqueCode)}`,
            `Total transfer: ${formatRupiah(d.remaining.totalIdr)}`,
            "",
            "Rekening tujuan:",
            `Bank: ${d.bank.bank}`,
            `Nomor rekening: ${d.bank.accountNumber}`,
            `Atas nama: ${d.bank.holder}`,
            "Silakan transfer sisa pembayaran sebelum sesi pertama dimulai.",
          ]
        : []),
      ...(firstSession ? ["", `Sesi pertama: ${firstSession}`] : []),
      "",
      `Lihat tagihan pelunasan: ${d.receiptUrl}`,
      ...(d.whatsappUrl ? ["", `WhatsApp Admin: ${d.whatsappUrl}`] : []),
    ];

    return { subject, html, text: textLines.join("\n") };
  }

  const subject = `Pembayaran diterima – pendaftaran #${d.registrationId} terkonfirmasi`;
  const waButton = d.whatsappUrl
    ? `<p style="margin:12px 0;">${renderButton(d.whatsappUrl, "Hubungi Admin via WhatsApp", false)}</p>`
    : "";

  const html = wrapEmailHtml(
    subject,
    `<p style="margin:0 0 12px;">Halo ${escapeHtml(d.fullName)},</p>
    <p style="margin:0 0 14px;">${escapeHtml(stageLabel)} sebesar <strong>${escapeHtml(formatRupiah(d.invoice.totalIdr))}</strong> untuk pendaftaran <strong>#${d.registrationId}</strong> sudah kami terima. Kepesertaanmu di <strong>${escapeHtml(programLine)}</strong> terkonfirmasi.</p>
    <p style="margin:16px 0 6px;font-weight:600;">Langkah selanjutnya:</p>
    <ol style="margin:0 0 16px;padding-left:20px;font-size:14px;">
      ${firstSession ? `<li>Sesi pertama dijadwalkan pada <strong>${escapeHtml(firstSession)}</strong>.</li>` : ""}
      <li>Admin akan mengundangmu ke grup WhatsApp kelas melalui nomor yang kamu daftarkan.</li>
      <li>Hubungi admin lewat WhatsApp bila ada pertanyaan.</li>
    </ol>
    ${waButton}
    <p style="margin:16px 0 0;font-size:13px;"><a href="${escapeHtml(d.receiptUrl)}" style="color:#1f2421;">Lihat ringkasan pendaftaran</a></p>`,
  );

  const nextStepsText: string[] = [];
  let stepNum = 1;
  if (firstSession) {
    nextStepsText.push(`${stepNum}. Sesi pertama: ${firstSession}`);
    stepNum += 1;
  }
  nextStepsText.push(
    `${stepNum}. Admin akan mengundangmu ke grup WhatsApp kelas melalui nomor yang kamu daftarkan.`,
  );
  stepNum += 1;
  nextStepsText.push(`${stepNum}. Hubungi admin lewat WhatsApp bila ada pertanyaan.`);

  const textLines = [
    `Halo ${d.fullName},`,
    "",
    `${stageLabel} sebesar ${formatRupiah(d.invoice.totalIdr)} untuk pendaftaran #${d.registrationId} sudah kami terima. Kepesertaanmu di ${programLine} terkonfirmasi.`,
    "",
    "Langkah selanjutnya:",
    ...nextStepsText,
    ...(d.whatsappUrl ? ["", `WhatsApp Admin: ${d.whatsappUrl}`] : []),
    "",
    `Lihat ringkasan pendaftaran: ${d.receiptUrl}`,
  ];

  return { subject, html, text: textLines.join("\n") };
}

export function paymentRejectedEmail(d: InvoiceEmailData): RenderedEmail {
  const subject = `Tagihan #${d.invoice.invoiceId} perlu ditinjau ulang – pendaftaran #${d.registrationId}`;
  const stageLabel = invoiceStageLabel(d.stage, d.paymentMethod);
  const programLine = `${d.offerTitle} – ${d.batchNames}`;
  const waButton = d.whatsappUrl
    ? `<p style="margin:14px 0;">${renderButton(d.whatsappUrl, "Hubungi Admin via WhatsApp", true)}</p>`
    : "";

  const html = wrapEmailHtml(
    subject,
    `<p style="margin:0 0 12px;">Halo ${escapeHtml(d.fullName)},</p>
    <p style="margin:0 0 14px;">Tagihan <strong>#${d.invoice.invoiceId}</strong> (${escapeHtml(stageLabel)}) sebesar <strong>${escapeHtml(formatRupiah(d.invoice.totalIdr))}</strong> untuk pendaftaran <strong>#${d.registrationId}</strong> (${escapeHtml(programLine)}) belum dapat kami verifikasi (ditolak).</p>
    <p style="margin:0 0 14px;font-size:14px;">Silakan hubungi admin melalui WhatsApp untuk konfirmasi atau penyelesaian pembayaran, atau periksa status tagihan pada halaman pembayaran.</p>
    ${waButton}
    <p style="margin:14px 0 0;font-size:13px;"><a href="${escapeHtml(d.receiptUrl)}" style="color:#1f2421;">Lihat halaman pembayaran</a></p>`,
  );

  const textLines = [
    `Halo ${d.fullName},`,
    "",
    `Tagihan #${d.invoice.invoiceId} (${stageLabel}) sebesar ${formatRupiah(d.invoice.totalIdr)} untuk pendaftaran #${d.registrationId} (${programLine}) belum dapat kami verifikasi (ditolak).`,
    "",
    "Silakan hubungi admin melalui WhatsApp untuk konfirmasi atau penyelesaian pembayaran, atau periksa status tagihan pada halaman pembayaran.",
    ...(d.whatsappUrl ? ["", `WhatsApp Admin: ${d.whatsappUrl}`] : []),
    "",
    `Lihat halaman pembayaran: ${d.receiptUrl}`,
  ];

  return { subject, html, text: textLines.join("\n") };
}
