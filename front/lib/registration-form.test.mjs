import assert from "node:assert/strict";
import test from "node:test";
import { parseRegistration } from "./registration-input.ts";
import {
  REGISTRATION_STEPS,
  buildRegistrationPayload, confirmationSummary, emptyRegistrationValues, formatSocialHandle, formatWhatsapp, registrationFormCopy,
  registrationVariantCopy, validateRegistration,
  validateRegistrationStep,
} from "./registration-form.ts";

const batch = { batchSlug: "s1", programName: "P", batchName: "B", formatLabel: "4 pertemuan",
  timeLabel: "09.00–17.00 WIB", sessions: [], venue: { name: "V", address: "A" },
  formKind: "series", formCopy: null, priceIdr: 1500000, normalPriceIdr: null, feeDetails: null, dpPercent: 20 };

const filled = () => ({ ...emptyRegistrationValues(), fullName: "Budi", nickname: "Bud", domicile: "Bandung",
  whatsapp: "'0812-3456-7890", email: "budi@example.invalid", gender: "Laki-laki", age: "25",
  profession: "Karyawan", priorExperience: "yes", goal: "Tujuan", challenge: "Tantangan", source: "instagram",
  attendance: "yes", paymentMethod: "full", consent: true });

test("naskah bnsp menyembunyikan tantangan, series menampilkannya", () => {
  assert.equal(registrationVariantCopy("bnsp").challengeLabel, null);
  assert.match(registrationVariantCopy("series").challengeLabel, /tantangan/i);
});

test("nomor WhatsApp diformat per 4 digit dan berhenti di 14 digit", () => {
  assert.equal(formatWhatsapp("021212312123"), "0212-1231-2123");
  assert.equal(formatWhatsapp("0212 1231-2123"), "0212-1231-2123");
  assert.equal(formatWhatsapp("0212123121234567"), "0212-1231-2123-45");
  assert.equal(formatWhatsapp("abc"), "");
  const errors = validateRegistration({ ...filled(), whatsapp: "0".repeat(15) }, batch);
  assert.ok(errors.whatsapp);
  assert.equal(validateRegistration({ ...filled(), whatsapp: formatWhatsapp("0".repeat(14)) }, batch).whatsapp, undefined);
});

test("naskah dari admin menimpa naskah varian", () => {
  const copy = registrationFormCopy({ ...batch, formCopy: { goalLabel: "Tujuan khusus?" } });
  assert.equal(copy.goalLabel, "Tujuan khusus?");
  assert.match(copy.priorExperienceLabel, /Public Speaking/);
  assert.equal(copy.attendanceLabel, "Kesediaan mengikuti pelatihan penuh (4 pertemuan · 09.00–17.00 WIB)");
  const bnsp = registrationFormCopy({ ...batch, formKind: "bnsp", formCopy: { challengeLabel: "Diabaikan" } });
  assert.equal(bnsp.challengeLabel, null);
});

test("nilai kurang menandai field wajib", () => {
  const errors = validateRegistration(emptyRegistrationValues(), batch);
  for (const key of ["fullName", "email", "whatsapp", "gender", "age", "profession", "goal", "challenge", "source", "attendance", "paymentMethod"]) {
    assert.ok(errors[key], `harus ada error untuk ${key}`);
  }
});

test("pilihan Lainnya butuh keterangan, media sosial opsional", () => {
  const errors = validateRegistration({ ...filled(), source: "other", sourceOther: "" }, batch);
  assert.ok(errors.sourceOther);
  assert.equal(validateRegistration({ ...filled(), instagram: "", tiktok: "", youtube: "", linkedin: "" }, batch).instagram, undefined);
  const payload = buildRegistrationPayload({
    ...filled(),
    instagram: "@budi",
    tiktok: "@budi.tt",
    youtube: "@budichannel",
    linkedin: "linkedin.com/in/budi",
  }, batch);
  const parsed = parseRegistration(payload);
  assert.equal(parsed.participant.answers.instagram, "@budi");
  assert.equal(parsed.participant.answers.tiktok, "@budi.tt");
  assert.equal(parsed.participant.answers.youtube, "@budichannel");
  assert.equal(parsed.participant.answers.linkedin, "linkedin.com/in/budi");

  assert.equal(formatSocialHandle("budi"), "@budi");
  assert.equal(formatSocialHandle("@budi"), "@budi");
  assert.equal(formatSocialHandle("@@budi"), "@budi");
  assert.equal(formatSocialHandle("@"), "");
  assert.equal(formatSocialHandle(""), "");

});

