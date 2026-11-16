import CmsCollectionClient, { type CmsField } from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

const fields: CmsField[] = [
  { name: "photo_url", label: "Foto pemberi testimoni", type: "gallery", bucket: "testimonials", help: "Gunakan foto yang sudah mendapat izin publikasi." },
  { name: "attribution", label: "Nama pemberi testimoni", required: true },
  { name: "quote", label: "Kutipan", type: "textarea", required: true, minWords: 20, maxWords: 30 },
  { name: "role_label", label: "Keterangan" },
];

export default async function TestimoniPage() {
  const supabase = await requireAdminMember();
  const { data, error } = await supabase.from("testimonials").select("*").order("id", { ascending: false });
  if (error) throw new Error("Testimoni belum bisa dimuat.");
  return <CmsCollectionClient table="testimonials" primaryKey="id" title="Testimoni" description="Publikasikan hanya testimoni yang memiliki izin." fields={fields} initialRows={data ?? []} displayField="attribution" searchPlaceholder="Cari nama…" filters={[{ param: "published", label: "Status", options: [{ value: "true", label: "Terbit" }, { value: "false", label: "Draf" }] }]} exportModule="testimoni" createLabel="Tambah testimoni" emptyText="Belum ada testimoni." maxWidth="max-w-2xl" />;
}
