"use server";

import { revalidatePath } from "next/cache";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

type ProgramBundleInput = { programSlug: string; enabled: boolean; partnerSlug: string; title: string; description: string; price: number; dpPercent: number | null };

export async function saveProgramBundle(input: ProgramBundleInput): Promise<{ error?: string }> {
  await requireAdminMember();
  const client = academyBillingClient();
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slug.test(input.programSlug)) return { error: "Program tidak valid." };
  const { data: offers, error: readError } = await client.from("bundle_offers").select("*")
    .or(`speaker_program_slug.eq.${input.programSlug},certification_program_slug.eq.${input.programSlug}`).eq("placement_scope", "program");
  if (readError) return { error: "Penawaran belum bisa dibaca." };
  const rows = offers ?? [];
  const visible = (row: typeof rows[number]) => row.speaker_program_slug === input.programSlug ? row.show_on_speaker : row.show_on_certification;
  if (!input.enabled) {
    for (const row of rows.filter(visible)) {
      const first = row.speaker_program_slug === input.programSlug;
      const { error } = await client.from("bundle_offers").update({
        show_on_speaker: first ? false : row.show_on_speaker,
        show_on_certification: first ? row.show_on_certification : false,
        active: first ? row.show_on_certification : row.show_on_speaker,
      }).eq("slug", row.slug);
      if (error) return { error: "Gagal menonaktifkan bundling." };
    }
    revalidatePath("/admin/program");
    return {};
  }
  if (!slug.test(input.partnerSlug) || input.partnerSlug === input.programSlug || !input.title.trim() ||
    !input.description.trim() || !Number.isSafeInteger(input.price) || input.price <= 0 ||
    input.dpPercent !== null && (!Number.isInteger(input.dpPercent) || input.dpPercent < 1 || input.dpPercent > 99)) {
    return { error: "Lengkapi pasangan, judul, penjelasan, harga, dan DP yang valid." };
  }
  const existing = rows.find((row) => row.speaker_program_slug === input.partnerSlug || row.certification_program_slug === input.partnerSlug);
  if (rows.some((row) => row.slug !== existing?.slug && visible(row))) return { error: "Matikan bundling lama sebelum memilih pasangan lain." };
  const first = existing ? existing.speaker_program_slug === input.programSlug : true;
  const payload = {
    title: input.title.trim(), description: input.description.trim(), price_idr: input.price,
    dp_percent: input.dpPercent, active: true, placement_scope: "program",
    show_on_speaker: first ? true : existing?.show_on_speaker ?? false,
    show_on_certification: first ? existing?.show_on_certification ?? false : true,
    updated_at: new Date().toISOString(),
  };
  const { error } = existing
    ? await client.from("bundle_offers").update(payload).eq("slug", existing.slug)
    : await client.from("bundle_offers").insert({ ...payload, slug: `bundle-${input.programSlug}-${input.partnerSlug}`,
        speaker_program_slug: input.programSlug, certification_program_slug: input.partnerSlug });
  if (error) return { error: "Gagal menyimpan bundling. Periksa apakah pasangan program sudah memiliki penawaran." };
  revalidatePath("/admin/program");
  return {};
}
