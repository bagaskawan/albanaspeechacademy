"use client";

import React, { useState } from "react";
import { Eye, ExternalLink, MessageCircle, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Registration = {
  id: number;
  batch_slug: string;
  full_name: string;
  whatsapp: string;
  email: string;
  nickname: string | null;
  domicile: string;
  gender: string;
  age: number;
  profession: string;
  institution: string;
  socials: string[] | null;
  social_other: string | null;
  social_name: string | null;
  prior_experience: boolean;
  goal: string;
  challenge: string;
  source: string;
  source_other: string | null;
  attendance: string;
  payment_method: string;
  price_idr_at_signup: number;
  initial_transfer_idr: number;
  remaining_after_transfer_idr: number;
  received_at: string;
  batches?: {
    title?: string;
    programs?: { title?: string };
  } | null;
};

const rupiah = (value: unknown) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const dateTime = (value: unknown) => {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
};

const dateOnly = (value: unknown) => {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const text = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
};

const paymentOptions: Record<string, string> = {
  full: "Transfer lunas",
  dp20: "DP 20%",
};

const attendanceLabel = (value: unknown) =>
  value === "yes" ? "Ya, siap hadir penuh" : value === "maybe" ? "Mungkin" : text(value);

const waLink = (whatsapp: string) => `https://wa.me/${String(whatsapp).replace(/[^0-9]/g, "")}`;

const formatWhatsapp = (value: unknown) => {
  const digits = String(value ?? "").replace(/[^0-9]/g, "").replace(/^62/, "0");
  if (!digits) return "—";
  const parts = digits.match(/^(\d{4})(\d{4})(\d+)$/);
  return parts ? `${parts[1]}-${parts[2]}-${parts[3]}` : digits;
};

export default function PendaftarClient({ initialRows }: { initialRows: Registration[] }) {
  const [rows, setRows] = useState(initialRows);
  const [detailRow, setDetailRow] = useState<Registration | null>(null);
  const [deleteRow, setDeleteRow] = useState<Registration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const programOptions = Array.from(
    new Set(rows.map((row) => row.batches?.programs?.title).filter((title): title is string => !!title))
  ).sort();
  const batchOptions = Array.from(
    new Set(rows.map((row) => row.batches?.title).filter((title): title is string => !!title))
  ).sort();

  const filteredRows = rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      [row.full_name, row.email, row.whatsapp].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      );
    const matchesProgram =
      programFilter === "all" || row.batches?.programs?.title === programFilter;
    const matchesBatch = batchFilter === "all" || row.batches?.title === batchFilter;
    return matchesSearch && matchesProgram && matchesBatch;
  });

  const handleDelete = async () => {
    if (!deleteRow || isDeleting) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("registrations").delete().eq("id", deleteRow.id);
      if (error) throw error;
      setRows((prev) => prev.filter((row) => row.id !== deleteRow.id));
      toast.success("Pendaftar dihapus.");
      if (detailRow?.id === deleteRow.id) setDetailRow(null);
      setDeleteRow(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus pendaftar.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-lg font-black tracking-wider text-text-primary uppercase">Data Pendaftar</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Pendaftar terbaru di atas. Buka detail untuk membaca seluruh jawaban dan mencocokkan bukti transfer.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            aria-label="Cari pendaftar"
            placeholder="Cari nama, email, nomor WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-bg-well/70 border border-border-default rounded-full pl-9 pr-4 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-text-primary font-medium transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
          <div className="sm:w-48">
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-full h-9 rounded-full px-3 text-xs font-medium bg-bg-well/70 border-border-default">
                <SelectValue placeholder="Semua Program" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border-default">
                <SelectItem value="all">Semua Program</SelectItem>
                {programOptions.map((title) => (
                  <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-48">
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-full h-9 rounded-full px-3 text-xs font-medium bg-bg-well/70 border-border-default">
                <SelectValue placeholder="Semua Batch" />
              </SelectTrigger>
              <SelectContent className="bg-bg-card border-border-default">
                <SelectItem value="all">Semua Batch</SelectItem>
                {batchOptions.map((title) => (
                  <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="bg-bg-card border border-border-default border-dashed rounded-2xl p-10 text-center">
          <p className="text-xs font-semibold text-text-secondary">Belum ada pendaftar.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-bg-card border border-border-default/70 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default/70 bg-bg-well/50">
                    <th className="py-3.5 px-3.5 border-r border-border-default/60 uppercase tracking-wider font-bold">Nama Peserta</th>
                    <th className="py-3.5 px-3.5 border-r border-border-default/60 uppercase tracking-wider font-bold">Program</th>
                    <th className="py-3.5 px-3.5 border-r border-border-default/60 uppercase tracking-wider font-bold">WhatsApp</th>
                    <th className="py-3.5 px-3.5 border-r border-border-default/60 uppercase tracking-wider font-bold">Biaya</th>
                    <th className="py-3.5 px-3.5 border-r border-border-default/60 uppercase tracking-wider font-bold">Status</th>
                    <th className="py-3.5 px-3.5 border-r border-border-default/60 uppercase tracking-wider font-bold whitespace-nowrap">Tgl Masuk</th>
                    <th className="py-3.5 px-3.5 text-center uppercase tracking-wider font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/40">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-text-muted">
                        Tidak ada pendaftar ditemukan.
                      </td>
                    </tr>
                  ) : filteredRows.map((row) => {
                    const batch = row.batches ?? {};
                    const program = batch.programs ?? {};
                    return (
                      <tr key={row.id} className="group hover:bg-bg-well/30 transition-colors">
                        <td className="py-3.5 px-3.5">
                          <div className="font-bold text-text-primary">{row.full_name}</div>
                        </td>
                        <td className="py-3.5 px-3.5 text-text-secondary font-normal">
                          <div className="text-text-primary font-medium truncate max-w-[140px]" title={program.title ?? "—"}>
                            {program.title ?? "—"}
                          </div>
                          <div className="text-[10px] mt-0.5 truncate max-w-[140px]" title={batch.title ?? "—"}>
                            {batch.title ?? "—"}
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 text-text-secondary font-normal font-mono whitespace-nowrap">{formatWhatsapp(row.whatsapp)}</td>
                        <td className="py-3.5 px-3.5 text-text-secondary font-normal font-mono whitespace-nowrap">{rupiah(row.price_idr_at_signup)}</td>
                        <td className="py-3.5 px-3.5">
                          <StatusBadge method={row.payment_method} />
                        </td>
                        <td className="py-3.5 px-3.5 text-text-secondary font-normal whitespace-nowrap">{dateOnly(row.received_at)}</td>
                        <td className="py-3.5 px-3.5 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => setDetailRow(row)}
                              className="p-1.5 rounded-full border border-border-default bg-bg-well hover:bg-bg-page text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                              title="Lihat Detail"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteRow(row)}
                              className="p-1.5 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {filteredRows.length === 0 ? (
              <div className="bg-bg-card border border-border-default border-dashed rounded-2xl p-8 text-center">
                <p className="text-xs font-semibold text-text-secondary">Tidak ada pendaftar ditemukan.</p>
              </div>
            ) : filteredRows.map((row) => {
              const batch = row.batches ?? {};
              const program = batch.programs ?? {};
              return (
                <div key={row.id} className="bg-bg-card border border-border-default/70 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-text-primary truncate">{row.full_name}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5 truncate">
                        {program.title ?? "—"} · {batch.title ?? "—"}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <StatusBadge method={row.payment_method} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                    <div className="min-w-0">
                      <p className="text-text-muted">Email</p>
                      <p className="text-text-primary truncate">{row.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">WhatsApp</p>
                      <p className="text-text-primary font-mono">{formatWhatsapp(row.whatsapp)}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Biaya</p>
                      <p className="text-text-primary font-mono">{rupiah(row.price_idr_at_signup)}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Tgl Masuk</p>
                      <p className="text-text-primary">{dateOnly(row.received_at)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      onClick={() => setDetailRow(row)}
                      className="h-8 px-2.5 rounded-xl bg-bg-well border border-border-default text-[11px] font-semibold text-text-primary hover:bg-bg-page flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      <Eye size={13} /> Detail
                    </button>
                    <a
                      href={waLink(row.whatsapp)}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </a>
                    <button
                      onClick={() => setDeleteRow(row)}
                      className="ml-auto h-8 px-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/20 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Modal
        isOpen={!!detailRow}
        onClose={() => setDetailRow(null)}
        maxWidth="max-w-lg"
        icon={(detailRow?.full_name || "P")[0].toUpperCase()}
        title={detailRow?.full_name}
        subtitle={detailRow ? `${detailRow.email} · ${detailRow.batches?.programs?.title ?? "—"}` : undefined}
        footer={
          <div className="flex gap-2.5 w-full">
            <button
              onClick={() => setDetailRow(null)}
              className="h-10 px-4 text-xs font-bold rounded-xl text-text-secondary bg-bg-well hover:bg-bg-well/80 border border-border-default transition-colors w-full cursor-pointer text-center"
            >
              Tutup
            </button>
            {detailRow?.whatsapp && (
              <a
                href={waLink(detailRow.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 text-xs font-bold rounded-xl text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-yellow-100 dark:text-zinc-900 dark:hover:bg-yellow-200 transition-colors w-full flex justify-center items-center gap-2 cursor-pointer text-center"
              >
                <span>Kirim WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        }
      >
        {detailRow && (
          <div className="flex flex-col gap-3 text-xs">
            <ModalSection title="Informasi Personal">
              <div className="space-y-2">
                <InfoRow label="Nama Panggilan" value={text(detailRow.nickname)} />
                <InfoRow label="Domisili" value={text(detailRow.domicile)} />
                <InfoRow label="Jenis Kelamin" value={text(detailRow.gender)} />
                <InfoRow label="Usia" value={text(detailRow.age)} />
                <InfoRow label="Pekerjaan" value={text(detailRow.profession)} />
                <InfoRow label="Instansi" value={text(detailRow.institution)} />
                <InfoRow
                  label="Tgl Terdaftar"
                  value={new Date(detailRow.received_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
              </div>
            </ModalSection>

            <ModalSection title="Kontak & Sosial Media">
              <div className="space-y-2">
                <InfoRow label="No. WhatsApp" value={<span className="font-mono">{formatWhatsapp(detailRow.whatsapp)}</span>} />
                <InfoRow label="Email" value={detailRow.email || "-"} />
                {detailRow.socials?.length ? <InfoRow label="Platform sosial" value={text(detailRow.socials)} /> : null}
                <InfoRow label="Media sosial" value={text(detailRow.social_name)} />
                {detailRow.social_other ? <InfoRow label="Sosial lainnya" value={detailRow.social_other} /> : null}
              </div>
            </ModalSection>

            <ModalSection title="Program & Pembayaran">
              <div className="space-y-2">
                <InfoRow label="Program" value={detailRow.batches?.programs?.title ?? "—"} />
                <InfoRow label="Batch" value={detailRow.batches?.title ?? detailRow.batch_slug} />
                <InfoRow label="Biaya" value={<span className="font-mono">{rupiah(detailRow.price_idr_at_signup)}</span>} />
                <InfoRow label="Metode" value={paymentOptions[String(detailRow.payment_method)] ?? text(detailRow.payment_method)} />
                <InfoRow label="Transfer Awal" value={<span className="font-mono">{rupiah(detailRow.initial_transfer_idr)}</span>} />
                <InfoRow label="Sisa" value={<span className="font-mono">{rupiah(detailRow.remaining_after_transfer_idr)}</span>} />
              </div>
            </ModalSection>

            <ModalSection title="Jawaban Form">
              <div className="space-y-2">
                <InfoRow label="Pernah Pelatihan" value={text(detailRow.prior_experience)} />
                <InfoRow label="Sumber Informasi" value={text(detailRow.source)} />
                <InfoRow label="Sumber Lainnya" value={text(detailRow.source_other)} />
                <InfoRow label="Kesediaan Jadwal" value={attendanceLabel(detailRow.attendance)} />
                <InfoRow label="Waktu Masuk" value={dateTime(detailRow.received_at)} />
              </div>
              <div className="mt-3 space-y-2 border-t border-border-default/60 pt-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Tujuan Mengikuti Program</p>
                  <p className="text-xs text-text-primary whitespace-pre-wrap mt-1">{text(detailRow.goal)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Tantangan Terbesar</p>
                  <p className="text-xs text-text-primary whitespace-pre-wrap mt-1">{text(detailRow.challenge)}</p>
                </div>
              </div>
            </ModalSection>
          </div>
        )}
      </Modal>

      <DeleteConfirmDialog
        isOpen={!!deleteRow}
        onOpenChange={(open) => { if (!open) setDeleteRow(null); }}
        title="Hapus Pendaftar"
        description={
          deleteRow
            ? `Hapus pendaftar "${deleteRow.full_name}"? Tindakan ini permanen.`
            : ""
        }
        confirmLabel={isDeleting ? "Menghapus..." : "Hapus"}
        onConfirm={() => { void handleDelete(); }}
      />
    </div>
  );
}

function StatusBadge({ method }: { method: string }) {
  const styles =
    method === "full"
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : method === "dp20"
        ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
        : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  const dot = method === "full" ? "bg-emerald-500" : method === "dp20" ? "bg-red-500" : "bg-zinc-400";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {method === "full" ? "Lunas" : method === "dp20" ? "DP 20%" : text(method)}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-text-muted font-medium shrink-0">{label}:</span>
      <span className="font-semibold text-text-primary text-right break-words">{value}</span>
    </div>
  );
}
