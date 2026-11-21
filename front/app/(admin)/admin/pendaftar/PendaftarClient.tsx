"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  FileText,
  MessageCircle,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageBadge } from "@/components/admin/PageHeader";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";
import { DeleteSheet } from "@/components/admin/ui/delete-sheet";
import {
  DataTable,
  StatusChip,
  rowActionClass,
} from "@/components/admin/ui/data-table";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { TableToolbar } from "@/components/admin/ui/table-toolbar";
import { createClient } from "@/lib/supabase/client";
import { deleteRegistration } from "./actions";

export type PendaftarInvoice = {
  id: number;
  invoice_number: string | null;
  stage: string;
  status: string;
  subtotal_idr: number | string;
  unique_code: number | string;
  total_idr: number | string;
  received_idr: number | string | null;
};

export type PendaftarAnswers = {
  nickname?: string | null;
  domicile?: string | null;
  professionCategory?: string | null;
  profession?: string | null;
  institution?: string | null;
  age?: number | null;
  gender?: string | null;
  priorExperience?: boolean | null;
  attendance?: string | null;
  source?: string | null;
  sourceOther?: string | null;
  socials?: string[] | null;
  socialOther?: string | null;
  socialName?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  goal?: string | null;
  challenge?: string | null;
};

export type PendaftarRegistrationItem = {
  batch_slug: string;
  batches?: { title: string | null } | { title: string | null }[] | null;
};

export type PendaftarRecord = {
  id: number;
  full_name: string;
  email: string;
  whatsapp: string;
  offer_title: string;
  offer_slug: string | null;
  primary_batch_slug: string | null;
  payment_method: string;
  price_idr_at_signup: number | string;
  dp_percent_at_signup: number | null;
  received_at: string;
  answers: PendaftarAnswers | null;
  academy_registration_items: PendaftarRegistrationItem[] | null;
  academy_invoices: PendaftarInvoice[] | null;
};

const formatJoinDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
};

const formatJoinDateLong = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
};

const rupiah = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatWhatsapp = (value: string | null | undefined) => {
  const digits = String(value ?? "")
    .replace(/\D/g, "")
    .replace(/^62/, "0");
  if (!digits) return "—";
  const parts = digits.match(/^(\d{4})(\d{4})(\d+)$/);
  return parts ? `${parts[1]}-${parts[2]}-${parts[3]}` : digits;
};

const whatsappHref = (value: string | null | undefined): string | null => {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
};

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  referral: "Rekomendasi teman / kenalan",
  other: "Lainnya",
};

const ATTENDANCE_LABELS: Record<string, string> = {
  yes: "Ya, siap hadir penuh",
  maybe: "Mungkin / menyesuaikan",
};

const INVOICE_STATUS_MAP = {
  verified: { tone: "mint", label: "Terverifikasi" },
  pending: { tone: "peach", label: "Menunggu" },
  rejected: { tone: "rose", label: "Ditolak" },
} as const;

type ProgramColorStyle = {
  badge: string;
  dot: string;
  filterActive: string;
  countText: string;
};

const PROGRAM_PALETTE: ProgramColorStyle[] = [
  {
    badge:
      "bg-sky-100/90 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800/60",
    dot: "bg-sky-500",
    filterActive:
      "bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] shadow-2xs dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
    countText: "text-[#0369a1] dark:text-sky-300",
  },
  {
    badge:
      "bg-admin-lilac-soft text-admin-lilac-ink border-admin-lilac-dot/30",
    dot: "bg-admin-lilac-dot",
    filterActive:
      "bg-admin-lilac-soft text-admin-lilac-ink border border-admin-lilac-dot/40 shadow-2xs",
    countText: "text-admin-lilac-ink",
  },
  {
    badge:
      "bg-admin-peach-soft text-admin-peach-ink border-admin-peach-dot/30",
    dot: "bg-admin-peach-dot",
    filterActive:
      "bg-admin-peach-soft text-admin-peach-ink border border-admin-peach-dot/40 shadow-2xs",
    countText: "text-admin-peach-ink",
  },
  {
    badge:
      "bg-admin-mint-soft text-admin-mint-ink border-admin-mint-dot/30",
    dot: "bg-admin-mint-dot",
    filterActive:
      "bg-admin-mint-soft text-admin-mint-ink border border-admin-mint-dot/40 shadow-2xs",
    countText: "text-admin-mint-ink",
  },
  {
    badge:
      "bg-admin-rose-soft text-admin-rose-ink border-admin-rose-dot/30",
    dot: "bg-admin-rose-dot",
    filterActive:
      "bg-admin-rose-soft text-admin-rose-ink border border-admin-rose-dot/40 shadow-2xs",
    countText: "text-admin-rose-ink",
  },
];

