import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const dynamic = "force-dynamic";

export default async function PendaftarPage() {
  await requireAdminMember();
  const { data, error } = await academyBillingClient().from("academy_registrations")
    .select("id,full_name,email,offer_title,primary_batch_slug,payment_method,received_at")
    .order("received_at", { ascending: false });
  if (error) throw new Error("Pendaftar belum bisa dimuat.");

  return <div className="space-y-6">
    <div><h1 className="text-3xl font-bold">Pendaftar Albana</h1><p className="mt-2 text-admin-text-secondary">Pendaftaran yang masuk melalui formulir Albana. Status pembayaran diperiksa di Tagihan.</p></div>
    <div className="overflow-x-auto rounded-2xl border border-admin-line bg-admin-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-admin-surface-muted text-admin-text-secondary"><tr><th className="px-5 py-4">Masuk</th><th className="px-5 py-4">Nama</th><th className="px-5 py-4">Program</th><th className="px-5 py-4">Pembayaran</th></tr></thead>
        <tbody>{(data ?? []).map((item) => <tr key={item.id} className="border-t border-admin-line"><td className="px-5 py-4">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(item.received_at))}</td><td className="px-5 py-4 font-semibold">{item.full_name}<span className="block font-normal text-admin-text-secondary">{item.email}</span></td><td className="px-5 py-4">{item.offer_title}<span className="block text-admin-text-secondary">{item.primary_batch_slug}</span></td><td className="px-5 py-4">{item.payment_method === "dp" ? "DP" : "Lunas"}</td></tr>)}</tbody>
      </table>
      {!data?.length && <p className="p-8 text-sm text-admin-text-secondary">Belum ada pendaftaran Albana.</p>}
    </div>
  </div>;
}
