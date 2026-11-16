"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const groups = [
  { title: "Operasional", links: [["Dashboard", "/admin"], ["Pendaftar", "/admin/pendaftar"], ["Tagihan", "/admin/tagihan"], ["Rekening", "/admin/rekening"], ["Kontak", "/admin/kontak"]] },
  { title: "Kelas", links: [["Program", "/admin/program"], ["Batch", "/admin/batch"], ["Trainer", "/admin/trainer"], ["Profil Akademi", "/admin/profil-akademi"]] },
  { title: "Konten", links: [["Artikel", "/admin/artikel"], ["Galeri", "/admin/galeri"], ["Media", "/admin/media"], ["Testimoni", "/admin/testimoni"], ["Partner", "/admin/partner"]] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return <div className="min-h-screen bg-[#F4F8FC] text-[#10243F]">
    <header className="flex h-16 items-center justify-between border-b border-[#D8E4F0] bg-white px-5 lg:px-8">
      <div className="flex items-center gap-4">
        <button type="button" className="rounded-lg border border-[#D8E4F0] px-3 py-2 lg:hidden" aria-label="Buka navigasi" aria-expanded={open} onClick={() => setOpen(!open)}>Menu</button>
        <Link href="/admin" className="font-bold tracking-wide text-[#26599A]">ALBANA SPEECH ACADEMY</Link>
      </div>
      <button type="button" onClick={signOut} className="rounded-xl border border-[#D8E4F0] px-4 py-2 text-sm font-semibold hover:bg-[#EDF4FB]">Keluar</button>
    </header>
    <div className="mx-auto flex max-w-[1600px]">
      <aside className={`${open ? "block" : "hidden"} w-full shrink-0 border-b border-[#D8E4F0] bg-white p-5 lg:block lg:min-h-[calc(100vh-4rem)] lg:w-60 lg:border-b-0 lg:border-r`}>
        <nav aria-label="Navigasi CMS" className="space-y-7">
          {groups.map((group) => <div key={group.title}>
            <h2 className="mb-2 px-3 text-xs font-bold uppercase tracking-widest text-[#566B84]">{group.title}</h2>
            <div className="space-y-1">{group.links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined} className={`block rounded-xl px-3 py-2.5 text-sm font-semibold ${pathname === href ? "bg-[#DCEBFA] text-[#163E70]" : "text-[#344B66] hover:bg-[#EDF4FB]"}`}>{label}</Link>)}</div>
          </div>)}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
    </div>
  </div>;
}
