import { redirect } from "next/navigation";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

export default async function RekeningPage() {
  await requireAdminMember();
  redirect("/admin/settings?tab=rekening");
}
