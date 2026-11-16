import Link from "next/link";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { RowActions, rowPillClass } from "@/components/admin/ui/row-actions";
import { ilikePattern } from "@/lib/ilike";
import { deletePartner, savePartner, togglePartner } from "./actions";

export const dynamic = "force-dynamic";

const field = "h-[52px] w-full rounded-full border border-admin-line bg-admin-canvas px-5 text-[15px] text-admin-ink focus-visible:outline-2 focus-visible:outline-admin-ink";

export default async function PartnerPage({ searchParams }: { searchParams: Promise<{ q?: string; tambah?: string; ubah?: string }> }) {
  await requireAdminMember();
  const { q, tambah, ubah } = await searchParams;
  let request = academyBillingClient().from("academy_partners").select("id,name,logo_url,published,sort_order").order("sort_order").order("id");
  if (q) request = request.ilike("name", ilikePattern(q));
  const { data, error } = await request;
  if (error) throw new Error("Partner belum bisa dimuat.");

  const editing = ubah ? data?.find((partner) => String(partner.id) === ubah) : undefined;
  const showForm = tambah === "1" || Boolean(editing);

  return <div className="space-y-6">
    <TableToolbar search={{ placeholder: "Cari partner…" }} exportModule="partner" create={{ label: "Tambah partner", href: "/admin/partner?tambah=1" }} />

    {showForm && <form action={savePartner} className="grid max-w-2xl gap-4 rounded-[var(--admin-radius-card)] bg-admin-surface p-[var(--admin-space-card)]">
      <h2 className="text-[17px] font-medium">{editing ? `Ubah ${editing.name}` : "Tambah partner"}</h2>
      {editing && <input type="hidden" name="id" value={editing.id} />}
      <label className="grid gap-2 text-[13px] font-medium">Nama partner<input name="name" required maxLength={160} defaultValue={editing?.name ?? ""} className={field} /></label>
      <label className="grid gap-2 text-[13px] font-medium">URL logo (opsional)<input name="logo" defaultValue={editing?.logo_url ?? ""} className={field} placeholder="https://… atau /api/media/ID" /></label>
      <label className="grid gap-2 text-[13px] font-medium">Urutan<input name="order" type="number" min="0" max="10000" defaultValue={editing?.sort_order ?? 0} className={field} /></label>
      <p className="text-[13px] text-admin-text-secondary">{editing ? "Status terbit tidak berubah." : "Partner baru disimpan sebagai draf sampai diterbitkan."}</p>
      <div className="flex gap-2">
        <button type="submit" className="inline-flex h-12 items-center rounded-full bg-admin-ink px-6 text-[15px] font-medium text-admin-on-ink hover:bg-admin-ink-soft">Simpan</button>
        <Link href="/admin/partner" className="inline-flex h-12 items-center rounded-full px-5 text-[15px] text-admin-ink hover:bg-admin-surface">Batal</Link>
      </div>
    </form>}

    {!data?.length
      ? (q ? <EmptyState searching title="Tidak ada partner yang cocok" description="Coba nama lain." /> : <EmptyState title="Belum ada partner" description="Tambahkan instansi yang pernah dilatih Albana." />)
      : <DataTable caption="Partner" stackOnMobile>
        <thead><tr>
          <th scope="col">Partner</th>
          <th scope="col">Status</th>
          <th scope="col" data-numeric="">Urutan</th>
          <th scope="col" className="text-right"><span className="sr-only">Aksi</span></th>
        </tr></thead>
        <tbody>{data.map((partner) => <tr key={partner.id}>
          <td data-label="Partner">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- logos may be external URLs or /api/media redirects */}
              {partner.logo_url ? <img src={partner.logo_url} alt="" className="size-10 shrink-0 rounded-xl bg-admin-canvas object-contain" /> : <span aria-hidden="true" className="size-10 shrink-0 rounded-xl bg-admin-surface-muted" />}
              <span className="truncate font-medium" title={partner.name}>{partner.name}</span>
            </div>
          </td>
          <td data-label="Status"><StatusChip tone={partner.published ? "mint" : "neutral"}>{partner.published ? "Terbit" : "Draf"}</StatusChip></td>
          <td data-label="Urutan" data-numeric="">{partner.sort_order}</td>
          <td className="text-right">
            <RowActions
              itemName={partner.name}
              editHref={`/admin/partner?ubah=${partner.id}`}
              onDelete={deletePartner.bind(null, partner.id)}
              extra={<form action={togglePartner}>
                <input type="hidden" name="id" value={partner.id} />
                <input type="hidden" name="published" value={partner.published ? "false" : "true"} />
                <button type="submit" className={rowPillClass}>{partner.published ? "Tarik" : "Terbitkan"}</button>
              </form>}
            />
          </td>
        </tr>)}</tbody>
      </DataTable>}
  </div>;
}
