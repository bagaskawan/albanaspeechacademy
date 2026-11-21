import { ilikePattern } from "@/lib/ilike";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import PendaftarClient, {
  type PendaftarInvoice,
  type PendaftarRecord,
} from "./PendaftarClient";

export const dynamic = "force-dynamic";

export default async function PendaftarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdminMember();
  const { q } = await searchParams;

  let request = academyBillingClient()
    .from("academy_registrations")
    .select(
      "id,full_name,email,whatsapp,offer_title,offer_slug,primary_batch_slug,payment_method,price_idr_at_signup,dp_percent_at_signup,received_at,answers,academy_registration_items(batch_slug,batches(title)),academy_invoices(id,invoice_number,stage,status,subtotal_idr,unique_code,total_idr,received_idr)",
    )
    .order("received_at", { ascending: false });

  if (q) {
    const pattern = ilikePattern(q);
    request = request.or(
      `full_name.ilike.${pattern},email.ilike.${pattern},whatsapp.ilike.${pattern}`,
    );
  }

  const { data, error } = await request;
  if (error) throw new Error("Pendaftar belum bisa dimuat.");

  const verifiedRegistrants = ((data ?? []) as PendaftarRecord[]).filter((item) => {
    const invoices = (item.academy_invoices ?? []) as PendaftarInvoice[];
    return invoices.some((inv) => inv.status === "verified");
  });

  return <PendaftarClient rows={verifiedRegistrants} searching={Boolean(q)} />;
}
