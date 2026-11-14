"use client";

import { RadioGroup, TextArea, TextField } from "@/components/ui/field";
import { formatRupiah } from "@/lib/format";
import {
  MAX_CHALLENGE,
  MAX_EMAIL,
  MAX_GOAL,
  MAX_NAME,
  MAX_TEXT,
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
        <TextField id="socialName" label="Media sosial" value={values.socialName} onChange={(v) => onUpdate("socialName", v)} maxLength={MAX_TEXT} placeholder="Instagram @nama atau TikTok @nama" hint="Opsional. Tulis nama akun yang ingin dihubungkan." error={errors.socialName} />
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

  const dpAmount = dpPercent === null ? null : Math.round((priceIdr * dpPercent) / 100);
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
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          checked={values.consent}
          onChange={(event) => onUpdate("consent", event.target.checked)}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? "consent-error" : undefined}
          className="mt-0.5 size-4 shrink-0 accent-accent"
        />
        <span>
          Saya setuju data yang saya isi dipakai Albana Speech Academy untuk menindaklanjuti
          pendaftaran ini.
        </span>
      </label>
      {errors.consent ? (
        <p id="consent-error" role="alert" className="text-sm font-semibold text-danger">{errors.consent}</p>
      ) : null}
      <p className="border-t border-rule pt-5 text-sm text-muted">
        Jika berhalangan hadir, ajukan penjadwalan ulang melalui admin. Pembayaran tidak dikembalikan.
      </p>
    </>
  );
}
