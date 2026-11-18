"use client";

import { RadioGroup, TextArea, TextField } from "@/components/ui/field";
import { formatRupiah } from "@/lib/format";
import { paymentSummary } from "@/lib/bundle";
import {
  MAX_CHALLENGE,
  MAX_EMAIL,
  MAX_GOAL,
  MAX_NAME,
  MAX_TEXT,
  formatSocialHandle,
  formatWhatsapp,
  genderOptions,
  sourceOptions,
  type RegistrationErrors,
  type RegistrationFormCopy,
  type RegistrationStepId,
  type RegistrationValues,
} from "@/lib/registration-form";

type RegistrationStepFieldsProps = {
  stepId: RegistrationStepId;
  values: RegistrationValues;
  errors: RegistrationErrors;
  copy: RegistrationFormCopy;
  priceIdr: number;
  dpPercent: number | null;
  onUpdate: <K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) => void;
};

export function RegistrationStepFields({
  stepId,
  values,
  errors,
  copy,
  priceIdr,
  dpPercent,
  onUpdate,
}: RegistrationStepFieldsProps) {
  if (stepId === "identity") {
    return (
      <>
        <TextField id="fullName" label="Nama lengkap" value={values.fullName} onChange={(v) => onUpdate("fullName", v)} autoComplete="name" maxLength={MAX_NAME} placeholder="Nama sesuai identitas" required error={errors.fullName} />
        <TextField id="nickname" label="Nama panggilan" value={values.nickname} onChange={(v) => onUpdate("nickname", v)} maxLength={MAX_NAME} placeholder="Nama yang biasa dipakai" required error={errors.nickname} />
        <TextField id="domicile" label="Domisili" value={values.domicile} onChange={(v) => onUpdate("domicile", v)} maxLength={MAX_TEXT} placeholder="Kota atau kabupaten" required error={errors.domicile} />
        <TextField id="whatsapp" label="Nomor WhatsApp" value={values.whatsapp} onChange={(v) => onUpdate("whatsapp", formatWhatsapp(v))} type="tel" inputMode="tel" autoComplete="tel" placeholder="0212-1231-2123" hint="" required error={errors.whatsapp} />
        <TextField id="email" label="Email" value={values.email} onChange={(v) => onUpdate("email", v)} type="email" inputMode="email" autoComplete="email" maxLength={MAX_EMAIL} placeholder="nama@email.com" required error={errors.email} />
        <RadioGroup id="gender" label="Jenis kelamin" name="gender" value={values.gender} onChange={(v) => onUpdate("gender", v as RegistrationValues["gender"])} options={genderOptions} required error={errors.gender} />
        <TextField id="age" label="Usia" value={values.age} onChange={(v) => onUpdate("age", v)} type="number" inputMode="numeric" required error={errors.age} />
        <TextField id="profession" label="Jabatan atau profesi" value={values.profession} onChange={(v) => onUpdate("profession", v)} maxLength={MAX_TEXT} required error={errors.profession} />
        <TextField id="institution" label="Instansi, perusahaan, atau komunitas" value={values.institution} onChange={(v) => onUpdate("institution", v)} maxLength={MAX_TEXT} hint="Opsional, isi jika ada." error={errors.institution} />
      </>
    );
  }

  if (stepId === "background") {
    return (
      <>
        <RadioGroup
          id="priorExperience"
          label={copy.priorExperienceLabel}
          name="priorExperience"
          value={values.priorExperience}
          onChange={(v) => onUpdate("priorExperience", v as RegistrationValues["priorExperience"])}
          options={[
            { value: "yes", label: "Ya" },
            { value: "no", label: "Belum pernah" },
          ]}
          required
          error={errors.priorExperience}
        />
        <TextArea id="goal" label={copy.goalLabel} value={values.goal} onChange={(v) => onUpdate("goal", v)} maxLength={MAX_GOAL} required error={errors.goal} />
        {copy.challengeLabel ? (
          <TextArea id="challenge" label={copy.challengeLabel} value={values.challenge} onChange={(v) => onUpdate("challenge", v)} maxLength={MAX_CHALLENGE} required error={errors.challenge} />
        ) : null}
      </>
    );
  }

  if (stepId === "technical") {
    return (
      <>
        <fieldset className="flex flex-col gap-3">
          <legend className="type-small font-medium text-[var(--tone-ink)]">
            Media sosial
          </legend>
          <p className="eyebrow normal-case text-[var(--tone-muted)]">
            Opsional. Isi akun yang ingin dihubungkan.
          </p>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <TextField
              id="instagram"
              label="INSTAGRAM"
              value={values.instagram}
              onChange={(v) => onUpdate("instagram", formatSocialHandle(v))}
              maxLength={MAX_TEXT}
              placeholder="@ username"
              error={errors.instagram}
            />
            <TextField
              id="tiktok"
              label="TIKTOK"
              value={values.tiktok}
              onChange={(v) => onUpdate("tiktok", formatSocialHandle(v))}
              maxLength={MAX_TEXT}
              placeholder="@ username"
              error={errors.tiktok}
            />
            <TextField
              id="youtube"
              label="YOUTUBE"
              value={values.youtube}
              onChange={(v) => onUpdate("youtube", v)}
              maxLength={MAX_TEXT}
              placeholder="Channel / @handle"
              error={errors.youtube}
            />
            <TextField
              id="linkedin"
              label="LINKEDIN"
              value={values.linkedin}
              onChange={(v) => onUpdate("linkedin", v)}
              maxLength={MAX_TEXT}
              placeholder="linkedin.com/in/username"
              error={errors.linkedin}
            />
          </div>
        </fieldset>
        <RadioGroup id="source" label="Dari mana kamu mengetahui kelas ini?" name="source" value={values.source} onChange={(v) => onUpdate("source", v as RegistrationValues["source"])} options={sourceOptions} required error={errors.source} />
        {values.source === "other" ? (
          <TextField id="sourceOther" label="Sebutkan sumber lainnya" value={values.sourceOther} onChange={(v) => onUpdate("sourceOther", v)} maxLength={MAX_TEXT} required error={errors.sourceOther} />
        ) : null}
        <RadioGroup
          id="attendance"
          label={copy.attendanceLabel}
          name="attendance"
          value={values.attendance}
          onChange={(v) => onUpdate("attendance", v as RegistrationValues["attendance"])}
          options={[
            { value: "yes", label: "Ya, bersedia" },
            { value: "maybe", label: "Belum bisa memastikan" },
          ]}
          required
          error={errors.attendance}
        />
      </>
    );
  }

  const dpAmount = dpPercent === null ? null : paymentSummary(priceIdr, dpPercent, "dp").payNowIdr;
  const summary = paymentSummary(priceIdr, dpPercent, values.paymentMethod);
  return (
    <>
      <p id="pembayaran" className="text-sm text-muted">
        Admin akan mengirim nominal dan petunjuk pembayaran setelah formulir diterima. Kepesertaan dikonfirmasi setelah pembayaran diverifikasi.
      </p>
      <RadioGroup
        id="paymentMethod"
        label="Metode pembayaran"
        name="paymentMethod"
        value={values.paymentMethod}
        onChange={(v) => onUpdate("paymentMethod", v as RegistrationValues["paymentMethod"])}
        options={[
          { value: "full", label: `Bayar penuh (${formatRupiah(priceIdr)})` },
          ...(dpAmount !== null
            ? [{ value: "dp", label: `DP ${dpPercent}% (${formatRupiah(dpAmount)})` }]
            : []),
        ]}
        required
        error={errors.paymentMethod}
      />
      <dl
        aria-live="polite"
        className="flex flex-col gap-2.5 rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-4 sm:p-5"
      >
        <div className="type-small flex flex-wrap items-baseline justify-between gap-x-4">
          <dt className="text-[var(--tone-muted)]">Biaya program</dt>
          <dd className="font-medium tabular-nums text-[var(--tone-ink)]">{formatRupiah(summary.feeIdr)}</dd>
        </div>
        <div className="type-small flex flex-wrap items-baseline justify-between gap-x-4">
          <dt className="text-[var(--tone-muted)]">Biaya layanan</dt>
          <dd className="tabular-nums text-[var(--tone-muted)]">{formatRupiah(0)}</dd>
        </div>
        {summary.remainingIdr > 0 ? (
          <div className="type-small flex flex-wrap items-baseline justify-between gap-x-4">
            <dt className="text-[var(--tone-muted)]">Sisa pelunasan</dt>
            <dd className="tabular-nums text-[var(--tone-muted)]">{formatRupiah(summary.remainingIdr)}</dd>
          </div>
        ) : null}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-t border-[var(--tone-rule)] pt-3">
          <dt className="type-small font-semibold text-[var(--tone-ink)]">Total pembayaran</dt>
          <dd className="font-sans text-lg font-bold tabular-nums text-danger">{formatRupiah(summary.payNowIdr)}</dd>
        </div>
      </dl>
      <div>
        <label
          className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-xs border p-4 transition-colors ${errors.consent
            ? "border-danger bg-[var(--tone-bg)]"
            : values.consent
              ? "border-[var(--tone-ink)] bg-[var(--tone-tile)]"
              : "border-[var(--tone-rule)] bg-[var(--tone-bg)]"
            }`}
        >
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={(event) => onUpdate("consent", event.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-1 size-4 shrink-0 accent-accent"
          />
          <span className="type-small leading-relaxed text-[var(--tone-ink)]">
            Saya setuju data yang saya isi dipakai Albana Speech Academy untuk menindaklanjuti
            pendaftaran ini.
          </span>
        </label>
        {errors.consent ? (
          <p id="consent-error" role="alert" className="eyebrow mt-2 normal-case text-danger">{errors.consent}</p>
        ) : null}
      </div>
    </>
  );
}
