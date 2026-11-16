import Link from "next/link";
import { requireAdminMember } from "@/lib/server/admin-guard";

export default async function AdminDashboardPage() {
  await requireAdminMember();
  return <div className="space-y-7">
    <div><p className="text-xs font-bold uppercase tracking-widest text-admin-ink">Albana CMS</p><h1 className="mt-2 text-3xl font-bold">Ruang kerja admin</h1><p className="mt-2 text-admin-text-secondary">Kelola pendaftar, kelas, tagihan, dan konten akademi.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {[["Pendaftar", "/admin/pendaftar"], ["Tagihan", "/admin/tagihan"], ["Program", "/admin/program"], ["Batch", "/admin/batch"], ["Media", "/admin/media"], ["Artikel", "/admin/artikel"]].map(([label, href]) => <Link key={href} href={href} className="rounded-2xl border border-admin-line bg-admin-surface p-6 font-semibold hover:border-admin-ink hover:text-admin-ink">{label} <span aria-hidden="true">→</span></Link>)}
    </div>
  </div>;
}
