"use client";

import { useState, useTransition } from "react";
import { saveContacts } from "./actions";
import { useSettingsForm } from "@/components/admin/settings/settings-forms";

export type ContactRow = { kind: string; value: string };

interface KontakClientProps {
  initialContacts: ContactRow[];
}

function formatPhoneNumber(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.length > 0 && digits[0] !== "0") digits = "0" + digits;
  digits = digits.slice(0, 13);

  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  if (digits.length > 8) parts.push(digits.slice(8, 13));
  return parts.join("-");
}

export default function KontakClient({ initialContacts }: KontakClientProps) {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const contactMap = Object.fromEntries(initialContacts.map((c) => [c.kind, c.value]));

  const [whatsapp, setWhatsapp] = useState(contactMap.whatsapp || "");
  const [email, setEmail] = useState(contactMap.email || "");
  const [instagram, setInstagram] = useState(contactMap.instagram || "");
  const [address, setAddress] = useState(contactMap.address || "");
  // Last saved values: the settings page compares against them to show its unsaved-changes bar.
  const [saved, setSaved] = useState({ whatsapp, email, instagram, address });
  const dirty = whatsapp !== saved.whatsapp || email !== saved.email || instagram !== saved.instagram || address !== saved.address;

  async function save() {
    setStatusMessage(null);
    const formData = new FormData();
    formData.set("whatsapp", whatsapp);
    formData.set("email", email);
    formData.set("instagram", instagram);
    formData.set("address", address);
    const res = await saveContacts(formData);
    if (!res.success) {
      setStatusMessage({ type: "error", text: res.error || "Gagal menyimpan kontak." });
      return false;
    }
    setSaved({ whatsapp, email, instagram, address });
    setStatusMessage({ type: "success", text: "Kanal kontak berhasil diperbarui dan langsung aktif di situs." });
    return true;
  }

  function reset() {
    setWhatsapp(saved.whatsapp);
    setEmail(saved.email);
    setInstagram(saved.instagram);
    setAddress(saved.address);
    setStatusMessage(null);
  }

  const inSettings = useSettingsForm("kontak", { dirty, save, reset });

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

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-admin-line bg-admin-surface p-6 sm:p-8 shadow-sm">
        <div>
          <label htmlFor="contact-whatsapp" className="block text-xs font-bold uppercase tracking-wider text-admin-text-secondary">
            WhatsApp
          </label>
          <input
            id="contact-whatsapp"
            type="tel"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(formatPhoneNumber(e.target.value))}
            placeholder="0812-3456-7890"
            className="mt-1.5 block w-full rounded-xl border border-admin-line px-3.5 py-2.5 text-sm text-admin-ink focus:border-admin-ink focus:outline-none"
          />
          <p className="mt-1 text-xs text-admin-text-secondary">Nomor lokal, diawali angka 0. Otomatis diformat dan ditautkan ke wa.me.</p>
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-admin-text-secondary">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="mt-1.5 block w-full rounded-xl border border-admin-line px-3.5 py-2.5 text-sm text-admin-ink focus:border-admin-ink focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contact-instagram" className="block text-xs font-bold uppercase tracking-wider text-admin-text-secondary">
            Instagram
          </label>
          <input
            id="contact-instagram"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@albanaspeechacademy"
            className="mt-1.5 block w-full rounded-xl border border-admin-line px-3.5 py-2.5 text-sm text-admin-ink focus:border-admin-ink focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="contact-address" className="block text-xs font-bold uppercase tracking-wider text-admin-text-secondary">
            Alamat
          </label>
          <textarea
            id="contact-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat lengkap kantor atau studio Albana"
            className="mt-1.5 block w-full rounded-xl border border-admin-line px-3.5 py-2.5 text-sm text-admin-ink focus:border-admin-ink focus:outline-none"
          />
        </div>

        {!inSettings && <div className="flex items-center justify-end border-t border-admin-line pt-5">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl bg-admin-ink px-5 py-2.5 text-sm font-semibold text-admin-on-ink shadow-sm hover:bg-admin-ink-soft disabled:opacity-50 transition-colors"
          >
            {isPending ? "Menyimpan..." : "Simpan Perubahan Kontak"}
          </button>
        </div>}
      </form>
    </div>
  );
}
