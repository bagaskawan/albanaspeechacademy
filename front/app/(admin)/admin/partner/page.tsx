import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { PartnerClient, type PartnerRow } from "./PartnerClient";

export const dynamic = "force-dynamic";

export default async function PartnerPage() {
  await requireAdminMember();
  const { data, error } = await academyBillingClient()
    .from("academy_partners")
    .select("id,name,logo_url,published")
    .order("sort_order")
    .order("id");
  if (error) throw new Error("Partner belum bisa dimuat.");

  return <PartnerClient partners={(data ?? []) as PartnerRow[]} />;
}
