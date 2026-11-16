import { redirect } from "next/navigation";
import { requireAdminMember } from "@/lib/server/admin-guard";

// Batch kini dikelola di layar Program & Batch.
export default async function BatchPage() {
  await requireAdminMember();
  redirect("/admin/program");
}
