"use server";

import { revalidatePath } from "next/cache";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { logAdminActivity } from "@/lib/server/admin-activity";
import { requireAdminMember } from "@/lib/server/admin-guard";

export async function deleteRegistration(registrationId: number): Promise<void> {
  const admin = await requireAdminMember();

  if (!Number.isSafeInteger(registrationId) || registrationId < 1) {
    throw new Error("ID pendaftar tidak valid.");
  }

  const client = academyBillingClient();
  const { data: existingReg } = await client
    .from("academy_registrations")
    .select("full_name, email")
    .eq("id", registrationId)
    .maybeSingle();

  // Delete invoices first because academy_invoices.registration_id does not cascade.
  const { error: invoiceError } = await client
    .from("academy_invoices")
    .delete()
    .eq("registration_id", registrationId);
  if (invoiceError) {
    throw new Error("Gagal menghapus tagihan terkait pendaftar.");
  }

  const { error: regError } = await client
    .from("academy_registrations")
    .delete()
    .eq("id", registrationId);
  if (regError) {
    throw new Error("Gagal menghapus data pendaftar.");
  }

  const label = existingReg?.full_name?.trim() || existingReg?.email || `Pendaftar #${registrationId}`;
  await logAdminActivity({
    actor: admin.adminUser,
    action: "delete",
    module: "pendaftar",
    entityId: registrationId,
    entityLabel: label,
    summary: `Menghapus data pendaftar "${label}" beserta tagihannya`,
  });

  revalidatePath("/admin/pendaftar");
  revalidatePath("/admin/tagihan");
  revalidatePath("/admin/cicilan");
}
