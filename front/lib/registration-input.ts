export function isSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 160 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function field(value: unknown, max = 500) {
  return typeof value === "string" && value.trim().length <= max ? value.trim() : "";
}

function oneOf(value: unknown, choices: readonly string[]): value is string {
  return typeof value === "string" && choices.includes(value);
}

export function parseRegistration(input: unknown) {
  if (!record(input) || !isSlug(input.batch) || input.consent !== true) return null;
  const { formKind, paymentMethod, priceIdr, dpPercent } = input;
  if (!oneOf(formKind, ["series", "exclusive", "bnsp"]) || !oneOf(paymentMethod, ["full", "dp"])) return null;
  if (typeof priceIdr !== "number" || !Number.isSafeInteger(priceIdr) || priceIdr < 0 || priceIdr > 999999999999) return null;
  if (paymentMethod === "dp" && (typeof dpPercent !== "number" || !Number.isInteger(dpPercent) || dpPercent < 1 || dpPercent > 99)) return null;

  const fullName = field(input.fullName, 160);
  const email = field(input.email, 254).toLowerCase();
  const whatsapp = field(input.whatsapp, 30).replace(/^'/, "").replace(/[ ()-]/g, "");
  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?\d{8,14}$/.test(whatsapp)) return null;

  const a = input.answers;
  if (!record(a)) return null;
  for (const key of ["institution", "socialName", "socialOther", "sourceOther"]) {
    const value = a[key];
    if (value != null && (typeof value !== "string" || value.trim().length > 500)) return null;
  }
  const nickname = field(a.nickname, 160), domicile = field(a.domicile), profession = field(a.profession);
  const goal = field(a.goal, 2000), challenge = field(a.challenge, 2000);
  if (!nickname || !domicile || !profession || !goal || (formKind !== "bnsp" && !challenge)) return null;
  if (typeof a.age !== "number" || !Number.isInteger(a.age) || a.age <= 0 || a.age > 150) return null;
  if (!oneOf(a.gender, ["Perempuan", "Laki-laki"]) || typeof a.priorExperience !== "boolean") return null;
  if (!oneOf(a.source, ["instagram", "whatsapp", "referral", "other"]) || !oneOf(a.attendance, ["yes", "maybe"])) return null;
  const sourceOther = field(a.sourceOther);
  if (a.source === "other" && !sourceOther) return null;
  const socials = a.socials ?? [];
  if (!Array.isArray(socials) || socials.length > 5 || !socials.every(s => oneOf(s, ["instagram","tiktok","facebook","linkedin","other"]))) return null;
  const socialOther = field(a.socialOther);
  if (socials.includes("other") && !socialOther) return null;
  return {
    batch: input.batch,
    participant: {
      fullName, email, whatsapp, formKind, priceIdr, paymentMethod, dpPercent: paymentMethod === "dp" ? dpPercent : null,
      answers: { nickname, domicile, profession, goal, challenge: formKind === "bnsp" ? null : challenge,
        institution: field(a.institution), age: a.age, gender: a.gender, priorExperience: a.priorExperience,
        attendance: a.attendance, source: a.source, sourceOther: a.source === "other" ? sourceOther : null,
        socials, socialOther: socials.includes("other") ? socialOther : null, socialName: field(a.socialName) },
    },
  };
}
