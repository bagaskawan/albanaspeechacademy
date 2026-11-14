import React from "react";
import ProgramForm from "@/components/admin/ProgramForm";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

export default async function CreateProgramPage() {
  await requireAdminMember();

  return <ProgramForm />;
}
