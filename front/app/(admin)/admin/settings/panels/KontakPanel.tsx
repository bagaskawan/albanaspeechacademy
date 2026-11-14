"use client";

import React from "react";
import { createClient } from "@/lib/supabase/client";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";

export type ContactChannel = { kind: string; value: string };

const KINDS = ["whatsapp", "email", "instagram", "address"] as const;
type ContactKind = (typeof KINDS)[number];
export type ContactForm = Record<ContactKind, string>;

export const EMPTY_CONTACTS: ContactForm = {
  whatsapp: "",
  email: "",
  instagram: "",
  address: "",
};

/** Format local numbers as 0812-3456-7890; keep at most 13 digits. */
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

export function contactsToForm(rows: ContactChannel[]): ContactForm {
  const form = { ...EMPTY_CONTACTS };
  for (const row of rows) {
    if (KINDS.includes(row.kind as ContactKind)) form[row.kind as ContactKind] = row.value;
  }
  form.whatsapp = formatPhoneNumber(form.whatsapp);
  return form;
}

export function isSameContacts(a: ContactForm, b: ContactForm) {
  return KINDS.every((kind) => a[kind].trim() === b[kind].trim());
}

export async function saveContactChannels(form: ContactForm) {
  try {
    const supabase = createClient();
    const filled = KINDS.map((kind) => ({ kind, value: form[kind].trim() })).filter(
      (row) => row.value !== ""
    );
    const emptied = KINDS.filter((kind) => form[kind].trim() === "");

    if (filled.length) {
      const { error } = await supabase
        .from("contact_channels")
        .upsert(filled, { onConflict: "kind" });
      if (error) throw error;
    }
    if (emptied.length) {
      const { error } = await supabase
        .from("contact_channels")
        .delete()
        .in("kind", emptied);
      if (error) throw error;
    }
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "Gagal menyimpan kontak.",
    };
  }
}

interface KontakPanelProps {
  value: ContactForm;
  onChange: (value: ContactForm) => void;
}

export default function KontakPanel({ value, onChange }: KontakPanelProps) {
  const update = (kind: ContactKind, next: string) => {
    onChange({ ...value, [kind]: next });
  };

  return (
    <div className="bg-bg-card border border-border-default rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="border-b border-border-default/60 pb-4">
        <h2 className="text-base font-bold text-text-primary">Kontak</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Kanal kontak resmi yang tampil di situs dan dipakai pada konfirmasi pendaftaran.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 pt-5">
        <InputLine
          id="contact-email"
          label="Email"
          type="email"
          value={value.email}
          onChange={(event) => update("email", event.target.value)}
          placeholder="nama@email.com"
        />

        <InputLine
          id="contact-whatsapp"
          label="WhatsApp"
          type="tel"
          inputMode="tel"
          value={value.whatsapp}
          onChange={(event) => update("whatsapp", formatPhoneNumber(event.target.value))}
          placeholder="0812-3456-7890"
          hint="Nomor lokal, diawali 0."
        />

        <InputLine
          id="contact-instagram"
          label="Instagram"
          value={value.instagram}
          onChange={(event) => update("instagram", event.target.value)}
          placeholder="@albanaspeechacademy"
        />

        <TextareaLine
          id="contact-address"
          label="Alamat"
          value={value.address}
          onChange={(event) => update("address", event.target.value)}
          rows={3}
          placeholder="Alamat lengkap akademi"
        />
      </div>
    </div>
  );
}
