"use server";

import { revalidatePath } from "next/cache";
import { logAdminActivity } from "@/lib/server/admin-activity";
import { requireAdminMember } from "@/lib/server/admin-guard";

export async function saveAcademyProfile(formData: FormData) {
  try {
    const supabase = await requireAdminMember();

    const name = (formData.get("name") as string)?.trim();
    const teaching_method = (formData.get("teaching_method") as string)?.trim() ?? "";
    const reschedule_policy = (formData.get("reschedule_policy") as string)?.trim() ?? "";

    if (!name) {
      return { success: false, error: "Nama akademi wajib diisi." };
    }

    const { error } = await supabase
      .from("academy")
      .update({ name, teaching_method, reschedule_policy })
      .eq("id", 1);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAdminActivity({
      actor: supabase.adminUser,
      action: "update",
      module: "profil-akademi",
      entityLabel: name,
      summary: `Memperbarui profil akademi "${name}"`,
    });

    revalidatePath("/admin/profil-akademi");

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyimpan profil akademi.",
    };
  }
}
