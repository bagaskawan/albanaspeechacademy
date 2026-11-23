import CmsCollectionClient, { type CmsField, type CmsRegistrantOption } from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";

export const dynamic = "force-dynamic";

const fields: CmsField[] = [
  { name: "photo_url", label: "Foto pemberi testimoni", type: "gallery", bucket: "testimonials", help: "Gunakan foto yang sudah mendapat izin publikasi. Jika kosong, otomatis memakai inisial 2 huruf." },
  { name: "attribution", label: "Nama pemberi testimoni", type: "registrant", linkedRoleField: "role_label", required: true, help: "Pilih dari data pendaftar atau isi nama secara manual." },
  { name: "quote", label: "Kutipan", type: "textarea", required: true, minWords: 40, maxWords: 50 },
  { name: "role_label", label: "Program & Batch", hiddenInForm: true },
];

type RegistrationItemRow = {
  batch_slug?: string;
  batches?: { title?: string | null; programs?: { title?: string | null } | { title?: string | null }[] | null }
    | { title?: string | null; programs?: { title?: string | null } | { title?: string | null }[] | null }[]
    | null;
};

function formatRegistrantRole(offerTitle: string | null, items: RegistrationItemRow[] | null | undefined): string {
  const parts: string[] = [];
  for (const item of items ?? []) {
    const batch = Array.isArray(item.batches) ? item.batches[0] : item.batches;
    const prog = batch?.programs ? (Array.isArray(batch.programs) ? batch.programs[0] : batch.programs) : null;
    const progTitle = prog?.title?.trim() ?? "";
    const batchTitle = batch?.title?.trim() ?? "";
    if (progTitle && batchTitle) parts.push(`${progTitle} · ${batchTitle}`);
    else if (batchTitle) parts.push(batchTitle);
  }
  if (parts.length > 0) return parts.join(", ");
  return offerTitle?.trim() ?? "";
}

export default async function TestimoniPage() {
  const supabase = await requireAdminMember();
  const [{ data, error }, { data: regRows }] = await Promise.all([
    supabase.from("testimonials").select("*").order("id", { ascending: false }),
    academyBillingClient()
      .from("academy_registrations")
      .select("id, full_name, offer_title, academy_registration_items(batch_slug, batches(title, programs(title)))")
      .order("received_at", { ascending: false })
      .limit(200),
  ]);
  if (error) throw new Error("Testimoni belum bisa dimuat.");

  const registrants: CmsRegistrantOption[] = (regRows ?? [])
    .filter((row) => typeof row.full_name === "string" && row.full_name.trim() !== "")
    .map((row) => ({
      id: String(row.id),
      name: row.full_name.trim(),
      roleLabel: formatRegistrantRole(
        typeof row.offer_title === "string" ? row.offer_title : null,
        row.academy_registration_items as RegistrationItemRow[] | null | undefined,
      ),
    }));

  return (
    <CmsCollectionClient
      table="testimonials"
      primaryKey="id"
      title="Testimoni"
      description="Publikasikan hanya testimoni yang memiliki izin."
      fields={fields}
      initialRows={data ?? []}
      registrants={registrants}
      displayField="attribution"
      searchPlaceholder="Cari nama…"
      filters={[{ param: "published", label: "Status", options: [{ value: "true", label: "Terbit" }, { value: "false", label: "Draf" }] }]}
      exportModule="testimoni"
      createLabel="Tambah testimoni"
      emptyText="Belum ada testimoni."
      maxWidth="max-w-2xl"
    />
  );
}
