import React from "react";
import CmsCollectionClient, {
  type CmsField,
  type CmsMemberOption,
} from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

export default async function TestimoniPage() {
  const supabase = await requireAdminMember();
  const [{ data: testimonials }, { data: members }] = await Promise.all([
    supabase.from("testimonials").select("*").order("id", { ascending: false }),
    supabase.from("members").select("id, full_name").order("full_name", { ascending: true }),
  ]);

  const memberOptions: CmsMemberOption[] = (members ?? []).map((member) => ({
    id: member.id,
    name: member.full_name,
  }));
  // Table menampilkan uuid member; labels mengubahnya menjadi nama member.
  const memberLabels = Object.fromEntries(memberOptions.map((member) => [member.id, member.name]));

  const fields: CmsField[] = [
    {
      name: "photo_url",
      label: "Foto testimoner",
      type: "gallery",
      bucket: "testimonials",
      placeholder: "Pilih Foto Testimoner",
      help: "Maksimal 5MB (JPG, PNG, WEBP).",
    },
    {
      name: "member_id",
      label: "Nama testimoner",
      type: "member",
      labels: memberLabels,
      required: true,
      help: "Nama diambil otomatis dari data member yang terdaftar.",
    },
    {
      name: "quote",
      label: "Kata-kata testimoni",
      type: "textarea",
      required: true,
      minWords: 20,
      maxWords: 30,
      placeholder: "Tulis 20–30 kata testimoni.",
      help: "Wajib 20–30 kata.",
    },
    {
      name: "role_label",
      label: "Keterangan (opsional)",
      placeholder: "Alumni Public Speaking",
    },
  ];

  return (
    <CmsCollectionClient
      table="testimonials"
      primaryKey="id"
      title="Testimoni"
      description="Foto, nama dari data member, dan kutipan 20–30 kata yang sudah memiliki izin publikasi."
      formHint="Pilih member, unggah foto, lalu tulis kutipan 20–30 kata."
      fields={fields}
      initialRows={testimonials ?? []}
      displayField="member_id"
      emptyText="Belum ada testimoni yang terdaftar."
      members={memberOptions}
      maxWidth="max-w-2xl"
    />
  );
}