test("batas panjang klien mengikuti validator server untuk Series", () => {
  for (const [field, value] of [
    ["fullName", "x".repeat(161)],
    ["nickname", "x".repeat(161)],
    ["domicile", "x".repeat(501)],
    ["whatsapp", "0".repeat(31)],
    ["email", `a${"x".repeat(250)}@b.c`],
    ["profession", "x".repeat(501)],
    ["institution", "x".repeat(501)],
    ["instagram", "x".repeat(501)],
    ["tiktok", "x".repeat(501)],
    ["youtube", "x".repeat(501)],
    ["linkedin", "x".repeat(501)],
    ["sourceOther", "x".repeat(501)],
  ]) {
    const values = { ...filled(), [field]: value };
    assert.ok(validateRegistration(values, batch)[field], field);
    assert.equal(parseRegistration(buildRegistrationPayload(values, batch)), null, field);
  }
});

test("payload lolos parseRegistration untuk tiap varian", () => {
  for (const formKind of ["series", "exclusive", "bnsp"]) {
    const b = { ...batch, formKind };
    const payload = buildRegistrationPayload(filled(), b);
    const parsed = parseRegistration(payload);
    assert.ok(parsed, `gagal untuk ${formKind}`);
    if (formKind === "bnsp") assert.equal(parsed.participant.answers.challenge, null);
    else assert.equal(parsed.participant.answers.challenge, "Tantangan");
    assert.equal(parsed.participant.whatsapp, "081234567890");
  }
});

test("DP tanpa dpPercent batch ditolak klien", () => {
  const errors = validateRegistration({ ...filled(), paymentMethod: "dp" }, { ...batch, dpPercent: null });
  assert.ok(errors.paymentMethod);
});

test("setiap field dimiliki tepat satu langkah", () => {
  const owned = REGISTRATION_STEPS.flatMap((step) => step.fields);
  assert.equal(new Set(owned).size, owned.length, "ada field dobel antar langkah");
  assert.deepEqual([...owned].sort(), Object.keys(emptyRegistrationValues()).sort());
});

test("validateRegistrationStep hanya mengembalikan error langkah itu", () => {
  const errors = validateRegistrationStep(emptyRegistrationValues(), batch, "identity");
  assert.ok(errors.fullName);
  assert.ok(errors.email);
  assert.equal(errors.goal, undefined);
  assert.equal(errors.paymentMethod, undefined);
});

test("langkah terisi lolos untuk tiap varian, termasuk bnsp tanpa tantangan", () => {
  for (const formKind of ["series", "exclusive", "bnsp"]) {
    const values = { ...filled(), challenge: formKind === "bnsp" ? "" : "Tantangan" };
    const variantBatch = { ...batch, formKind };
    for (const step of REGISTRATION_STEPS) {
      assert.deepEqual(validateRegistrationStep(values, variantBatch, step.id), {}, `${formKind}/${step.id}`);
    }
  }
});

test("field kondisional memblokir langkahnya sendiri", () => {
  const errors = validateRegistrationStep({ ...filled(), source: "other", sourceOther: "" }, batch, "technical");
  assert.ok(errors.sourceOther);
  assert.equal(errors.goal, undefined);
});

test("pilihan paket mengirim harga paket dan DP paket", () => {
  const bundled = { ...batch, formKind: "exclusive", priceIdr: 2_900_000, dpPercent: 20 };
  const payload = buildRegistrationPayload({ ...filled(), paymentMethod: "dp" }, bundled);
  assert.equal(payload.priceIdr, 2_900_000);
  assert.equal(payload.dpPercent, 20);
  assert.ok(parseRegistration(payload));
});

test("confirmation summary lists identity, program, and transfer now", () => {
  const b = { ...batch, programName: "Public Speaking Series", batchName: "Batch 3", priceIdr: 1_300_000, dpPercent: 20 };
  const v = {
    ...filled(),
    fullName: "Budi",
    email: "budi@x.id",
    whatsapp: "0812-3456-7890",
    paymentMethod: "dp",
  };
  const rows = confirmationSummary(v, b, null);
  assert.deepEqual(
    rows.map((r) => r.label),
    ["Nama lengkap", "Email", "WhatsApp", "Program", "Pembayaran", "Transfer sekarang"],
  );
  assert.equal(rows[3].value, "Public Speaking Series – Batch 3");
  assert.equal(rows[4].value, "DP 20%");
  assert.ok(rows[5].value.includes("260.000"));
  assert.ok(rows[5].value.endsWith(" + kode unik"));

  const bundleRows = confirmationSummary({ ...v, paymentMethod: "full" }, b, "Paket Speaker + BNSP");
  assert.equal(bundleRows[3].value, "Paket Speaker + BNSP");
  assert.equal(bundleRows[4].value, "Lunas");
});
