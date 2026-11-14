import React from "react";
import CmsCollectionClient, { type CmsField } from "@/components/admin/cms/CmsCollectionClient";
import { requireAdminMember } from "@/lib/server/admin-guard";

export const dynamic = "force-dynamic";

export default async function BatchPage() {
  const supabase = await requireAdminMember();
  const [{ data: batches }, { data: programs }] = await Promise.all([
    supabase.from("batches").select("*").order("title", { ascending: true }),
    supabase.from("programs").select("slug, title").order("title", { ascending: true }),
  ]);

  const labels = Object.fromEntries(
    (programs ?? []).map((program) => [program.slug, program.title])
  );

  const fields: CmsField[] = [
    {
      name: "program_slug",
      label: "Program",
      type: "select",
      required: true,
      options: (programs ?? []).map((program) => program.slug),
      labels,
      help: "Terisi dari tab aktif. Ganti jika batch ini milik program lain.",
    },
    {
      name: "title",
      label: "Nama batch",
      required: true,
      placeholder: "Contoh: Batch Agustus 2026",
    },
    {
      name: "form_kind",
      label: "Varian formulir",
      type: "select",
      required: true,
      options: ["series", "exclusive", "bnsp"],
      labels: {
        series: "Public Speaking Series",
        exclusive: "Basic to Advance Eksklusif",
        bnsp: "Sertifikasi BNSP",
      },
      help: "Menentukan naskah pertanyaan di halaman daftar. Naskah bisa disesuaikan lagi pada halaman Program.",
    },
    {
      name: "venue",
      label: "Tempat",
      required: true,
      placeholder: "Contoh: Online via Zoom",
    },
    {
      name: "address",
      label: "Alamat / keterangan tempat",
      required: true,
      placeholder: "Contoh: Jl. Diponegoro No. 61 Bandung",
    },
    {
      name: "sessions",
      label: "Jadwal sesi (WIB)",
      type: "sessions",
      required: true,
      help: "Isi tanggal dan jam tiap pertemuan. Jam selesai harus setelah jam mulai dan tidak tumpang tindih.",
    },
    {
      name: "price_idr",
      label: "Harga berlaku",
      type: "price",
      required: true,
      help: "Nominal yang dibayar peserta. Wajib agar pendaftaran bisa dibuka.",
    },
    {
      name: "normal_price_idr",
      label: "Harga normal (opsional)",
      type: "price",
      help: "Isi hanya bila ada harga coret.",
    },
    {
      name: "fee_details",
      label: "Rincian biaya (opsional)",
      type: "textarea",
      help: "Tulis benefit atau cakupan biaya, bukan ulangan nominal.",
    },
    {
      name: "dp_percent",
      label: "DP (%)",
      type: "number",
      help: "Kosongkan bila DP tidak ditawarkan.",
    },
    {
      name: "registration_open",
      label: "Buka pendaftaran",
      type: "boolean",
      help: "Peserta baru bisa mendaftar setelah ini dicentang, asalkan sesi pertama belum lewat.",
    },
  ];

  return (
    <CmsCollectionClient
      table="batches"
      primaryKey="slug"
      title="Batch"
      description="Satu penyimpanan menulis program dan seluruh jadwal sesi sekaligus. Pilih tab program untuk melihat batch-nya."
      fields={fields}
      initialRows={batches ?? []}
      displayField="title"
      emptyText={
        (programs ?? []).length
          ? "Belum ada batch untuk program ini. Klik Tambah untuk membuat batch pertama."
          : "Buat Program terlebih dahulu, lalu tambahkan batch."
      }
      groupBy="program_slug"
      activeField="is_active"
      formHint="Isi program dan nama batch, lalu jadwal sesinya."
    />
  );
}
