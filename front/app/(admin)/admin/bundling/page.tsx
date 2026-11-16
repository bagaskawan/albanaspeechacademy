import { redirect } from "next/navigation";
import { requireAdminMember } from "@/lib/server/admin-guard";

export default async function BundleAdminPage() {
  await requireAdminMember();
  redirect("/admin/program");
}
