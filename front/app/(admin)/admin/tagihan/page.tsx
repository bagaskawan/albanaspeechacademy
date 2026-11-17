import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { ilikePattern } from "@/lib/ilike";
import { invoiceRows } from "@/lib/billing-rows";
import TagihanClient from "./TagihanClient";

export const dynamic = "force-dynamic";

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminMember();
  const { q } = await searchParams;
  let request = academyBillingClient()
    .from("academy_registrations")
    .select(
      "id,full_name,email,whatsapp,offer_title,received_at,academy_registration_items(batch_slug),academy_invoices(id,stage,subtotal_idr,unique_code,total_idr,status,reviewed_by,reviewed_at,created_at)"
    )
    .order("received_at", { ascending: false })
    .limit(200);
  if (q) request = request.or(`full_name.ilike.${ilikePattern(q)},email.ilike.${ilikePattern(q)}`);
  const { data, error } = await request;
  if (error) throw new Error("Tagihan belum bisa dimuat.");

  return <TagihanClient rows={invoiceRows(data ?? [])} searching={Boolean(q)} />;
}