const DEFAULT_PROGRAMS = [
  "Public Speaking Series",
  "Public Speaking for Speakers",
  "Sertifikasi Pembicara Profesional",
];

function getProgramBadgeStyle(offerTitle: string, offerSlug: string | null): ProgramColorStyle {
  const normalized = offerTitle.toLowerCase();
  if (offerSlug || normalized.includes("paket") || normalized.includes("+")) {
    return PROGRAM_PALETTE[3]; // Mint — Paket Bundling
  }
  if (normalized.includes("series")) {
    return PROGRAM_PALETTE[0]; // Sky Blue — Public Speaking Series
  }
  if (normalized.includes("speaker")) {
    return PROGRAM_PALETTE[1]; // Lilac — Public Speaking for Speakers
  }
  if (normalized.includes("sertifikasi") || normalized.includes("bnsp")) {
    return PROGRAM_PALETTE[2]; // Peach/Amber — Sertifikasi
  }
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return PROGRAM_PALETTE[hash % PROGRAM_PALETTE.length];
}

function ProgramBadge({
  title,
  offerSlug,
}: {
  title: string;
  offerSlug: string | null;
}) {
  const style = getProgramBadgeStyle(title, offerSlug);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide whitespace-nowrap ${style.badge}`}
    >
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
      <span className="truncate max-w-[200px]" title={title}>
        {title}
      </span>
    </span>
  );
}

function formatSlugFallback(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function getBatchList(row: PendaftarRecord): string {
  const items = row.academy_registration_items ?? [];
  if (items.length > 0) {
    return [...items]
      .sort((a, b) => a.batch_slug.localeCompare(b.batch_slug))
      .map((item) => {
        const batchObj = Array.isArray(item.batches) ? item.batches[0] : item.batches;
        return batchObj?.title?.trim() || formatSlugFallback(item.batch_slug);
      })
      .join(" + ");
  }
  return row.primary_batch_slug ? formatSlugFallback(row.primary_batch_slug) : "—";
}

function getPaymentSummary(row: PendaftarRecord) {
  const invoices = row.academy_invoices ?? [];
  const remainingPending = invoices.find(
    (inv) => inv.stage === "remaining" && inv.status !== "verified",
  );
  const isInstallment = row.payment_method === "dp" && Boolean(remainingPending);
  return {
    invoices: [...invoices].sort((a, b) => a.id - b.id),
    isInstallment,
    remainingAmount: remainingPending ? Number(remainingPending.total_idr) : 0,
  };
}

function getSocialPills(answers: PendaftarAnswers | null): { label: string; value: string }[] {
  if (!answers) return [];
  const pills: { label: string; value: string }[] = [];
  if (answers.instagram?.trim()) pills.push({ label: "Instagram", value: answers.instagram.trim() });
  if (answers.tiktok?.trim()) pills.push({ label: "TikTok", value: answers.tiktok.trim() });
  if (answers.youtube?.trim()) pills.push({ label: "YouTube", value: answers.youtube.trim() });
  if (answers.linkedin?.trim()) pills.push({ label: "LinkedIn", value: answers.linkedin.trim() });
  if (pills.length === 0 && answers.socialName?.trim()) {
    const platform = answers.socials?.length ? answers.socials.join(", ") : "Media Sosial";
    pills.push({ label: platform, value: answers.socialName.trim() });
  }
  if (answers.socialOther?.trim()) {
    pills.push({ label: "Lainnya", value: answers.socialOther.trim() });
  }
  return pills;
}

function buildTextRecap(row: PendaftarRecord): string {
  const a = row.answers ?? {};
  const payment = getPaymentSummary(row);
  const socials = getSocialPills(row.answers);
  const lines = [
    `REKAP PENDAFTAR #${row.id} — ${row.full_name}`,
    `Tgl Bergabung: ${formatJoinDateLong(row.received_at)}`,
    "",
    "INFORMASI PERSONAL",
    `- Nama Panggilan: ${a.nickname || "—"}`,
    `- Jenis Kelamin / Usia: ${a.gender || "—"} · ${a.age ? `${a.age} tahun` : "—"}`,
    `- Domisili: ${a.domicile || "—"}`,
    `- Pekerjaan: ${a.profession || "—"}${a.professionCategory ? ` (${a.professionCategory})` : ""}`,
    `- Instansi: ${a.institution || "—"}`,
    "",
    "KONTAK & SOSIAL MEDIA",
    `- WhatsApp: ${formatWhatsapp(row.whatsapp)}`,
    `- Email: ${row.email}`,
    ...(socials.length ? socials.map((s) => `- ${s.label}: ${s.value}`) : []),
    "",
    "PROGRAM & PEMBAYARAN",
    `- Program: ${row.offer_title}`,
    `- Batch: ${getBatchList(row)}`,
    `- Biaya Program: ${rupiah(row.price_idr_at_signup)}`,
    `- Metode: ${row.payment_method === "dp" ? `DP ${row.dp_percent_at_signup ?? 20}%` : "Transfer lunas"}`,
    `- Status: ${payment.isInstallment ? `DP · Nyicil (Sisa ${rupiah(payment.remainingAmount)})` : "Lunas"}`,
    "",
    "JAWABAN PENDAFTARAN",
    `- Pernah Pelatihan: ${a.priorExperience === true ? "Ya" : a.priorExperience === false ? "Tidak" : "—"}`,
    `- Kesediaan Hadir: ${a.attendance ? (ATTENDANCE_LABELS[a.attendance] ?? a.attendance) : "—"}`,
    `- Sumber Informasi: ${a.source === "other" && a.sourceOther ? a.sourceOther : a.source ? (SOURCE_LABELS[a.source] ?? a.source) : "—"}`,
    `- Tujuan: ${a.goal || "—"}`,
    ...(a.challenge ? [`- Tantangan Utama: ${a.challenge}`] : []),
  ];
  return lines.join("\n");
}

function DetailCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-admin-line bg-admin-canvas p-4 sm:p-5">
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-admin-text-secondary">
        {icon}
        <span>{title}</span>
      </h3>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-[13px] sm:text-[14px]">
      <span className="shrink-0 text-admin-text-secondary">{label}:</span>
      <span className="min-w-0 text-right font-medium text-admin-ink break-words">
        {value}
      </span>
    </div>
  );
}

export default function PendaftarClient({
  rows,
  searching,
}: {
  rows: PendaftarRecord[];
  searching: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<PendaftarRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PendaftarRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [isRefreshing, startRefresh] = useTransition();

  // Real-time Supabase subscription for live registrant & invoice verification updates
  useEffect(() => {
    const supabase = createClient();
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    const debouncedRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        startRefresh(() => {
          router.refresh();
        });
      }, 700);
    };

    const channel = supabase
      .channel("admin_pendaftar_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "academy_registrations" },
        debouncedRefresh,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "academy_invoices" },
        debouncedRefresh,
      )
      .subscribe();

    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Auto-sync when returning to the tab after >20s
  useEffect(() => {
    let lastSyncTime = Date.now();
    const handleSync = () => {
      if (document.visibilityState === "visible" && Date.now() - lastSyncTime > 20000) {
        lastSyncTime = Date.now();
        startRefresh(() => {
          router.refresh();
        });
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [router]);

  const handleManualRefresh = () => {
    startRefresh(() => {
      router.refresh();
    });
  };

  const programFilters = useMemo(() => {
    const counts = new Map<string, { title: string; offerSlug: string | null; count: number }>();
    for (const name of DEFAULT_PROGRAMS) {
      counts.set(name, { title: name, offerSlug: null, count: 0 });
    }
    for (const row of rows) {
      const existing = counts.get(row.offer_title);
      if (existing) {
        existing.count += 1;
        if (!existing.offerSlug && row.offer_slug) existing.offerSlug = row.offer_slug;
      } else {
        counts.set(row.offer_title, {
          title: row.offer_title,
          offerSlug: row.offer_slug,
          count: 1,
        });
      }
    }
    return Array.from(counts.values());
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (programFilter === "all") return rows;
    return rows.filter((row) => row.offer_title === programFilter);
  }, [rows, programFilter]);

  const handleCopyRecap = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(buildTextRecap(selected));
      setCopied(true);
      toast.success("Rekap pendaftar disalin.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin rekap.");
    }
  };

  const liveBadge = (
    <AdminPageBadge>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700 select-none dark:text-emerald-300">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        LIVE
      </span>
    </AdminPageBadge>
  );

  const toolbar = (
    <TableToolbar
      search={{ placeholder: "Cari nama, email, nomor WA…" }}
      exportModule="pendaftar"
      exportDisabled={filteredRows.length === 0}
      onRefresh={handleManualRefresh}
      refreshing={isRefreshing}
    />
  );

  const filterBar = (
    <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-admin-line bg-admin-surface p-1.5 no-scrollbar">
      <button
        type="button"
        onClick={() => setProgramFilter("all")}
        className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all select-none ${
          programFilter === "all"
            ? "border border-[#bae6fd] bg-[#e0f2fe] text-[#0369a1] shadow-2xs dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
            : "text-admin-text-secondary hover:bg-admin-surface-muted hover:text-admin-ink"
        }`}
      >
        <Users className="size-3.5 shrink-0" aria-hidden="true" />
        <span>Semua</span>
        <span className="rounded-full bg-admin-canvas px-2 py-0.5 text-[11px] font-bold tabular-nums text-[#0369a1] shadow-2xs dark:text-sky-300">
          {rows.length}
        </span>
      </button>

      {programFilters.map((item) => {
        const style = getProgramBadgeStyle(item.title, item.offerSlug);
        const active = programFilter === item.title;
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => setProgramFilter(item.title)}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-all select-none ${
              active
                ? style.filterActive
                : "text-admin-text-secondary hover:bg-admin-surface-muted hover:text-admin-ink"
            }`}
          >
            <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${style.dot}`} />
            <span>{item.title}</span>
            <span
              className={`rounded-full bg-admin-canvas px-2 py-0.5 text-[11px] font-bold tabular-nums shadow-2xs ${style.countText}`}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );

  if (rows.length === 0) {
    return (
      <div className="space-y-5">
        {liveBadge}
        {toolbar}
        {filterBar}
        {searching ? (
          <EmptyState
            searching
            title="Tidak ada pendaftar yang cocok"
            description="Coba nama, email, atau nomor WhatsApp lain."
          />
        ) : (
          <EmptyState
            title="Belum ada pendaftar terverifikasi"
            description="Pendaftar muncul di sini setelah tagihan awalnya diverifikasi di Tagihan."
          />
        )}
      </div>
    );
  }

  const detailPayment = selected ? getPaymentSummary(selected) : null;
  const detailAnswers = selected?.answers ?? null;
  const detailSocials = selected ? getSocialPills(selected.answers) : [];
  const detailWaHref = selected ? whatsappHref(selected.whatsapp) : null;

  return (
    <div className="space-y-5 pb-24 md:pb-0">
      {liveBadge}
      {toolbar}
      {filterBar}

      {filteredRows.length === 0 ? (
        <EmptyState
          searching
          title="Tidak ada pendaftar untuk program ini"
          description="Pilih filter program lain atau klik Semua untuk melihat seluruh pendaftar."
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3.5 md:hidden">
            {filteredRows.map((item) => {
          const initial = (item.full_name || "P").trim()[0]?.toUpperCase() ?? "P";
          const wa = whatsappHref(item.whatsapp);
          return (
            <article
              key={`m-${item.id}`}
              className="rounded-[24px] border border-admin-line bg-admin-canvas p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-admin-surface text-[14px] font-semibold text-admin-ink">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-admin-ink">
                      {item.full_name}
                    </p>
                    <p className="truncate text-[12px] text-admin-text-secondary">
                      {item.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  aria-label={`Lihat detail ${item.full_name}`}
                  title="Lihat Detail"
                  className={rowActionClass}
                >
                  <Eye aria-hidden="true" size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <ProgramBadge title={item.offer_title} offerSlug={item.offer_slug} />
              </div>

              <dl className="mt-3.5 grid grid-cols-2 gap-3 border-t border-admin-line pt-3 text-[12px]">
                <div>
                  <dt className="text-admin-text-secondary">Batch</dt>
                  <dd className="mt-0.5 font-medium text-admin-ink">
                    {getBatchList(item)}
                  </dd>
                </div>
                <div>
                  <dt className="text-admin-text-secondary">WhatsApp</dt>
                  <dd className="mt-0.5 font-sans font-medium tabular-nums text-admin-ink">
                    {formatWhatsapp(item.whatsapp)}
                  </dd>
                </div>
                <div>
                  <dt className="text-admin-text-secondary">Tgl Bergabung</dt>
                  <dd className="mt-0.5 font-medium text-admin-ink">
                    {formatJoinDate(item.received_at)}
                  </dd>
                </div>
              </dl>

              <div className="mt-3.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-admin-line-strong text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface"
                >
                  <Eye size={15} aria-hidden="true" />
                  Detail
                </button>
                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-[13px] font-medium text-white transition-colors hover:bg-[#1ebe57]"
                  >
                    <MessageCircle size={15} aria-hidden="true" />
                    WhatsApp
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable caption="Pendaftar Albana" minWidth={920}>
          <thead>
            <tr>
              <th scope="col">Nama</th>
              <th scope="col">Email</th>
              <th scope="col">WhatsApp</th>
              <th scope="col">Program</th>
              <th scope="col">Batch</th>
              <th scope="col">Tgl Bergabung</th>
              <th scope="col" className="text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((item) => {
              const initial = (item.full_name || "P").trim()[0]?.toUpperCase() ?? "P";
              return (
                <tr key={item.id}>
                  <td className="max-w-[220px]">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-admin-surface text-[13px] font-semibold text-admin-ink">
                        {initial}
                      </span>
                      <p className="min-w-0 truncate font-medium text-admin-ink" title={item.full_name}>
                        {item.full_name}
                      </p>
                    </div>
                  </td>
                  <td className="max-w-[220px] truncate text-admin-text-secondary" title={item.email}>
                    {item.email}
                  </td>
                  <td className="whitespace-nowrap font-sans text-[14px] tabular-nums text-admin-ink">
                    {formatWhatsapp(item.whatsapp)}
                  </td>
                  <td>
                    <ProgramBadge title={item.offer_title} offerSlug={item.offer_slug} />
                  </td>
                  <td className="whitespace-nowrap text-admin-ink">
                    {getBatchList(item)}
                  </td>
                  <td className="whitespace-nowrap text-admin-text-secondary">
                    {formatJoinDate(item.received_at)}
                  </td>
                  <td className="whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      aria-label={`Lihat detail ${item.full_name}`}
                      title="Lihat Detail"
                      className={rowActionClass}
                    >
                      <Eye aria-hidden="true" size={18} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </div>
      </>
      )}

      {/* Detail modal / sheet */}
      <AdminSheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setCopied(false);
          }
        }}
        size="lg"
        icon={
          <span className="text-[16px] font-semibold">
            {selected ? (selected.full_name || "P").trim()[0]?.toUpperCase() : "P"}
          </span>
        }
        title={selected?.full_name ?? "Detail Pendaftar"}
        description={
          selected
            ? `#${selected.id} · ${selected.email}`
            : undefined
        }
        footer={
          selected ? (
            <div className="flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-admin-line-strong px-6 text-[14px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
              >
                Tutup
              </button>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleCopyRecap}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-admin-line-strong px-5 text-[14px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
                >
                  {copied ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <Copy size={16} aria-hidden="true" />
                  )}
                  <span>{copied ? "Tersalin" : "Salin Rekap Teks"}</span>
                </button>
                {detailWaHref && (
                  <a
                    href={detailWaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1ebe57]"
                  >
                    <MessageCircle size={16} aria-hidden="true" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {selected && detailPayment && (
          <div className="space-y-4">
            <DetailCard
              title="Informasi Personal"
              icon={<User size={14} aria-hidden="true" />}
            >
              <div className="divide-y divide-admin-line/60">
                <InfoRow label="Nama Lengkap" value={selected.full_name} />
                <InfoRow label="Nama Panggilan" value={detailAnswers?.nickname || "—"} />
                <InfoRow
                  label="Jenis Kelamin & Usia"
                  value={
                    detailAnswers?.gender || detailAnswers?.age
                      ? [
                          detailAnswers?.gender,
                          detailAnswers?.age ? `${detailAnswers.age} tahun` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")
                      : "—"
                  }
                />
                <InfoRow label="Domisili" value={detailAnswers?.domicile || "—"} />
                <InfoRow
                  label="Pekerjaan"
                  value={
                    detailAnswers?.profession
                      ? `${detailAnswers.profession}${
                          detailAnswers.professionCategory
                            ? ` (${detailAnswers.professionCategory})`
                            : ""
                        }`
                      : "—"
                  }
                />
                <InfoRow label="Instansi" value={detailAnswers?.institution || "—"} />
                <InfoRow
                  label="Tgl Bergabung"
                  value={formatJoinDateLong(selected.received_at)}
                />
              </div>
            </DetailCard>

            <DetailCard title="Kontak & Sosial Media">
              <div className="divide-y divide-admin-line/60">
                <InfoRow
                  label="No. WhatsApp"
                  value={
                    <span className="font-sans tabular-nums">
                      {formatWhatsapp(selected.whatsapp)}
                    </span>
                  }
                />
                <InfoRow label="Email" value={selected.email} />
              </div>
              {detailSocials.length > 0 && (
                <div className="mt-3 border-t border-admin-line/60 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-admin-text-secondary">
                    Media Sosial
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detailSocials.map((item) => (
                      <span
                        key={`${item.label}-${item.value}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-admin-line bg-admin-surface px-3 py-1 text-[12px] text-admin-ink"
                      >
                        <span className="font-semibold text-admin-text-secondary">
                          {item.label}:
                        </span>
                        <span>{item.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </DetailCard>

            <DetailCard title="Program & Pembayaran">
              <div className="divide-y divide-admin-line/60">
                <InfoRow
                  label="Program"
                  value={
                    <ProgramBadge
                      title={selected.offer_title}
                      offerSlug={selected.offer_slug}
                    />
                  }
                />
                <InfoRow label="Batch" value={getBatchList(selected)} />
                <InfoRow
                  label="Status Pembayaran"
                  value={
                    detailPayment.isInstallment ? (
                      <div className="flex flex-col items-end gap-1">
                        <StatusChip tone="lilac">DP · Nyicil</StatusChip>
                        <span className="text-[12px] text-admin-text-secondary">
                          Sisa {rupiah(detailPayment.remainingAmount)}
                        </span>
                      </div>
                    ) : (
                      <StatusChip tone="mint">Lunas</StatusChip>
                    )
                  }
                />
                <InfoRow
                  label="Metode Pembayaran"
                  value={
                    selected.payment_method === "dp"
                      ? `DP ${selected.dp_percent_at_signup ?? 20}%`
                      : "Transfer lunas"
                  }
                />
                <InfoRow
                  label="Biaya Program"
                  value={
                    <span className="font-mono tabular-nums">
                      {rupiah(selected.price_idr_at_signup)}
                    </span>
                  }
                />
              </div>

              {detailPayment.invoices.length > 0 && (
                <div className="mt-3.5 space-y-2 border-t border-admin-line/60 pt-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-admin-text-secondary">
                    Rincian Tagihan
                  </p>
                  {detailPayment.invoices.map((inv) => {
                    const st =
                      inv.status in INVOICE_STATUS_MAP
                        ? INVOICE_STATUS_MAP[inv.status as keyof typeof INVOICE_STATUS_MAP]
                        : { tone: "neutral" as const, label: inv.status };
                    return (
                      <div
                        key={inv.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-admin-line bg-admin-surface px-3.5 py-2.5 text-[13px]"
                      >
                        <div>
                          <p className="font-mono text-[12px] font-semibold text-admin-ink">
                            {inv.invoice_number ?? `#${inv.id}`}
                          </p>
                          <p className="text-[12px] text-admin-text-secondary">
                            {inv.stage === "remaining" ? "Pelunasan" : "Pembayaran awal"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-semibold tabular-nums text-admin-ink">
                            {rupiah(inv.total_idr)}
                          </span>
                          <StatusChip tone={st.tone}>{st.label}</StatusChip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </DetailCard>

            <DetailCard
              title="Jawaban Form Pendaftaran"
              icon={<FileText size={14} aria-hidden="true" />}
            >
              <div className="divide-y divide-admin-line/60">
                <InfoRow
                  label="Pernah Ikut Pelatihan"
                  value={
                    detailAnswers?.priorExperience === true
                      ? "Ya"
                      : detailAnswers?.priorExperience === false
                        ? "Tidak"
                        : "—"
                  }
                />
                <InfoRow
                  label="Kesediaan Hadir"
                  value={
                    detailAnswers?.attendance
                      ? (ATTENDANCE_LABELS[detailAnswers.attendance] ??
                          detailAnswers.attendance)
                      : "—"
                  }
                />
                <InfoRow
                  label="Sumber Informasi"
                  value={
                    detailAnswers?.source === "other" && detailAnswers?.sourceOther
                      ? detailAnswers.sourceOther
                      : detailAnswers?.source
                        ? (SOURCE_LABELS[detailAnswers.source] ?? detailAnswers.source)
                        : "—"
                  }
                />
              </div>

              <div className="mt-3.5 space-y-2.5">
                <div className="rounded-2xl border border-admin-line bg-admin-surface p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-admin-text-secondary">
                    Tujuan Mengikuti Program
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-admin-ink">
                    {detailAnswers?.goal || "—"}
                  </p>
                </div>

                {detailAnswers?.challenge && (
                  <div className="rounded-2xl border border-admin-line bg-admin-surface p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-admin-text-secondary">
                      Tantangan / Kendala Utama
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-admin-ink">
                      {detailAnswers.challenge}
                    </p>
                  </div>
                )}
              </div>
            </DetailCard>

            <section className="rounded-[20px] border border-admin-rose-dot/40 bg-admin-rose-soft/60 p-4 sm:p-5">
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-admin-danger"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] font-semibold text-admin-danger sm:text-[14px]">
                    Peringatan: Tindakan Berbahaya (Hapus Pendaftar)
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-admin-rose-ink sm:text-[13px]">
                    Menghapus pendaftar ini akan menghapus seluruh data pendaftaran,
                    jawaban form, dan riwayat tagihan terkait secara permanen.
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(selected)}
                      className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-admin-danger px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                      <span>Hapus Pendaftar</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </AdminSheet>

      <DeleteSheet
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Hapus pendaftar ${deleteTarget?.full_name ?? ""}?`}
        description="Seluruh data pendaftaran, jawaban form, dan tagihan terkait akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        successMessage="Data pendaftar berhasil dihapus."
        errorMessage="Gagal menghapus data pendaftar."
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRegistration(deleteTarget.id);
        }}
        onSuccess={() => {
          setSelected(null);
          setCopied(false);
        }}
      />
    </div>
  );
}
