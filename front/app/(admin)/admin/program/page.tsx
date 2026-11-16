import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import ProgramRowActions from "@/components/admin/ProgramRowActions";
import { PageAction } from "@/components/admin/PageHeader";
import { DataTable } from "@/components/admin/ui/data-table";

export const dynamic = "force-dynamic";

const formatRupiah = (value: unknown) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

export default async function ProgramPage() {
  const supabase = await requireAdminMember();
  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .order("title", { ascending: true });

  const rows = programs ?? [];

  return (
    <div className="w-full space-y-5">
      <PageAction href="/admin/program/create" icon={<Plus aria-hidden="true" size={18} strokeWidth={1.5} />}>Tambah program</PageAction>

      {rows.length === 0
        ? <p className="rounded-[var(--admin-radius-card)] bg-admin-surface p-8 text-center text-[15px] text-admin-text-secondary">Belum ada program. Tambahkan program lalu isi detailnya.</p>
        : <DataTable caption="Program" stackOnMobile>
          <thead>
            <tr>
              <th scope="col">Program</th>
              <th scope="col">Deskripsi</th>
              <th scope="col" data-numeric="">Harga</th>
              <th scope="col" data-numeric="">Harga coret</th>
              <th scope="col">Materi</th>
              <th scope="col" className="text-right"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((program) => (
              <tr key={program.slug}>
                <td data-label="Program" className="max-w-[280px]">
                  <p className="truncate font-medium" title={program.title}>{program.title}</p>
                  <Link href={`/admin/batch?program=${encodeURIComponent(program.slug)}&add=1`} className="text-[13px] text-admin-text-secondary underline underline-offset-4 hover:text-admin-ink">Tambah batch</Link>
                </td>
                <td data-label="Deskripsi" className="max-w-[320px] truncate text-admin-text-secondary" title={program.description ?? ""}>
                  {program.description || "—"}
                </td>
                <td data-label="Harga" data-numeric="" className="whitespace-nowrap">{formatRupiah(program.price_idr)}</td>
                <td data-label="Harga coret" data-numeric="" className="whitespace-nowrap text-admin-text-faint line-through">
                  {program.original_price_idr ? formatRupiah(program.original_price_idr) : "—"}
                </td>
                <td data-label="Materi" className="whitespace-nowrap text-admin-text-secondary">
                  {Array.isArray(program.materials) ? `${program.materials.length} materi` : "—"}
                </td>
                <td className="text-right">
                  <ProgramRowActions slug={program.slug} title={program.title} />
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>}
    </div>
  );
}
