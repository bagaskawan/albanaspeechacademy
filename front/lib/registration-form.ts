import type {
  RegistrationBatch,
  RegistrationFormCopy,
  RegistrationFormKind,
  VariantCopy,
} from "@/lib/registration";

export type { RegistrationFormCopy, VariantCopy };

export type RegistrationValues = {
  fullName: string;
  nickname: string;
  domicile: string;
  whatsapp: string;
  email: string;
  gender: "" | "Perempuan" | "Laki-laki";
  age: string;
  profession: string;
  institution: string;
  socialName: string;
  priorExperience: "" | "yes" | "no";
  goal: string;
  challenge: string;
  source: "" | "instagram" | "whatsapp" | "referral" | "other";
  sourceOther: string;
  attendance: "" | "yes" | "maybe";
  paymentMethod: "" | "full" | "dp";
  consent: boolean;
};

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>;

const VARIANT_COPY: Record<RegistrationFormKind, Omit<RegistrationFormCopy, "attendanceLabel">> = {
  series: {
    priorExperienceLabel: "Apakah pernah mengikuti pelatihan Public Speaking sebelumnya?",
    goalLabel: "Apa tujuan utama mengikuti Public Speaking Series ini?",
    challengeLabel: "Apa tantangan terbesar Anda dalam aktivitas Public Speaking?",
  },
  exclusive: {
    priorExperienceLabel: "Apakah pernah mengikuti pelatihan Speaker sebelumnya?",
    goalLabel: "Apa tujuan utama mengikuti Public Speaking Training for Speakers ini?",
    challengeLabel: 'Apa tantangan terbesar Anda saat menjadi pembicara atau "speaker"?',
  },
  bnsp: {
    priorExperienceLabel: "Apakah pernah mengikuti sertifikasi BNSP sebelumnya?",
    goalLabel: "Apa tujuan utama mengikuti Sertifikasi Professional Speakers by BNSP?",
    challengeLabel: null,
  },
};

export function registrationVariantCopy(formKind: RegistrationFormKind): Omit<RegistrationFormCopy, "attendanceLabel"> {
  return VARIANT_COPY[formKind];
}

// Program-specific wording (set from admin) wins; otherwise the form variant
// supplies it. Attendance always follows the batch schedule shown above it.
export function registrationFormCopy(batch: RegistrationBatch): RegistrationFormCopy {
  const base = registrationVariantCopy(batch.formKind);
  return {
    priorExperienceLabel: batch.formCopy?.priorExperienceLabel ?? base.priorExperienceLabel,
    goalLabel: batch.formCopy?.goalLabel ?? base.goalLabel,
    challengeLabel: batch.formKind === "bnsp" ? null : batch.formCopy?.challengeLabel ?? base.challengeLabel,
    attendanceLabel: `Kesediaan mengikuti pelatihan penuh (${batch.formatLabel} · ${batch.timeLabel})`,
  };
}

export const genderOptions = [
  { value: "Perempuan", label: "Perempuan" },
  { value: "Laki-laki", label: "Laki-laki" },
] as const;

