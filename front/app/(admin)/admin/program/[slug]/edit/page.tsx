import React from "react";
import ProgramForm from "@/components/admin/ProgramForm";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
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

  return <ProgramForm initialData={program} />;
}
