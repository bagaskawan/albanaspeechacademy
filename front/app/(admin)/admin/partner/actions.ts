"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { logAdminActivity } from "@/lib/server/admin-activity";
import { deleteStorageFile } from "@/lib/supabase/storage-cleanup";

export async function savePartner(form: FormData): Promise<{ error?: string }> {
  const supabase = await requireAdminMember();
  const name = String(form.get("name") ?? "").trim();
  const logo = String(form.get("logo") ?? "").trim();
  if (!name && !logo) return { error: "Isi nama partner atau unggah logo partner." };
  if (name.length > 160) return { error: "Nama partner maksimal 160 karakter." };
  if (logo && !/^https:\/\//.test(logo) && !/^\/api\/media\/[1-9]\d*$/.test(logo)) {
    return { error: "URL logo partner tidak valid." };
  }
  const id = Number(form.get("id") ?? 0);
  if (!Number.isSafeInteger(id) || id < 0) return { error: "Partner tidak valid." };

  const client = academyBillingClient();
  const table = client.from("academy_partners");

  let oldLogoUrl: string | null = null;
  if (id) {
    const { data: existing } = await table.select("logo_url").eq("id", id).maybeSingle();
    oldLogoUrl = existing?.logo_url ?? null;
  }

  // Partners are published immediately upon save.
  let savedId = id;
  if (id) {
    const { error } = await table.update({ name, logo_url: logo || null, published: true }).eq("id", id);
    if (error) return { error: "Partner gagal disimpan." };
  } else {
    const { data: inserted, error } = await table
      .insert({ name, logo_url: logo || null, sort_order: 0, published: true })
      .select("id")
      .single();
    if (error) return { error: "Partner gagal disimpan." };
    savedId = inserted?.id ?? 0;
  }

  if (oldLogoUrl && oldLogoUrl !== (logo || null)) {
    await deleteStorageFile(client, oldLogoUrl).catch(() => {});
  }

  const label = name || "Partner tanpa nama";
  await logAdminActivity({
    actor: supabase.adminUser,
    action: id ? "update" : "create",
    module: "partner",
    entityId: savedId || null,
    entityLabel: label,
    summary: id ? `Memperbarui partner "${label}"` : `Menambahkan partner "${label}"`,
  });

  revalidatePath("/admin/partner");
  revalidatePath("/admin/program");
  revalidatePath("/program/inhouse-training");
  revalidatePath("/", "layout");
  return {};
}

export async function deletePartner(id: number): Promise<{ error?: string }> {
  const supabase = await requireAdminMember();
  if (!Number.isSafeInteger(id) || id < 1) return { error: "Partner tidak valid." };
  const client = academyBillingClient();
  const { data: existing } = await client.from("academy_partners").select("name, logo_url").eq("id", id).maybeSingle();
  const { error } = await client.from("academy_partners").delete().eq("id", id);
  if (error) return { error: "Partner gagal dihapus." };
  if (existing?.logo_url) {
    await deleteStorageFile(client, existing.logo_url).catch(() => {});
  }

  const label = existing?.name?.trim() || "Partner tanpa nama";
  await logAdminActivity({
    actor: supabase.adminUser,
    action: "delete",
    module: "partner",
    entityId: id,
    entityLabel: label,
    summary: `Menghapus partner "${label}"`,
  });

  revalidatePath("/admin/partner");
  revalidatePath("/admin/program");
  revalidatePath("/program/inhouse-training");
  revalidatePath("/", "layout");
  return {};
}

export async function togglePartner(form: FormData) {
  const supabase = await requireAdminMember();
  const id = Number(form.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Partner tidak valid.");
  const published = form.get("published") === "true";
  const client = academyBillingClient();
  const { data: existing } = await client.from("academy_partners").select("name").eq("id", id).maybeSingle();
  const { error } = await client.from("academy_partners").update({ published }).eq("id", id);
  if (error) throw new Error("Status partner gagal disimpan.");

  const label = existing?.name?.trim() || "Partner tanpa nama";
  await logAdminActivity({
    actor: supabase.adminUser,
    action: "status",
    module: "partner",
    entityId: id,
    entityLabel: label,
    summary: `${published ? "Menampilkan" : "Menyembunyikan"} partner "${label}"`,
    metadata: { published },
  });

  revalidatePath("/admin/partner");
  revalidatePath("/program/inhouse-training");
  revalidatePath("/", "layout");
}
