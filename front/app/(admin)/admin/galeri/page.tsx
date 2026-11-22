import React from "react";
import CmsCollectionClient, { type CmsField } from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

const fields: CmsField[] = [
  {
    name: "image_url",
    label: "Foto Kegiatan",
    type: "gallery",
    required: true,
    placeholder: "Tarik & lepas beberapa foto ke sini, atau klik untuk memilih",
    help: "Bisa pilih banyak file sekaligus (JPEG, PNG, WebP · maks. 10 MiB/foto). Semua resolusi & orientasi diperbolehkan.",
  },
];

export default async function GaleriPage() {
  const supabase = await requireAdminMember();
  const { data } = await supabase.from("gallery").select("*").order("id", { ascending: false });

  return (
    <CmsCollectionClient
      table="gallery"
      primaryKey="id"
      title="Galeri"
      createTitle="Tambah Galeri"
      editTitle="Ubah Galeri"
      description="Dokumentasi foto kegiatan Albana Speech Academy. Foto dapat langsung dipublikasikan."
      fields={fields}
      initialRows={data ?? []}
      displayField="title"
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
