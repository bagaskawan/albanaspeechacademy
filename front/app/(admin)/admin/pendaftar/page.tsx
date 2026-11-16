import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ilikePattern } from "@/lib/ilike";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const dynamic = "force-dynamic";

const formatReceived = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default async function PendaftarPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminMember();
  const { q } = await searchParams;
  let request = academyBillingClient().from("academy_registrations")
    .select("id,full_name,email,offer_title,primary_batch_slug,payment_method,received_at")
    .order("received_at", { ascending: false });
  if (q) request = request.or(`full_name.ilike.${ilikePattern(q)},email.ilike.${ilikePattern(q)}`);
  const { data, error } = await request;
  if (error) throw new Error("Pendaftar belum bisa dimuat.");

  // Menu Pendaftaran: Ekspor only — registrations come from the public form (plan 3.17).
  const toolbar = <TableToolbar search={{ placeholder: "Cari nama atau email…" }} exportModule="pendaftar" exportDisabled={!data?.length} />;
  if (!data?.length) return <>{toolbar}{q
    ? <EmptyState searching title="Tidak ada pendaftar yang cocok" description="Coba nama atau email lain." />
    : <EmptyState title="Belum ada pendaftar" description="Pendaftaran dari formulir publik akan muncul di sini." />}</>;

  return <>{toolbar}<DataTable caption="Pendaftar Albana" stackOnMobile>
    <thead><tr><th scope="col">Peserta</th><th scope="col">Program – batch</th><th scope="col">Pembayaran</th><th scope="col">Masuk</th></tr></thead>
    <tbody>{data.map((item) => <tr key={item.id}>
      <td data-label="Peserta" className="max-w-[320px]">
        <p className="truncate font-medium" title={item.full_name}>{item.full_name}</p>
        <p className="truncate text-[13px] text-admin-text-secondary" title={item.email}>{item.email}</p>
      </td>
      <td data-label="Program – batch" className="max-w-[320px]">
        <p className="truncate" title={item.offer_title}>{item.offer_title}</p>
        <p className="truncate text-[13px] text-admin-text-secondary">{item.primary_batch_slug ?? "—"}</p>
      </td>
      <td data-label="Pembayaran"><StatusChip tone={item.payment_method === "dp" ? "lilac" : "neutral"}>{item.payment_method === "dp" ? "DP" : "Lunas"}</StatusChip></td>
      <td data-label="Masuk" className="whitespace-nowrap text-admin-text-secondary">{formatReceived.format(new Date(item.received_at))}</td>
    </tr>)}</tbody>
  </DataTable></>;
}
