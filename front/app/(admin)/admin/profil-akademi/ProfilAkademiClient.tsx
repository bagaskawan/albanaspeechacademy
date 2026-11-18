"use client";

import { useState, useTransition } from "react";
import { saveAcademyProfile } from "./actions";
import { useSettingsForm } from "@/components/admin/settings/settings-forms";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { AdminInput, AdminTextarea } from "@/components/admin/ui/form/controls";

export type AcademyProfile = {
  id: number;
  name: string;
  teaching_method: string | null;
  reschedule_policy: string | null;
};

interface ProfilAkademiClientProps {
  initialProfile: AcademyProfile;
}

export default function ProfilAkademiClient({ initialProfile }: ProfilAkademiClientProps) {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [name, setName] = useState(initialProfile.name || "Albana Speech Academy");
  const [teachingMethod, setTeachingMethod] = useState(initialProfile.teaching_method || "");
  const [reschedulePolicy, setReschedulePolicy] = useState(initialProfile.reschedule_policy || "");
  // Last saved values: the settings page compares against them to show its unsaved-changes bar.
  const [saved, setSaved] = useState({ name, teachingMethod, reschedulePolicy });
  const dirty = name !== saved.name || teachingMethod !== saved.teachingMethod || reschedulePolicy !== saved.reschedulePolicy;

  async function save() {
    setStatusMessage(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("teaching_method", teachingMethod);
    formData.set("reschedule_policy", reschedulePolicy);
    const res = await saveAcademyProfile(formData);
    if (!res.success) {
      setStatusMessage({ type: "error", text: res.error || "Gagal menyimpan profil akademi." });
      return false;
    }
    setSaved({ name, teachingMethod, reschedulePolicy });
    setStatusMessage({ type: "success", text: "Profil akademi berhasil diperbarui dan langsung aktif di situs." });
    return true;
  }

  function reset() {
    setName(saved.name);
    setTeachingMethod(saved.teachingMethod);
    setReschedulePolicy(saved.reschedulePolicy);
    setStatusMessage(null);
  }

  const inSettings = useSettingsForm("profil", { dirty, save, reset });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => { await save(); });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {statusMessage && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            statusMessage.type === "success"
              ? "border-admin-mint-dot/30 bg-admin-mint-soft text-admin-mint-ink"
              : "border-admin-rose-dot/30 bg-admin-rose-soft text-admin-danger"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-admin-line-strong bg-admin-canvas p-6 sm:p-8">
        <FieldGrid columns={1}>
          <Field label="Nama Akademi" htmlFor="academy-name" required>
            <AdminInput
              id="academy-name"
              type="text"
              required
              aria-required="true"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Albana Speech Academy"
            />
          </Field>

          <Field
            label="Metode Belajar"
            htmlFor="teaching-method"
            hint='Teks ini ditampilkan pada bagian "Cara belajar" di halaman beranda.'
          >
            <AdminTextarea
              id="teaching-method"
              rows={3}
              value={teachingMethod}
              onChange={(e) => setTeachingMethod(e.target.value)}
              placeholder="70% praktik dan simulasi, 20% coaching dan feedback, 10% konsep dan kerangka."
            />
          </Field>

          <Field
            label="Ketentuan Penjadwalan Ulang"
            htmlFor="reschedule-policy"
            hint="Digunakan sebagai acuan kebijakan pembatalan dan pemindahan sesi belajar."
          >
            <AdminTextarea
              id="reschedule-policy"
              rows={3}
              value={reschedulePolicy}
              onChange={(e) => setReschedulePolicy(e.target.value)}
              placeholder="Peserta yang berhalangan dapat mengajukan penjadwalan ulang melalui admin..."
            />
          </Field>
        </FieldGrid>

        {!inSettings && <div className="flex items-center justify-end border-t border-admin-line pt-5">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl bg-admin-ink px-5 py-2.5 text-sm font-semibold text-admin-on-ink shadow-sm hover:bg-admin-ink-soft disabled:opacity-50 transition-colors"
          >
            {isPending ? "Menyimpan..." : "Simpan Profil Akademi"}
          </button>
        </div>}
      </form>
    </div>
  );
}
