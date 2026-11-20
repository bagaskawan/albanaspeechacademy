import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ilikePattern } from "@/lib/ilike";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const dynamic = "force-dynamic";

const formatReceived = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });
const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

type PendaftarInvoice = {
  id: number;
  stage: string;
  status: string;
  total_idr: number | string;
};

export default async function PendaftarPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminMember();
  const { q } = await searchParams;
  let request = academyBillingClient().from("academy_registrations")
    .select("id,full_name,email,offer_title,primary_batch_slug,payment_method,received_at,academy_invoices(id,stage,status,total_idr)")
    .order("received_at", { ascending: false });
  if (q) request = request.or(`full_name.ilike.${ilikePattern(q)},email.ilike.${ilikePattern(q)}`);
  const { data, error } = await request;
  if (error) throw new Error("Pendaftar belum bisa dimuat.");

  const verifiedRegistrants = (data ?? []).filter((item) => {
    const invoices = (item.academy_invoices ?? []) as PendaftarInvoice[];
    return invoices.some((inv) => inv.status === "verified");
  });

  // Menu Pendaftaran: Ekspor only — registrations come from the public form (plan 3.17).
  const toolbar = <TableToolbar search={{ placeholder: "Cari nama atau email…" }} exportModule="pendaftar" exportDisabled={!verifiedRegistrants.length} />;
  if (!verifiedRegistrants.length) return <>{toolbar}{q
    ? <EmptyState searching title="Tidak ada pendaftar yang cocok" description="Coba nama atau email lain." />
    : <EmptyState title="Belum ada pendaftar terverifikasi" description="Pendaftar muncul di sini setelah tagihan awalnya diverifikasi di Tagihan." />}</>;

  return <>{toolbar}<DataTable caption="Pendaftar Albana" stackOnMobile>
    <thead><tr><th scope="col">Peserta</th><th scope="col">Program – batch</th><th scope="col">Pembayaran</th><th scope="col">Masuk</th></tr></thead>
    <tbody>{verifiedRegistrants.map((item) => {
      const invoices = (item.academy_invoices ?? []) as PendaftarInvoice[];
      const remainingPending = invoices.find((inv) => inv.stage === "remaining" && inv.status !== "verified");
      const isInstallment = item.payment_method === "dp" && Boolean(remainingPending);

      return <tr key={item.id}>
        <td data-label="Peserta" className="max-w-[320px]">
          <p className="truncate font-medium" title={item.full_name}>{item.full_name}</p>
          <p className="truncate text-[13px] text-admin-text-secondary" title={item.email}>{item.email}</p>
        </td>
        <td data-label="Program – batch" className="max-w-[320px]">
          <p className="truncate" title={item.offer_title}>{item.offer_title}</p>
          <p className="truncate text-[13px] text-admin-text-secondary">{item.primary_batch_slug ?? "—"}</p>
        </td>
        <td data-label="Pembayaran">
          {isInstallment ? (
            <div className="space-y-1">
              <StatusChip tone="lilac">DP · Nyicil</StatusChip>
              <p className="text-[12px] text-admin-text-secondary">
                Sisa {rupiah(Number(remainingPending?.total_idr ?? 0))}
              </p>
            </div>
          ) : (
            <StatusChip tone="mint">Lunas</StatusChip>
          )}
        </td>
        <td data-label="Masuk" className="whitespace-nowrap text-admin-text-secondary">{formatReceived.format(new Date(item.received_at))}</td>
      </tr>;
    })}</tbody>
  </DataTable></>;
}
