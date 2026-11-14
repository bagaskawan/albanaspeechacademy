"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export async function savePartner(form: FormData) {
  await requireAdminMember();
  const name = String(form.get("name") ?? "").trim();
  const logo = String(form.get("logo") ?? "").trim();
  const order = Number(form.get("order") ?? 0);
  if (!name || name.length > 160 || !Number.isSafeInteger(order) || order < 0 || order > 10000 ||
    logo && !/^https:\/\//.test(logo) && !/^\/api\/media\/[1-9]\d*$/.test(logo)) throw new Error("Data partner tidak valid.");
  const { error } = await academyBillingClient().from("academy_partners").insert({ name, logo_url: logo || null, sort_order: order, published: false });
  if (error) throw new Error("Partner gagal disimpan.");
  revalidatePath("/admin/partner");
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
}
