"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { deleteStorageFile } from "@/lib/supabase/storage-cleanup";

export async function savePartner(form: FormData): Promise<{ error?: string }> {
  await requireAdminMember();
  const name = String(form.get("name") ?? "").trim();
  const logo = String(form.get("logo") ?? "").trim();
  if (!name || name.length > 160) return { error: "Nama partner wajib diisi (maksimal 160 karakter)." };
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

  // Edits keep published and sort_order; new partners start as drafts with sort_order 0.
  const { error } = id
    ? await table.update({ name, logo_url: logo || null }).eq("id", id)
    : await table.insert({ name, logo_url: logo || null, sort_order: 0, published: false });
  if (error) return { error: "Partner gagal disimpan." };

  if (oldLogoUrl && oldLogoUrl !== (logo || null)) {
    await deleteStorageFile(client, oldLogoUrl).catch(() => {});
  }

  revalidatePath("/admin/partner");
  revalidatePath("/admin/program");
  revalidatePath("/program/inhouse-training");
  revalidatePath("/", "layout");
  return {};
}

export async function deletePartner(id: number): Promise<{ error?: string }> {
  await requireAdminMember("adminsuper");
  if (!Number.isSafeInteger(id) || id < 1) return { error: "Partner tidak valid." };
  const client = academyBillingClient();
  const { data: existing } = await client.from("academy_partners").select("logo_url").eq("id", id).maybeSingle();
  const { error } = await client.from("academy_partners").delete().eq("id", id);
  if (error) return { error: "Partner gagal dihapus." };
  if (existing?.logo_url) {
    await deleteStorageFile(client, existing.logo_url).catch(() => {});
  }
  revalidatePath("/admin/partner");
  revalidatePath("/admin/program");
  revalidatePath("/program/inhouse-training");
  revalidatePath("/", "layout");
  return {};
}

export async function togglePartner(form: FormData) {
  await requireAdminMember();
  const id = Number(form.get("id"));
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Partner tidak valid.");
  const published = form.get("published") === "true";
  const { error } = await academyBillingClient().from("academy_partners").update({ published }).eq("id", id);
  if (error) throw new Error("Status partner gagal disimpan.");
  revalidatePath("/admin/partner");
  revalidatePath("/program/inhouse-training");
  revalidatePath("/", "layout");
}
