import assert from "node:assert/strict";
import test from "node:test";
import {
  invoiceStageLabel,
  maskEmail,
  paymentConfirmedEmail,
  paymentInstructionsEmail,
  paymentProofMessage,
  paymentRejectedEmail,
} from "./registration-email.ts";

const idr = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const base = {
  registrationId: 41,
  fullName: "Budi Santoso",
  offerTitle: "Public Speaking Series",
  batchNames: "Batch 3",
  paymentMethod: "full",
  stage: "initial",
  invoice: { invoiceId: 77, subtotalIdr: 1_300_000, uniqueCode: 123, totalIdr: 1_300_123 },
  bank: { bank: "BCA", accountNumber: "1234567890", holder: "PT Albana" },
  receiptUrl: "https://albanaspeechacademy.com/register/konfirmasi/41.1799999999.x",
  whatsappUrl: null,
  firstSessionAt: "2026-12-06T01:30:00Z",
  remaining: null,
};

test("stage labels match the receipt page", () => {
  assert.equal(invoiceStageLabel("initial", "full"), "Pembayaran lunas");
  assert.equal(invoiceStageLabel("initial", "dp"), "DP");
  assert.equal(invoiceStageLabel("remaining", "dp"), "Pelunasan");
});

test("instructions email carries the exact transfer data", () => {
  const email = paymentInstructionsEmail(base);
  assert.equal(email.subject, "Instruksi pembayaran pendaftaran – Albana Speech Academy");
  for (const body of [email.html, email.text]) {
    assert.ok(body.includes(idr(1_300_123)));
    assert.equal(body.includes("Kode unik"), false);
    assert.ok(body.includes("3 digit terakhir"));
    assert.ok(body.includes("1234567890"));
    assert.ok(body.includes("PT Albana"));
    assert.equal(body.includes("Lihat halaman pembayaran"), false);
  }
});

test("escapes participant data in html", () => {
  const email = paymentInstructionsEmail({
    ...base,
    fullName: '<img src=x onerror=alert(1)> & "Sari"',
  });
  assert.equal(email.html.includes("<img"), false);
  assert.ok(email.html.includes("&lt;img"));
  assert.ok(email.html.includes("&amp;"));
  assert.ok(email.html.includes("&quot;"));
  assert.ok(email.text.includes('<img src=x onerror=alert(1)> & "Sari"'));
});

test("omits whatsapp button when no contact", () => {
  const withoutWa = paymentInstructionsEmail(base);
  assert.equal(withoutWa.html.includes("wa.me"), false);

  const withWa = paymentInstructionsEmail({
    ...base,
    whatsappUrl: "https://wa.me/62811?text=x&y=1",
  });
  assert.ok(withWa.html.includes("https://wa.me/62811?text=x&amp;y=1"));
});

test("confirmed full payment lists next steps with WIB session time", () => {
  const email = paymentConfirmedEmail(base);
  assert.equal(email.subject, "Pembayaran diterima – pendaftaran terkonfirmasi");
  assert.ok(email.text.includes("6 Desember 2026"));
  assert.ok(email.text.includes("08.30 WIB"));
  assert.equal(email.html.includes("#41"), false);
  assert.equal(email.text.includes("#41"), false);
  assert.equal(email.html.includes("Lihat ringkasan pendaftaran"), false);
  assert.equal(email.text.includes("Lihat ringkasan pendaftaran"), false);
});

test("confirmed DP payment shows remaining invoice", () => {
  const email = paymentConfirmedEmail({
    ...base,
    paymentMethod: "dp",
    invoice: { invoiceId: 77, subtotalIdr: 260_000, uniqueCode: 5, totalIdr: 260_005 },
    remaining: { invoiceId: 78, subtotalIdr: 1_040_000, uniqueCode: 9, totalIdr: 1_040_009 },
  });
  assert.equal(email.subject, "DP diterima – Albana Speech Academy");
  assert.ok(email.text.includes("1.040.009"));
  assert.ok(email.text.includes("Sisa pembayaran"));
  assert.equal(email.html.includes("#41"), false);
});

test("null first session omits the schedule line", () => {
  const email = paymentConfirmedEmail({ ...base, firstSessionAt: null });
  assert.equal(email.text.includes("Sesi pertama"), false);
});

test("maskEmail hides the local part", () => {
  assert.equal(maskEmail("budi.santoso@gmail.com"), "bu***@gmail.com");
  assert.equal(maskEmail("ab@gmail.com"), "a***@gmail.com");
  assert.equal(maskEmail("x@gmail.com"), "x***@gmail.com");
});

test("payment proof message names participant and program", () => {
  const msg = paymentProofMessage({
    registrationId: 41,
    invoiceId: 77,
    fullName: "Budi Santoso",
    offerTitle: "Public Speaking Series",
    batchNames: "Batch 3",
    stageLabel: "Pembayaran lunas",
    totalIdr: 1_300_123,
  });
  assert.ok(msg.includes("Budi Santoso"));
  assert.equal(msg.includes("#41"), false);
  assert.ok(msg.includes("#77"));
  assert.ok(msg.includes(idr(1_300_123)));
  assert.ok(paymentProofMessage({
    registrationId: 41,
    invoiceId: 77,
    invoiceNumber: "ASA-2026-001",
    fullName: "Budi Santoso",
    offerTitle: "Public Speaking Series",
    batchNames: "Batch 3",
    stageLabel: "Pembayaran lunas",
    totalIdr: 1_300_123,
  }).includes("*Tagihan:* ASA-2026-001"));
});

test("rejected payment email notifies participant and escapes html", () => {
  const email = paymentRejectedEmail({
    ...base,
    fullName: '<script>alert(1)</script> Budi',
  });
  assert.equal(email.subject, "Tagihan #77 perlu ditinjau ulang – Albana Speech Academy");
  assert.equal(email.html.includes("<script>"), false);
  assert.ok(email.html.includes("&lt;script&gt;"));
  assert.ok(email.text.includes("ditolak"));
  assert.ok(email.text.includes(base.receiptUrl));
});

test("renders logo header and whatsapp green button when provided", () => {
  const email = paymentInstructionsEmail({
    ...base,
    logoUrl: "cid:albana-logo",
    whatsappUrl: "https://wa.me/62811?text=halo",
  });
  assert.ok(email.html.includes('src="cid:albana-logo"'));
  assert.ok(email.html.includes("background:#128C7E;"));
  assert.ok(email.html.includes("width:100%;box-sizing:border-box;"));
});
