"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export async function saveBundle(form: FormData) {
  await requireAdminMember();
  const title = String(form.get("title") ?? "").trim();
  const speaker = String(form.get("speaker") ?? "");
  const certification = String(form.get("certification") ?? "");
  const priceRaw = String(form.get("price") ?? "").trim();
  const dpRaw = String(form.get("dp") ?? "").trim();
  const price = priceRaw ? Number(priceRaw) : null;
  const dp = dpRaw ? Number(dpRaw) : null;
  const active = form.get("active") === "on";
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!title || title.length > 160 || !slug.test(speaker) || !slug.test(certification) || speaker === certification ||
    price !== null && (!Number.isSafeInteger(price) || price < 1) ||
    dp !== null && (!Number.isInteger(dp) || dp < 1 || dp > 99) || active && price === null) {
    redirect("/admin/bundling?error=invalid");
  }
  const { error } = await academyBillingClient().from("bundle_offers").upsert({
    slug: "speaker-sertifikasi", title, speaker_program_slug: speaker,
    certification_program_slug: certification, price_idr: price, dp_percent: dp, active,
    updated_at: new Date().toISOString(),
  });
  if (error) redirect("/admin/bundling?error=save");
  revalidatePath("/admin/bundling");
  redirect("/admin/bundling?saved=1");
}
