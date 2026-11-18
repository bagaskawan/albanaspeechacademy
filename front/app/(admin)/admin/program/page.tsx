import { redirect } from "next/navigation";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { SERIES_SLUG } from "@/lib/bundle";

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  await requireAdminMember();
  redirect(`/admin/program/${SERIES_SLUG}`);
}
