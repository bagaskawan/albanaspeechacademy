import React from "react";
import CmsCollectionClient, { type CmsField } from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

const fields: CmsField[] = [
  {
    name: "image_url",
    label: "Foto Kegiatan",
    type: "gallery",
    bucket: "inhouse-gallery",
    required: true,
    placeholder: "Tarik & lepas beberapa foto ke sini, atau klik untuk memilih",
    help: "Bisa pilih banyak file sekaligus (JPEG, PNG, WebP · maks. 10 MiB/foto). Semua resolusi & orientasi diperbolehkan.",
  },
  {
    name: "title",
    label: "Keterangan gambar (opsional)",
    required: false,
    help: "Opsional. Jika dikosongkan, foto tetap tersimpan tanpa keterangan.",
  },
];

export default async function InhouseGaleriPage() {
  const supabase = await requireAdminMember();
  const { data } = await supabase.from("inhouse_gallery").select("*").order("id", { ascending: false });

  return (
    <CmsCollectionClient
      table="inhouse_gallery"
      primaryKey="id"
      title="Galeri In House Training"
      createTitle="Tambah Galeri In House Training"
      editTitle="Ubah Galeri In House Training"
      description="Dokumentasi foto kegiatan In House Training. Foto dapat langsung dipublikasikan."
      fields={fields}
      initialRows={data ?? []}
      displayField="title"
      searchPlaceholder="Cari gambar…"
      createLabel="Tambah gambar"
      emptyText="Tidak ada gambar yang ditemukan."
      modalSize="lg"
      multiGallery={{
        maxTotal: 20,
        minRecommended: 15,
        autoConsentField: "consent_verified_at",
      }}
      bento
    />
  );
}
