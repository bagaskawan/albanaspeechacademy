"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";

export type ActionState = {
  success?: boolean;
  error?: string;
};

export async function saveBankAccount(formData: FormData): Promise<ActionState> {
  try {
    const supabase = await requireAdminMember();

    const idRaw = formData.get("id");
    const id = idRaw ? Number(idRaw) : undefined;
    const bank = (formData.get("bank") as string)?.trim();
    const account_number = (formData.get("account_number") as string)?.trim();
    const holder = (formData.get("holder") as string)?.trim();
    const active = formData.get("active") === "true" || formData.get("active") === "on";

    if (!bank || !account_number || !holder) {
      return { success: false, error: "Nama bank, nomor rekening, dan nama pemilik wajib diisi." };
    }

    if (active) {
      // Deactivate existing active accounts first so partial unique index won't collide
      const { error: deactivateError } = await supabase
        .from("bank_accounts")
        .update({ active: false })
        .eq("active", true);

      if (deactivateError) {
        return { success: false, error: deactivateError.message };
      }
    }

    if (id) {
      const { error } = await supabase
        .from("bank_accounts")
        .update({ bank, account_number, holder, active })
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from("bank_accounts")
        .insert([{ bank, account_number, holder, active }]);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    revalidatePath("/admin/rekening");

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menyimpan rekening." };
  }
}

export async function activateBankAccount(id: number): Promise<ActionState> {
  try {
    const supabase = await requireAdminMember();

    // 1. Deactivate all active accounts
    const { error: deactivateError } = await supabase
      .from("bank_accounts")
      .update({ active: false })
      .eq("active", true);

    if (deactivateError) {
      return { success: false, error: deactivateError.message };
    }

    // 2. Activate target account
    const { error: activateError } = await supabase
      .from("bank_accounts")
      .update({ active: true })
      .eq("id", id);

    if (activateError) {
      return { success: false, error: activateError.message };
    }

    revalidatePath("/admin/rekening");

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal mengaktifkan rekening." };
  }
}

export async function deleteBankAccount(id: number): Promise<ActionState> {
  try {
    const supabase = await requireAdminMember("adminsuper");

    const { error } = await supabase
      .from("bank_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/rekening");

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Gagal menghapus rekening." };
  }
}
