"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";

export type ContactFormData = {
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
};

export async function saveContacts(formData: FormData) {
  try {
    const supabase = await requireAdminMember();

    const whatsapp = (formData.get("whatsapp") as string)?.trim() ?? "";
    const email = (formData.get("email") as string)?.trim() ?? "";
    const instagram = (formData.get("instagram") as string)?.trim() ?? "";
    const address = (formData.get("address") as string)?.trim() ?? "";

    const channels = [
      { kind: "whatsapp", value: whatsapp },
      { kind: "email", value: email },
      { kind: "instagram", value: instagram },
      { kind: "address", value: address },
    ];

    for (const channel of channels) {
      const { error } = await supabase
        .from("contact_channels")
        .upsert(channel, { onConflict: "kind" });

      if (error) {
        return { success: false, error: `Gagal menyimpan ${channel.kind}: ${error.message}` };
      }
    }

    revalidatePath("/admin/kontak");

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyimpan kanal kontak.",
    };
  }
}
