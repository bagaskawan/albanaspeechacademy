"use client";

import { useState, useTransition } from "react";
import { saveContacts } from "./actions";
import { useSettingsForm } from "@/components/admin/settings/settings-forms";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { AdminInput, AdminTextarea, PhoneInput } from "@/components/admin/ui/form/controls";

export type ContactRow = { kind: string; value: string };

interface KontakClientProps {
  initialContacts: ContactRow[];
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

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-admin-line-strong bg-admin-canvas p-6 sm:p-8">
        <FieldGrid columns={1}>
          <Field
            label="WhatsApp"
            htmlFor="contact-whatsapp"
            hint="Nomor Indonesia, otomatis diformat 0812-3456-7890."
          >
            <PhoneInput
              id="contact-whatsapp"
              value={whatsapp}
              onValueChange={setWhatsapp}
            />
          </Field>

          <Field label="Email" htmlFor="contact-email">
            <AdminInput
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
            />
          </Field>

          <Field label="Instagram" htmlFor="contact-instagram">
            <AdminInput
              id="contact-instagram"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@albanaspeechacademy"
            />
          </Field>

          <Field label="Alamat" htmlFor="contact-address">
            <AdminTextarea
              id="contact-address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Alamat lengkap kantor atau studio Albana"
            />
          </Field>
        </FieldGrid>

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
