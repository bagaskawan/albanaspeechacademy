import React from "react";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import { requireAdminMember } from "@/lib/server/admin-guard";
import ProgramRowActions from "@/components/admin/ProgramRowActions";

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
    <div className="w-full space-y-5 pb-24 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black tracking-wider text-text-primary uppercase">Program</h1>
          <p className="text-xs text-text-secondary mt-0.5 max-w-2xl">
            Kelola nama, deskripsi, harga, dan materi program. Slug mengikuti nama program secara otomatis.
          </p>
        </div>
        <Link
          href="/admin/program/create"
          className="hidden md:inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200"
        >
          <Plus size={14} /> Tambah Program
        </Link>
      </div>

      <Link
        href="/admin/program/create"
        aria-label="Tambah Program"
        className="md:hidden fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-zinc-900"
      >
        <Plus size={22} />
      </Link>

      <div className="hidden md:block bg-bg-card border border-border-default rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default bg-bg-well/50">
                <th className="py-3.5 px-5 border-r border-border-default/60 whitespace-nowrap">Nama Program</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 whitespace-nowrap">Deskripsi</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 whitespace-nowrap">Harga Promo</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 whitespace-nowrap">Harga Coret</th>
                <th className="py-3.5 px-5 border-r border-border-default/60 whitespace-nowrap">Materi</th>
                <th className="py-3.5 px-5 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 px-5 text-center text-xs font-semibold text-text-muted">
                    Belum ada program. Tambahkan program lalu isi detailnya.
                  </td>
                </tr>
              )}
              {rows.map((program) => (
                <tr key={program.slug} className="hover:bg-bg-well/40 transition-colors">
                  <td className="py-3.5 px-5 border-r border-border-default/40 font-bold text-text-primary">
                    {program.title}
                  </td>
                  <td className="py-3.5 px-5 border-r border-border-default/40 max-w-[280px] truncate text-text-secondary" title={program.description ?? ""}>
                    {program.description || "—"}
                  </td>
                  <td className="py-3.5 px-5 border-r border-border-default/40 font-bold text-text-primary whitespace-nowrap">
                    {formatRupiah(program.price_idr)}
                  </td>
                  <td className="py-3.5 px-5 border-r border-border-default/40 text-text-muted line-through whitespace-nowrap">
                    {program.original_price_idr ? formatRupiah(program.original_price_idr) : "—"}
                  </td>
                  <td className="py-3.5 px-5 border-r border-border-default/40 text-text-secondary">
                    {Array.isArray(program.materials) ? `${program.materials.length} materi` : "—"}
                  </td>
                  <td className="py-3.5 px-5">
                    <ProgramRowActions slug={program.slug} title={program.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden grid grid-cols-1 gap-4">
        {rows.length === 0 ? (
          <div className="bg-bg-card border border-border-default border-dashed rounded-2xl p-10 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-text-muted opacity-40" />
            <p className="text-xs font-semibold text-text-muted">Belum ada program.</p>
          </div>
        ) : (
          rows.map((program) => (
            <div key={program.slug} className="bg-bg-card border border-border-default rounded-2xl p-4 space-y-3">
              <div>
                <h3 className="text-sm font-black text-text-primary break-words">{program.title}</h3>
                <p className="mt-1 text-[11px] text-text-secondary line-clamp-3">{program.description || "—"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="block text-text-muted">Harga Promo</span>
                  <span className="font-bold text-text-primary">{formatRupiah(program.price_idr)}</span>
                </div>
                <div>
                  <span className="block text-text-muted">Harga Coret</span>
                  <span className="font-medium text-text-muted line-through">
                    {program.original_price_idr ? formatRupiah(program.original_price_idr) : "—"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block text-text-muted">Materi</span>
                  <span className="font-medium text-text-primary">
                    {Array.isArray(program.materials) ? `${program.materials.length} materi` : "—"}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border-default/40 flex justify-end">
                <ProgramRowActions slug={program.slug} title={program.title} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
