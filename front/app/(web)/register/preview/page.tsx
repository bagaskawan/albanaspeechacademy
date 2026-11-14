import { notFound } from "next/navigation";
import { RegisterPage } from "@/components/register/register-page";
import type { RegistrationBatch } from "@/lib/registration";

// TEMPORARY preview route (dev only): delete once a real accepting batch exists.
const previewBatch: RegistrationBatch = {
  programSlug: "public-speaking-series",
  batchSlug: "preview-series-01",
  programName: "Public Speaking Series",
  batchName: "Batch Preview",
  formatLabel: "4 pertemuan",
  timeLabel: "09.00–17.00 WIB",
  sessions: [
    { sequence: 1, dateLabel: "Sabtu, 21 November 2026" },
    { sequence: 2, dateLabel: "Sabtu, 28 November 2026" },
    { sequence: 3, dateLabel: "Sabtu, 5 Desember 2026" },
    { sequence: 4, dateLabel: "Sabtu, 12 Desember 2026" },
  ],
  venue: { name: "Ruang Latihan ASA", address: "Jl. Diponegoro No. 61 Bandung" },
  formKind: "series",
  formCopy: null,
  priceIdr: 1500000,
  normalPriceIdr: null,
  feeDetails: "Termasuk 4 pertemuan, modul, dan sertifikat.",
  dpPercent: 20,
};

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <RegisterPage selection={{ status: "ready", batch: previewBatch }} />;
}