export const sourceOptions = [
  { value: "instagram", label: "Instagram (@albanaspeechacademy)" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Teman atau Kerabat" },
  { value: "other", label: "Lainnya" },
] as const;

export const MAX_GOAL = 2000;
export const MAX_CHALLENGE = 2000;
export const MAX_NAME = 160;
export const MAX_EMAIL = 254;
export const MAX_WHATSAPP_DIGITS = 14;
export const MAX_WHATSAPP = 17; // 14 digits plus 3 separators
export const MAX_TEXT = 500;

export function emptyRegistrationValues(): RegistrationValues {
  return {
    fullName: "",
    nickname: "",
    domicile: "",
    whatsapp: "",
    email: "",
    gender: "",
    age: "",
    profession: "",
    institution: "",
    socialName: "",
    priorExperience: "",
    goal: "",
    challenge: "",
    source: "",
    sourceOther: "",
    attendance: "",
    paymentMethod: "",
    consent: false,
  };
}

// Mirrors parseRegistration in registration-input.ts so client errors precede the
// server's single aggregate 422 message.
export function cleanWhatsapp(value: string): string {
  return value.trim().replace(/^'/, "").replace(/[ ()-]/g, "");
}

// Phone input only: digits grouped four at a time, 14 digits at most.
// shortcut: caret jumps to the end when editing mid-number; upgrade if users need mid-number edits.
export function formatWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, MAX_WHATSAPP_DIGITS);
  return digits.replace(/(\d{4})(?=\d)/g, "$1-");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^\+?\d{8,14}$/;

export function validateRegistration(
  values: RegistrationValues,
  batch: RegistrationBatch,
): RegistrationErrors {
  const errors: RegistrationErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Nama lengkap wajib diisi.";
  else if (values.fullName.trim().length > MAX_NAME) errors.fullName = `Maksimal ${MAX_NAME} karakter.`;
  if (!values.nickname.trim()) errors.nickname = "Nama panggilan wajib diisi.";
  else if (values.nickname.trim().length > MAX_NAME) errors.nickname = `Maksimal ${MAX_NAME} karakter.`;
  if (!values.domicile.trim()) errors.domicile = "Domisili wajib diisi.";
  else if (values.domicile.trim().length > MAX_TEXT) errors.domicile = `Maksimal ${MAX_TEXT} karakter.`;
  if (values.email.trim().length > MAX_EMAIL) errors.email = `Maksimal ${MAX_EMAIL} karakter.`;
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = "Alamat email tidak valid.";
  const whatsapp = cleanWhatsapp(values.whatsapp);
  if (values.whatsapp.trim().length > MAX_WHATSAPP) errors.whatsapp = "Maksimal 14 digit.";
  else if (!WHATSAPP_RE.test(whatsapp)) errors.whatsapp = "Nomor WhatsApp harus 8–14 digit.";
  if (!values.gender) errors.gender = "Pilih jenis kelamin.";
  const age = Number(values.age);
  if (!values.age.trim() || !Number.isInteger(age) || age <= 0 || age > 150) {
    errors.age = "Usia harus bilangan bulat 1–150.";
  }
  if (!values.profession.trim()) errors.profession = "Pekerjaan wajib diisi.";
  else if (values.profession.trim().length > MAX_TEXT) errors.profession = `Maksimal ${MAX_TEXT} karakter.`;
  if (values.institution.trim().length > MAX_TEXT) errors.institution = `Maksimal ${MAX_TEXT} karakter.`;
  if (!values.priorExperience) errors.priorExperience = "Pilih salah satu.";
  if (!values.goal.trim()) errors.goal = "Tujuan wajib diisi.";
  else if (values.goal.trim().length > MAX_GOAL) errors.goal = `Maksimal ${MAX_GOAL} karakter.`;
  if (batch.formKind !== "bnsp") {
    if (!values.challenge.trim()) errors.challenge = "Tantangan wajib diisi.";
    else if (values.challenge.trim().length > MAX_CHALLENGE) {
      errors.challenge = `Maksimal ${MAX_CHALLENGE} karakter.`;
    }
  }
  if (!values.source) errors.source = "Pilih sumber informasi.";
  if (values.source === "other" && !values.sourceOther.trim()) {
    errors.sourceOther = "Sebutkan sumber lainnya.";
  } else if (values.sourceOther.trim().length > MAX_TEXT) {
    errors.sourceOther = `Maksimal ${MAX_TEXT} karakter.`;
  }
  if (values.socialName.trim().length > MAX_TEXT) errors.socialName = `Maksimal ${MAX_TEXT} karakter.`;
  if (!values.attendance) errors.attendance = "Pilih kesediaan mengikuti.";
  if (!values.paymentMethod) errors.paymentMethod = "Pilih metode pembayaran.";
  else if (values.paymentMethod === "dp" && batch.dpPercent === null) {
    errors.paymentMethod = "Opsi DP belum tersedia untuk batch ini.";
  }
  if (!values.consent) errors.consent = "Persetujuan wajib dicentang.";

  return errors;
}

export type RegistrationStepId = "identity" | "background" | "technical" | "payment";

export type RegistrationStep = {
  id: RegistrationStepId;
  title: string;
  fields: readonly (keyof RegistrationValues)[];
};

export const REGISTRATION_STEPS: readonly RegistrationStep[] = [
  {
    id: "identity",
    title: "Data diri",
    fields: ["fullName", "nickname", "domicile", "whatsapp", "email", "gender", "age", "profession", "institution"],
  },
  {
    id: "background",
    title: "Latar belakang dan motivasi",
    fields: ["priorExperience", "goal", "challenge"],
  },
  {
    id: "technical",
    title: "Informasi teknis",
    fields: ["socialName", "source", "sourceOther", "attendance"],
  },
  {
    id: "payment",
    title: "Pembayaran dan persetujuan",
    fields: ["paymentMethod", "consent"],
  },
];

// Gates one wizard step: the full rules, filtered to the fields that step shows.
export function validateRegistrationStep(
  values: RegistrationValues,
  batch: RegistrationBatch,
  stepId: RegistrationStepId,
): RegistrationErrors {
  const step = REGISTRATION_STEPS.find((item) => item.id === stepId);
  if (!step) return {};
  const all = validateRegistration(values, batch);
  const errors: RegistrationErrors = {};
  for (const field of step.fields) {
    if (all[field]) errors[field] = all[field];
  }
  return errors;
}

function trimmed(value: string): string {
  return value.trim();
}

export function buildRegistrationPayload(
  values: RegistrationValues,
  batch: RegistrationBatch,
): Record<string, unknown> {
  const formKind = batch.formKind;
  const answers = {
    nickname: trimmed(values.nickname),
    domicile: trimmed(values.domicile),
    profession: trimmed(values.profession),
    institution: trimmed(values.institution),
    age: Number(values.age),
    gender: values.gender,
    priorExperience: values.priorExperience === "yes",
    goal: trimmed(values.goal),
    challenge: formKind === "bnsp" ? "" : trimmed(values.challenge),
    attendance: values.attendance,
    source: values.source,
    sourceOther: trimmed(values.sourceOther),
    socialName: trimmed(values.socialName),
  };

  return {
    batch: batch.batchSlug,
    consent: true,
    formKind,
    priceIdr: batch.priceIdr,
    paymentMethod: values.paymentMethod,
    dpPercent: values.paymentMethod === "dp" ? batch.dpPercent : undefined,
    fullName: trimmed(values.fullName),
    email: trimmed(values.email),
    whatsapp: cleanWhatsapp(values.whatsapp),
    answers,
  };
}
