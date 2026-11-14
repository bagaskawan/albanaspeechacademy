import React from "react";
import CmsCollectionClient, { type CmsField } from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

const fields: CmsField[] = [
  { name: "name", label: "Nama trainer", required: true },
  { name: "expertise", label: "Keahlian", type: "tags", placeholder: "Public Speaking, MC, Voice Over" },
  { name: "photo_url", label: "Foto trainer", type: "gallery", help: "Diunggah ke penyimpanan internal (bucket Gallery)." },
  { name: "bio", label: "Bio singkat", type: "textarea" },
];

export default async function TrainerPage() {
  const supabase = await requireAdminMember();
  const { data } = await supabase.from("trainers").select("*").order("name", { ascending: true });

  return (
    <CmsCollectionClient
      table="trainers"
      primaryKey="slug"
      title="Trainer"
      description="Nama, keahlian, foto, dan bio singkat pengajar yang tampil di profil program."
      formHint="Isi nama, keahlian, foto, dan bio singkat trainer."
      fields={fields}
      initialRows={data ?? []}
      displayField="name"
      emptyText="Tidak ada trainer yang terdaftar."
    />
  );
}
