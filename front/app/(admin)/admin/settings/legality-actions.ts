"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { logAdminActivity } from "@/lib/server/admin-activity";
import { deleteStorageFiles, getRemovedStorageUrls } from "@/lib/supabase/storage-cleanup";

export type AcademyLegality = {
  akta_url: string;
  nib_url: string;
  skt_url: string;
  npwp_front_url: string;
  npwp_back_url: string;
};

export async function saveAcademyLegality(payload: AcademyLegality) {
  try {
    const supabase = await requireAdminMember();

    const clean = (value: string | undefined) => (typeof value === "string" ? value.trim() : "");
    const legality: AcademyLegality = {
      akta_url: clean(payload.akta_url),
      nib_url: clean(payload.nib_url),
      skt_url: clean(payload.skt_url),
      npwp_front_url: clean(payload.npwp_front_url),
      npwp_back_url: clean(payload.npwp_back_url),
    };

    const { data: existingRow } = await supabase
      .from("academy")
      .select("legality")
      .eq("id", 1)
      .maybeSingle();

    const { error } = await supabase
      .from("academy")
      .update({ legality })
      .eq("id", 1);

    if (error) {
      return { success: false, error: error.message };
    }

    const oldLegality = (existingRow?.legality ?? {}) as Partial<AcademyLegality>;
    const removedUrls = getRemovedStorageUrls(
      Object.values(oldLegality),
      Object.values(legality)
    );
    if (removedUrls.length > 0) {
      await deleteStorageFiles(academyBillingClient(), removedUrls).catch(() => {});
    }

    await logAdminActivity({
      actor: supabase.adminUser,
      action: "update",
      module: "pengaturan",
      entityLabel: "Legalitas Akademi",
      summary: "Memperbarui dokumen legalitas akademi",
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyimpan legalitas.",
    };
  }
}
