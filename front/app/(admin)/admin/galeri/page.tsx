import React from "react";
import CmsCollectionClient, { type CmsField } from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

const fields: CmsField[] = [
  {
    name: "image_url",
    label: "Foto Sampul",
    type: "gallery",
    required: true,
    placeholder: "Pilih Foto Sampul",
    help: "Maksimal 5MB (JPG, PNG, WEBP).",
  },
  { name: "title", label: "Nama gambar" },
];

export default async function GaleriPage() {
  const supabase = await requireAdminMember();
  const { data } = await supabase.from("gallery").select("*").order("id", { ascending: false });

  return (
    <CmsCollectionClient
      table="gallery"
      primaryKey="id"
      title="Gallery"
      description="Gambar publik dengan nama sebagai keterangan. Hanya gunakan gambar yang sudah diizinkan untuk dipublikasikan."
      fields={fields}
      initialRows={data ?? []}
      displayField="title"
      emptyText="Tidak ada gambar yang ditemukan."
      maxWidth="max-w-lg"
      bento
    />
  );
}
