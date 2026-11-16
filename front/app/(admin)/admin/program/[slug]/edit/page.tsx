import React from "react";
import ProgramForm from "@/components/admin/ProgramForm";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { notFound } from "next/navigation";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const dynamic = "force-dynamic";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await requireAdminMember();

  const { data: program } = await supabase
    .from("programs")
    .select("slug, title, description, price_idr, original_price_idr, materials, form_prior_experience, form_goal, form_challenge")
    .eq("slug", slug)
    .maybeSingle();

  if (!program) {
    return notFound();
  }

  const [{ data: programs }, { data: offers }] = await Promise.all([
    supabase.from("programs").select("slug,title").neq("slug", slug).order("title"),
    academyBillingClient().from("bundle_offers").select("*")
      .or(`speaker_program_slug.eq.${slug},certification_program_slug.eq.${slug}`).eq("placement_scope", "program"),
  ]);
  const offer = (offers ?? []).find((item) => item.speaker_program_slug === slug ? item.show_on_speaker : item.show_on_certification) ?? (offers ?? [])[0];
  return <ProgramForm initialData={program} programOptions={programs ?? []} initialBundle={offer ?? null} />;
}
