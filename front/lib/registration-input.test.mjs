import assert from "node:assert/strict";
import test from "node:test";
import { parseRegistration } from "./registration-input.ts";

const input = {
  batch: "test-series", consent: true, formKind: "series", priceIdr: 100,
  paymentMethod: "full", fullName: "Test", email: "TEST@example.invalid", whatsapp: "'0812-0000-0000",
  answers: {
    nickname: "Test", domicile: "Test", profession: "Test", goal: "Test", challenge: "Test",
    age: 25, gender: "Perempuan", priorExperience: false, source: "referral", attendance: "maybe",
  },
};

test("ketiga formulir mempertahankan pertanyaan khusus program", () => {
  const answers = { ...input.answers, challenge: undefined };
  for (const formKind of ["series", "exclusive"]) {
    assert.ok(parseRegistration({ ...input, formKind }));
    assert.equal(parseRegistration({ ...input, formKind, answers }), null);
  }
  const result = parseRegistration({ ...input, formKind: "bnsp", answers });
  assert.equal(result.participant.answers.challenge, null);
  assert.equal(result.participant.email, "test@example.invalid");
  assert.equal(result.participant.whatsapp, "081200000000");
});

test("tolak isian rusak atau persetujuan yang hilang", () => {
  for (const changes of [{ consent: false }, { priceIdr: -1 }, { paymentMethod: "dp" }, { email: "invalid" },
    { answers: { ...input.answers, source: "other" } }, { answers: { ...input.answers, socials: ["unknown"] } },
    { answers: { ...input.answers, age: 2.5 } }, { answers: { ...input.answers, institution: "x".repeat(501) } }]) {
    assert.equal(parseRegistration({ ...input, ...changes }), null);
  }
});
