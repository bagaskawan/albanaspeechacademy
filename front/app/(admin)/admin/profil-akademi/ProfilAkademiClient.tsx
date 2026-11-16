"use client";

import { useState, useTransition } from "react";
import { saveAcademyProfile } from "./actions";

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatusMessage(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("teaching_method", teachingMethod);
    formData.set("reschedule_policy", reschedulePolicy);

    startTransition(async () => {
      const res = await saveAcademyProfile(formData);
      if (!res.success) {
        setStatusMessage({ type: "error", text: res.error || "Gagal menyimpan profil akademi." });
      } else {
        setStatusMessage({ type: "success", text: "Profil akademi berhasil diperbarui dan langsung aktif di situs." });
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#10243F]">Profil Akademi</h1>
        <p className="mt-1 text-sm text-[#566B84]">
          Nama resmi akademi, metode pengajaran yang ditampilkan di beranda, dan ketentuan penjadwalan ulang bagi peserta.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            statusMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[#D8E4F0] bg-white p-6 sm:p-8 shadow-sm">
        <div>
          <label htmlFor="academy-name" className="block text-xs font-bold uppercase tracking-wider text-[#566B84]">
            Nama Akademi
          </label>
          <input
            id="academy-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Albana Speech Academy"
            className="mt-1.5 block w-full rounded-xl border border-[#D8E4F0] px-3.5 py-2.5 text-sm text-[#10243F] focus:border-[#26599A] focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="teaching-method" className="block text-xs font-bold uppercase tracking-wider text-[#566B84]">
            Metode Belajar
          </label>
          <textarea
            id="teaching-method"
            rows={3}
            value={teachingMethod}
            onChange={(e) => setTeachingMethod(e.target.value)}
            placeholder="70% praktik dan simulasi, 20% coaching dan feedback, 10% konsep dan kerangka."
            className="mt-1.5 block w-full rounded-xl border border-[#D8E4F0] px-3.5 py-2.5 text-sm text-[#10243F] focus:border-[#26599A] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[#566B84]">
            Teks ini ditampilkan pada bagian &quot;Cara belajar&quot; di halaman beranda.
          </p>
        </div>

        <div>
          <label htmlFor="reschedule-policy" className="block text-xs font-bold uppercase tracking-wider text-[#566B84]">
            Ketentuan Penjadwalan Ulang
          </label>
          <textarea
            id="reschedule-policy"
            rows={3}
            value={reschedulePolicy}
            onChange={(e) => setReschedulePolicy(e.target.value)}
            placeholder="Peserta yang berhalangan dapat mengajukan penjadwalan ulang melalui admin..."
            className="mt-1.5 block w-full rounded-xl border border-[#D8E4F0] px-3.5 py-2.5 text-sm text-[#10243F] focus:border-[#26599A] focus:outline-none"
          />
          <p className="mt-1 text-xs text-[#566B84]">
            Digunakan sebagai acuan kebijakan pembatalan dan pemindahan sesi belajar.
          </p>
        </div>

        <div className="flex items-center justify-end border-t border-[#D8E4F0] pt-5">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl bg-[#26599A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163E70] disabled:opacity-50 transition-colors"
          >
            {isPending ? "Menyimpan..." : "Simpan Profil Akademi"}
          </button>
        </div>
      </form>
    </div>
  );
}
