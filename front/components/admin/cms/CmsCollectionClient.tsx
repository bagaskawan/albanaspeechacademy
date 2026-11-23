"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { Check, Eye, Image as ImageIcon, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { deleteStorageFile, deleteStorageFiles, getRemovedStorageUrls } from "@/lib/supabase/storage-cleanup";
import { compressImage } from "@/lib/file-compress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";
import { UploadBlockingModal } from "@/components/admin/ui/UploadBlockingModal";
import { Field } from "@/components/admin/ui/form/fields";
import { AdminInput, AdminSelect, AdminTextarea, PriceInput } from "@/components/admin/ui/form/controls";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { TableToolbar, matchesQuery, type ToolbarFilter } from "@/components/admin/ui/table-toolbar";
import { RowActions, useIsAdminSuper } from "@/components/admin/ui/row-actions";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { useSearchParams } from "next/navigation";
import { DataTable } from "@/components/admin/ui/data-table";

export type CmsFieldType =
  | "text"
  | "textarea"
  | "number"
  | "price"
  | "boolean"
  | "select"
  | "member"
  | "registrant"
  | "datetime"
  | "sessions"
  | "consent"
  | "gallery"
  | "tags";

export type CmsField = {
  name: string;
  label: string;
  type?: CmsFieldType;
  options?: string[];
  labels?: Record<string, string>;
  required?: boolean;
  help?: string;
  placeholder?: string;
  /** Bucket penyimpanan untuk field gallery. Default: "gallery". */
  bucket?: string;
  /** Batas jumlah kata untuk field teks (mis. kutipan testimoni). */
  minWords?: number;
  maxWords?: number;
  /** Sembunyikan field dari form modal (tetap disimpan ke payload dan tampil di tabel). */
  hiddenInForm?: boolean;
  /** Nama field keterangan program/batch yang otomatis terisi saat registrant dipilih. */
  linkedRoleField?: string;
};

export type CmsMemberOption = { id: string; name: string };
export type CmsRegistrantOption = { id: string; name: string; roleLabel: string };

type Row = Record<string, unknown>;

interface CmsCollectionClientProps {
  table: string;
  primaryKey: string;
  title: string;
  description: string;
  fields: CmsField[];
  initialRows: Row[];
  displayField: string;
  emptyText: string;
  /** Field whose options become tabs; each tab shows only rows with that value. */
  groupBy?: string;
  /** Boolean field shown as an Active/Inactive toggle; clicking Inactive sets it true. */
  activeField?: string;
  /** One line under the dialog title explaining what to fill. */
  formHint?: string;
  initialGroup?: string;
  openCreateInitially?: boolean;
  createDefaults?: Record<string, Row>;
  /** Override the dialog max width, e.g. "max-w-lg". */
  maxWidth?: string;
  /** Toolbar (admin-ui-patterns §8.2): search box placeholder; omit to hide Cari. */
  searchPlaceholder?: string;
  /** Saring options; `param` is the row field compared as a string. */
  filters?: ToolbarFilter[];
  /** Module key for /api/admin/export/[module]; omit to hide Ekspor. */
  exportModule?: string;
  /** Tambah label, e.g. "Tambah batch". */
  createLabel?: string;
  /** Tampilkan baris sebagai grid bento yang bisa diklik, bukan tabel. */
  bento?: boolean;
  /** Tampilkan baris sebagai grid gallery dengan tombol Eye (detail) dan Pencil (edit). */
  galleryCards?: boolean;
  /** Pilihan member untuk field bertipe "member". */
  members?: CmsMemberOption[];
  /** Pilihan pendaftar untuk field bertipe "registrant". */
  registrants?: CmsRegistrantOption[];
  /** Ukuran modal form: sm, md, atau lg. */
  modalSize?: "sm" | "md" | "lg";
  /** Judul khusus saat mode tambah. */
  createTitle?: string;
  /** Judul khusus saat mode ubah. */
  editTitle?: string;
  /** Mode multiple gallery dengan staging lokal sebelum submit ke Supabase Storage. */
  multiGallery?: {
    maxTotal: number;
    minRecommended: number;
    autoConsentField?: string;
  };
}

type Session = { date: string; start: string; end: string };
type StoredSession = { starts_at: string; ends_at: string };

function sessionFromStored(starts_at: unknown, ends_at: unknown): Session {
  const [date, start = ""] = String(starts_at ?? "").split("T");
  const end = String(ends_at ?? "").split("T")[1] ?? "";
  return { date: date ?? "", start: start.slice(0, 5), end: end.slice(0, 5) };
}

function sessionToStored(session: Session) {
  // DB regex hanya menerima YYYY-MM-DDTHH:MM; sebagian browser mengembalikan HH:MM:SS.
  return {
    starts_at: `${session.date}T${session.start.slice(0, 5)}`,
    ends_at: `${session.date}T${session.end.slice(0, 5)}`,
  };
}

function formatRupiah(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function formatDateTime(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

/** Supabase returns PostgrestError as a plain object, so `instanceof Error` loses its message. */
function errorMessage(err: unknown, fallback: string) {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) return String(err.message);
  return fallback;
}

function countWords(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Unique storage name for a dropped/uploaded gallery photo. */
function galleryStoragePath(extension: string) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
}

function displayValue(field: CmsField, row: Row) {
  const value = row[field.name];
  if (field.type === "gallery") return value ? "Foto terpilih" : "—";
  if (field.type === "sessions") {
    return Array.isArray(value) ? `${value.length} sesi` : "—";
  }
  if (field.type === "consent" || field.type === "datetime") return formatDateTime(value);
  if (field.type === "boolean") return value ? "Ya" : "Tidak";
  if (field.type === "price") return formatRupiah(value);
  if (field.type === "number") {
    return /price|biaya|harga/i.test(field.name) ? formatRupiah(value) : String(value ?? "—");
  }
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return field.labels?.[text] ?? text;
}

function displayRowTitle(fields: CmsField[], displayField: string, row: Row) {
  const field = fields.find((item) => item.name === displayField);
  return field ? displayValue(field, row) : String(row[displayField] ?? "—");
}

function useMasonryColumnCount() {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const update = () => {
      if (window.innerWidth >= 1024) setCols(4);
      else if (window.innerWidth >= 640) setCols(3);
      else setCols(2);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

function initialFormState(fields: CmsField[], row: Row | null): Row {
  const state: Row = {};
  for (const field of fields) {
    const value = row ? row[field.name] : undefined;
    if (field.type === "sessions") {
      state[field.name] = Array.isArray(value) && value.length
        ? value.map((item: StoredSession) => sessionFromStored(item.starts_at, item.ends_at))
        : [{ date: "", start: "", end: "" }];
    } else if (field.type === "boolean") {
      state[field.name] = Boolean(value);
    } else if (field.type === "consent") {
      state[field.name] = Boolean(value);
    } else if (field.type === "datetime") {
      state[field.name] = value ? String(value).slice(0, 16) : "";
    } else if (field.type === "price") {
      state[field.name] = String(value ?? "").replace(/\D/g, "");
    } else if (field.type === "tags") {
      state[field.name] = Array.isArray(value)
        ? value.join(", ")
        : String(value ?? "");
    } else {
      state[field.name] = value ?? "";
    }
  }
  return state;
}

export default function CmsCollectionClient({
  table,
  primaryKey,
  title,
  fields,
  initialRows,
  displayField,
  emptyText,
  groupBy,
  activeField,
  formHint,
  initialGroup,
  openCreateInitially,
  createDefaults,
  maxWidth,
  searchPlaceholder,
  filters = [],
  exportModule,
  createLabel,
  bento,
  galleryCards,
  members,
  registrants,
  modalSize,
  createTitle,
  editTitle,
  multiGallery,
}: CmsCollectionClientProps) {
  const groupField = groupBy ? fields.find((field) => field.name === groupBy) : undefined;
  const groups = groupField?.options ?? [];
  const tableFields = groupField ? fields.filter((field) => field.name !== groupField.name) : fields;

  const [rows, setRows] = useState<Row[]>(initialRows);
  const masonryCols = useMasonryColumnCount();
  const [activeGroup, setActiveGroup] = useState(initialGroup && groups.includes(initialGroup) ? initialGroup : groups[0] ?? "");
  const [isFormOpen, setIsFormOpen] = useState(Boolean(openCreateInitially));
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [detailRow, setDetailRow] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>(() => ({ ...initialFormState(fields, null), ...(createDefaults?.[initialGroup ?? ""] ?? {}),
    ...(groupField && initialGroup ? { [groupField.name]: initialGroup } : {}) }));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [liveMessage, setLiveMessage] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryDragging, setGalleryDragging] = useState(false);
  const [activatingKey, setActivatingKey] = useState<string | null>(null);
  const sessionUploadedUrlsRef = useRef<Set<string>>(new Set());
  const [stagedGalleryFiles, setStagedGalleryFiles] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const stagedGalleryRef = useRef<{ id: string; file: File; previewUrl: string }[]>([]);
  const [stagedSingleFiles, setStagedSingleFiles] = useState<Record<string, { file: File; previewUrl: string }>>({});
  const stagedSingleRef = useRef<Record<string, { file: File; previewUrl: string }>>({});
  const [multiUploadProgress, setMultiUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [registrantManualMode, setRegistrantManualMode] = useState<Record<string, boolean>>({});

  useEffect(() => {
    stagedGalleryRef.current = stagedGalleryFiles;
  }, [stagedGalleryFiles]);

  useEffect(() => {
    stagedSingleRef.current = stagedSingleFiles;
  }, [stagedSingleFiles]);

  useEffect(() => {
    return () => {
      for (const item of stagedGalleryRef.current) {
        URL.revokeObjectURL(item.previewUrl);
      }
      for (const item of Object.values(stagedSingleRef.current)) {
        URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const clearStagedGallery = () => {
    setStagedGalleryFiles((prev) => {
      for (const item of prev) URL.revokeObjectURL(item.previewUrl);
      return [];
    });
    setStagedSingleFiles((prev) => {
      for (const item of Object.values(prev)) URL.revokeObjectURL(item.previewUrl);
      return {};
    });
  };

  const stageSingleGalleryFile = (field: CmsField, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB.");
      return;
    }
    setStagedSingleFiles((prev) => {
      const existing = prev[field.name];
      if (existing) URL.revokeObjectURL(existing.previewUrl);
      return {
        ...prev,
        [field.name]: { file, previewUrl: URL.createObjectURL(file) },
      };
    });
    setFieldErrors((prev) => {
      if (!prev[field.name]) return prev;
      const next = { ...prev };
      delete next[field.name];
      return next;
    });
  };

  const removeStagedGalleryItem = (id: string) => {
    setStagedGalleryFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const stageGalleryFiles = (field: CmsField, selected: File[]) => {
    if (!multiGallery || selected.length === 0) return;
    const acceptedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of selected) {
      const hasValidExt = /\.(jpe?g|png|webp)$/i.test(file.name);
      if (!acceptedTypes.has(file.type) && !(file.type === "" && hasValidExt)) {
        errors.push(`${file.name}: Gunakan JPEG, PNG, atau WebP.`);
        continue;
      }
      if (file.size < 1 || file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: Ukuran maksimal 10 MiB.`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length === 0) {
      if (errors.length > 0) setError(errors.join(" "));
      return;
    }

    if (editingRow) {
      const replacement = valid[0];
      setStagedGalleryFiles((prev) => {
        for (const item of prev) URL.revokeObjectURL(item.previewUrl);
        return [
          {
            id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            file: replacement,
            previewUrl: URL.createObjectURL(replacement),
          },
        ];
      });
      setFieldErrors((prev) => {
        if (!prev[field.name]) return prev;
        const next = { ...prev };
        delete next[field.name];
        return next;
      });
      setError(errors.length > 0 ? errors.join(" ") : null);
      return;
    }

    const remainingSlots = Math.max(0, multiGallery.maxTotal - rows.length - stagedGalleryFiles.length);
    if (remainingSlots === 0) {
      setError(`Batas maksimal ${multiGallery.maxTotal} foto sudah tercapai.`);
      return;
    }

    let filesToStage = valid;
    if (valid.length > remainingSlots) {
      filesToStage = valid.slice(0, remainingSlots);
      errors.push(`Hanya ${remainingSlots} foto lagi yang bisa ditambahkan; ${valid.length - filesToStage.length} file dilewati.`);
    }

    const staged = filesToStage.map((file) => ({
      id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setStagedGalleryFiles((prev) => [...prev, ...staged]);
    setFieldErrors((prev) => {
      if (!prev[field.name]) return prev;
      const next = { ...prev };
      delete next[field.name];
      return next;
    });
    setError(errors.length > 0 ? errors.join(" ") : null);
  };

  const uploadCompressedGalleryFile = async (field: CmsField, file: File): Promise<string> => {
    const supabase = createClient();
    let compressed = await compressImage(file);
    if (compressed.size > 2 * 1024 * 1024) {
      compressed = await compressImage(compressed, 1200, 1200, 0.6);
    }
    const ext = compressed.name.split(".").pop();
    const path = galleryStoragePath(ext ?? "jpg");
    const bucket = field.bucket ?? "gallery";
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, compressed, {
        cacheControl: "3600",
        upsert: false,
        contentType: compressed.type || "image/jpeg",
      });
    if (uploadError) throw uploadError;
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  };

  const uploadGalleryFile = async (field: CmsField, file: File) => {
    const consentField = fields.find((item) => item.type === "consent");
    if (consentField && !form[consentField.name]) {
      toast.error("Catat izin publikasi sebelum mengunggah foto.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan!");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran foto maksimal 5MB.");
      return;
    }
    setGalleryUploading(true);
    try {
      const supabase = createClient();
      let compressed = await compressImage(file);
      if (compressed.size > 2 * 1024 * 1024) {
        compressed = await compressImage(compressed, 1200, 1200, 0.6);
      }
      const ext = compressed.name.split(".").pop();
      const path = galleryStoragePath(ext ?? "jpg");
      const bucket = field.bucket ?? "gallery";
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, compressed, {
          cacheControl: "3600",
          upsert: false,
          contentType: compressed.type || "image/jpeg",
        });
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);
      const prevUrl = String(form[field.name] ?? "");
      if (prevUrl && prevUrl !== publicUrl && sessionUploadedUrlsRef.current.has(prevUrl)) {
        sessionUploadedUrlsRef.current.delete(prevUrl);
        deleteStorageFile(supabase, prevUrl).catch(() => {});
      }
      sessionUploadedUrlsRef.current.add(publicUrl);
      setValue(field, publicUrl);
      toast.success("Foto diunggah.");
    } catch (err) {
      toast.error(errorMessage(err, "Gagal mengunggah foto."));
    } finally {
      setGalleryUploading(false);
    }
  };

  const fieldId = (field: CmsField) => `${table}-${field.name}`;

  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const formId = useId();
  const canDelete = useIsAdminSuper();
  const visibleRows = rows.filter((row) =>
    (!groupField || String(row[groupField.name]) === activeGroup)
    && matchesQuery(row[displayField], query)
    && filters.every((filter) => !params.get(filter.param) || String(row[filter.param]) === params.get(filter.param)));
  const searching = Boolean(query) || filters.some((filter) => params.get(filter.param));
  const emptyState = searching
    ? <EmptyState searching title="Tidak ada data yang cocok" description="Ubah kata kunci atau saringan." />
    : <EmptyState title={emptyText} />;

  const openCreate = () => {
    clearStagedGallery();
    setRegistrantManualMode({});
    setEditingRow(null);
    setForm({
      ...initialFormState(fields, null),
      ...(createDefaults?.[activeGroup] ?? {}),
      ...(groupField ? { [groupField.name]: activeGroup } : {}),
    });
    setError(null);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (row: Row) => {
    clearStagedGallery();
    setRegistrantManualMode({});
    setEditingRow(row);
    setForm(initialFormState(fields, row));
    setError(null);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    clearStagedGallery();
    if (sessionUploadedUrlsRef.current.size > 0) {
      const toClean = Array.from(sessionUploadedUrlsRef.current);
      sessionUploadedUrlsRef.current.clear();
      deleteStorageFiles(createClient(), toClean).catch(() => {});
    }
    setIsFormOpen(false);
    setEditingRow(null);
    setError(null);
    setFieldErrors({});
  };

  const setValue = (field: CmsField, value: unknown) => {
    setForm((current) => ({ ...current, [field.name]: value }));
    setFieldErrors((current) => {
      if (!current[field.name]) return current;
      const next = { ...current };
      delete next[field.name];
      return next;
    });
  };

  const announce = (message: string) => {
    setLiveMessage("");
    window.setTimeout(() => setLiveMessage(message), 30);
  };

  const refresh = async () => {
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from(table)
      .select("*")
      .order(primaryKey, { ascending: true });
    if (fetchError) throw fetchError;
    setRows((data as Row[]) ?? []);
  };

  /** Returns the first invalid field so the caller can move focus there. */
  const validate = (): CmsField | null => {
    const errors: Record<string, string> = {};
    let firstInvalid: CmsField | null = null;

    for (const field of fields) {
      const value = form[field.name];
      if (multiGallery && field.type === "gallery") {
        if (!editingRow && stagedGalleryFiles.length === 0) {
          errors[field.name] = "Pilih minimal satu foto terlebih dahulu.";
        } else if (editingRow && !stagedGalleryFiles.length && (!value || String(value).trim() === "")) {
          errors[field.name] = `${field.label} wajib diisi.`;
        }
        if (errors[field.name] && !firstInvalid) firstInvalid = field;
        continue;
      }
      if (!multiGallery && field.type === "gallery" && stagedSingleFiles[field.name]) {
        continue;
      }
      const isBlank =
        value === "" || value === null || value === undefined ||
        (typeof value === "string" && value.trim() === "");

      if (field.required && isBlank) {
        errors[field.name] = `${field.label} wajib diisi.`;
      } else if (field.type === "sessions") {
        const sessions = (value as Session[]) ?? [];
        const ordered = [...sessions].sort(
          (a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`)
        );
        if (!sessions.length || sessions.some((session) => !session.date || !session.start || !session.end)) {
          errors[field.name] = "Setiap sesi wajib punya tanggal, waktu mulai, dan waktu selesai.";
        } else if (sessions.some((session) => session.end <= session.start)) {
          errors[field.name] = "Waktu selesai sesi harus setelah waktu mulai.";
        } else if (
          ordered.some(
            (session, index) =>
              index > 0 && `${session.date}T${session.start}` < `${ordered[index - 1].date}T${ordered[index - 1].end}`
          )
        ) {
          errors[field.name] = "Sesi tidak boleh tumpang tindih.";
        }
      } else if (field.type === "consent" && !value) {
        errors[field.name] = "Centang pernyataan izin publikasi gambar.";
      } else if (field.minWords || field.maxWords) {
        const words = countWords(String(value ?? ""));
        const min = field.minWords ?? 0;
        const max = field.maxWords ?? Number.POSITIVE_INFINITY;
        if (words < min || words > max) {
          errors[field.name] = field.maxWords
            ? `${field.label} harus ${min}–${field.maxWords} kata (saat ini ${words} kata).`
            : `${field.label} minimal ${min} kata (saat ini ${words} kata).`;
        }
      }

      if (errors[field.name] && !firstInvalid) firstInvalid = field;
    }

    setFieldErrors(errors);
    return firstInvalid;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const firstInvalid = validate();
    if (firstInvalid) {
      const id = fieldId(firstInvalid);
      // sessions/boolean render per-row ids, so fall back to the first child control
      const el =
        document.getElementById(id) ??
        document.querySelector<HTMLElement>(`[id^="${id}-"]`);
      el?.focus();
      return;
    }

    const payload: Row = {};
    for (const field of fields) {
      const value = form[field.name];
      if (field.type === "sessions") {
        payload[field.name] = [...(value as Session[])]
          .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`))
          .map(sessionToStored);
      } else if (field.type === "consent") {
        payload[field.name] = editingRow?.[field.name] ?? new Date().toISOString();
      } else if (field.type === "boolean") {
        payload[field.name] = Boolean(value);
      } else if (field.type === "number") {
        payload[field.name] = value === "" ? null : Number(value);
      } else if (field.type === "price") {
        const digits = String(value ?? "").replace(/\D/g, "");
        payload[field.name] = digits ? Number(digits) : null;
      } else if (field.type === "datetime") {
        payload[field.name] = value ? new Date(String(value)).toISOString() : null;
      } else if (field.type === "tags") {
        payload[field.name] = String(value ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      } else if (typeof value === "string") {
        // Kolom teks opsional disimpan NULL, bukan string kosong (mis. gallery.title).
        payload[field.name] = value.trim() || null;
      } else {
        payload[field.name] = value;
      }
    }

    setIsSaving(true);
    try {
      const supabase = createClient();
      const galleryFields = fields.filter((field) => field.type === "gallery");

      if (multiGallery && galleryFields.length === 1) {
        const gField = galleryFields[0];
        if (!editingRow) {
          const total = stagedGalleryFiles.length;
          for (let i = 0; i < total; i += 1) {
            const staged = stagedGalleryFiles[i];
            setMultiUploadProgress({ current: i + 1, total });
            const publicUrl = await uploadCompressedGalleryFile(gField, staged.file);
            const rowPayload: Row = {
              ...payload,
              [gField.name]: publicUrl,
              ...(multiGallery.autoConsentField
                ? { [multiGallery.autoConsentField]: new Date().toISOString() }
                : {}),
            };
            const { error: insertError } = await supabase.from(table).insert(rowPayload);
            if (insertError) throw insertError;
          }
          clearStagedGallery();
          setMultiUploadProgress(null);
          await refresh();
          toast.success(`${total} foto berhasil diunggah ke galeri.`);
          announce(`${total} foto berhasil diunggah ke galeri.`);
          setIsFormOpen(false);
          setEditingRow(null);
          setFieldErrors({});
          return;
        }

        if (stagedGalleryFiles.length > 0) {
          setMultiUploadProgress({ current: 1, total: 1 });
          const publicUrl = await uploadCompressedGalleryFile(gField, stagedGalleryFiles[0].file);
          payload[gField.name] = publicUrl;
          setMultiUploadProgress(null);
        }
      } else if (!multiGallery) {
        const pendingUploads = galleryFields.filter((field) => stagedSingleFiles[field.name]);
        if (pendingUploads.length > 0) {
          setGalleryUploading(true);
          try {
            for (const gField of pendingUploads) {
              const publicUrl = await uploadCompressedGalleryFile(gField, stagedSingleFiles[gField.name].file);
              payload[gField.name] = publicUrl;
            }
          } finally {
            setGalleryUploading(false);
          }
        }
      }

      const nextGalleryUrls = galleryFields.map((field) => String(payload[field.name] ?? ""));

      if (editingRow) {
        const { error: updateError } = await supabase
          .from(table)
          .update(payload)
          .eq(primaryKey, editingRow[primaryKey]);
        if (updateError) throw updateError;

        const oldGalleryUrls = galleryFields.map((field) => String(editingRow[field.name] ?? ""));
        const removedOldUrls = getRemovedStorageUrls(oldGalleryUrls, nextGalleryUrls);
        const unusedSessionUrls = getRemovedStorageUrls(Array.from(sessionUploadedUrlsRef.current), nextGalleryUrls);
        const urlsToDelete = [...removedOldUrls, ...unusedSessionUrls];
        if (urlsToDelete.length > 0) {
          deleteStorageFiles(supabase, urlsToDelete).catch(() => {});
        }
      } else {
        const { error: insertError } = await supabase.from(table).insert(payload);
        if (insertError) throw insertError;

        const unusedSessionUrls = getRemovedStorageUrls(Array.from(sessionUploadedUrlsRef.current), nextGalleryUrls);
        if (unusedSessionUrls.length > 0) {
          deleteStorageFiles(supabase, unusedSessionUrls).catch(() => {});
        }
      }
      clearStagedGallery();
      sessionUploadedUrlsRef.current.clear();
      await refresh();
      const message = editingRow ? "Perubahan tersimpan." : "Data ditambahkan.";
      toast.success(message);
      announce(message);
      if (groupField) setActiveGroup(String(payload[groupField.name] ?? activeGroup));
      setIsFormOpen(false);
      setEditingRow(null);
      setFieldErrors({});
    } catch (err) {
      setMultiUploadProgress(null);
      setError(errorMessage(err, "Gagal menyimpan data."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (row: Row) => {
    setError(null);
    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq(primaryKey, row[primaryKey]);
      if (deleteError) throw deleteError;

      const galleryUrls = fields
        .filter((field) => field.type === "gallery")
        .map((field) => (typeof row[field.name] === "string" ? (row[field.name] as string) : null));
      if (galleryUrls.some(Boolean)) {
        deleteStorageFiles(supabase, galleryUrls).catch(() => {});
      }

      await refresh();
      announce("Data berhasil dihapus.");
    } catch (err) {
      // RowActions' DeleteSheet toasts this and keeps the dialog open.
      return { error: errorMessage(err, "Gagal menghapus data.") };
    }
  };

  const handleActivate = async (row: Row) => {
    if (!activeField || Boolean(row[activeField])) return;
    const key = String(row[primaryKey]);
    setError(null);
    setActivatingKey(key);
    try {
      const supabase = createClient();
      // Trigger database menonaktifkan batch lain di program yang sama.
      const { error: updateError } = await supabase
        .from(table)
        .update({ [activeField]: true })
        .eq(primaryKey, row[primaryKey]);
      if (updateError) throw updateError;
      await refresh();
      toast.success(`${title} diaktifkan.`);
      announce(`${title} diaktifkan.`);
    } catch (err) {
      setError(errorMessage(err, `Gagal mengaktifkan ${title.toLowerCase()}.`));
    } finally {
      setActivatingKey(null);
    }
  };

  const renderActiveToggle = (row: Row) => {
    if (!activeField) return null;
    const active = Boolean(row[activeField]);
    const busy = activatingKey === String(row[primaryKey]);
    return (
      <button
        type="button"
        onClick={() => void handleActivate(row)}
        disabled={active || busy}
        aria-pressed={active}
        title={active ? `${title} aktif` : `Aktifkan ${title.toLowerCase()} ini`}
        className={`inline-flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors ${
          active
            ? "bg-admin-mint-soft text-admin-mint-ink cursor-default"
            : "bg-admin-surface-muted text-admin-text-secondary hover:text-admin-ink cursor-pointer"
        }`}
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : <><span aria-hidden="true" className={`size-1.5 rounded-full ${active ? "bg-admin-mint-dot" : "bg-admin-text-faint"}`} />{active ? "Aktif" : "Nonaktif"}</>}
      </button>
    );
  };

  const twoColumns = fields.length >= 5;

  const renderField = (field: CmsField) => {
    const value = form[field.name];
    const id = fieldId(field);
    const error = fieldErrors[field.name];
    const fieldProps = { label: field.label, htmlFor: id, required: field.required, hint: field.help, error };

    if (field.type === "sessions") {
      const sessions = (value as Session[]) ?? [];
      const updateSession = (index: number, patch: Partial<Session>) => {
        setValue(
          field,
          sessions.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
        );
      };
      const pickerClass = "h-10 rounded-xl px-3.5 text-xs font-medium bg-bg-well/50 border-border-default";
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">
              {field.label}
            </p>
            <span className="text-[10px] font-semibold text-text-secondary">
              {sessions.length} sesi
            </span>
          </div>
          {field.help && (
            <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 -mt-2">{field.help}</span>
          )}
          <div className="divide-y divide-border-default/60 border-y border-border-default/60">
            {sessions.map((session, index) => (
              <div key={index} className="space-y-2.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">Sesi {index + 1}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => setValue(field, sessions.filter((_, itemIndex) => itemIndex !== index))}
                    disabled={sessions.length === 1}
                    aria-label={`Hapus sesi ${index + 1}`}
                    title={sessions.length === 1 ? "Minimal satu sesi" : "Hapus sesi"}
                    className="rounded-full border border-admin-rose-dot/30"
                  >
                    <Trash2 />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor={`${id}-${index}-date`} className="text-[11px] font-semibold text-text-secondary block">
                    Tanggal *
                  </label>
                  <DatePicker
                    value={session.date}
                    onChange={(next) => updateSession(index, { date: next })}
                    placeholder="Pilih tanggal"
                    className={pickerClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-text-secondary block">Mulai *</span>
                    <TimePicker
                      value={session.start}
                      onChange={(next) => updateSession(index, { start: next })}
                      placeholder="Pilih jam"
                      className={pickerClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-text-secondary block">Selesai *</span>
                    <TimePicker
                      value={session.end}
                      onChange={(next) => updateSession(index, { end: next })}
                      placeholder="Pilih jam"
                      className={pickerClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setValue(field, [...sessions, { date: "", start: "", end: "" }])}
            className="h-9 w-full rounded-full border-admin-lilac-dot/30 bg-admin-lilac-soft text-[11px] font-bold uppercase tracking-wider text-admin-lilac-ink hover:bg-admin-lilac-soft"
          >
            <Plus size={13} /> Tambah sesi
          </Button>
          {error && (
            <p id={`${id}-error`} role="alert" className="text-xs text-destructive font-semibold">
              {error}
            </p>
          )}
        </div>
      );
    }

    if (field.type === "consent" || field.type === "boolean") {
      const checked = Boolean(value);
      return (
        <div className="flex items-start gap-2.5">
          <Checkbox
            id={id}
            checked={checked}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onCheckedChange={(next) => setValue(field, next === true)}
            className="mt-0.5"
          />
          <div>
            <label htmlFor={id} className="text-xs font-normal leading-relaxed text-text-primary">
              {field.type === "consent"
                ? "Gambar boleh dipublikasikan dan izinnya sudah saya catat."
                : field.label}
            </label>
            {field.help && (
              <span className="block text-[10px] text-text-secondary mt-0.5">{field.help}</span>
            )}
            {error && (
              <p id={`${id}-error`} role="alert" className="text-xs text-destructive font-semibold mt-1">
                {error}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (field.type === "select") {
      const current = String(value ?? "");
      return (
        <Field {...fieldProps}>
          <AdminSelect
            id={id}
            value={current}
            onValueChange={(next) => setValue(field, next)}
            options={(field.options ?? []).map((option) => ({
              value: option,
              label: field.labels?.[option] ?? option,
            }))}
            required={field.required}
            aria-invalid={error ? true : undefined}
          />
        </Field>
      );
    }

    if (field.type === "member") {
      const current = String(value ?? "");
      return (
        <Field {...fieldProps}>
          <AdminSelect
            id={id}
            value={current}
            onValueChange={(next) => setValue(field, next)}
            options={(members ?? []).map((member) => ({
              value: member.id,
              label: member.name,
            }))}
            placeholder="Pilih dari data member…"
            required={field.required}
            aria-invalid={error ? true : undefined}
          />
        </Field>
      );
    }

    if (field.type === "registrant") {
      const currentName = String(value ?? "");
      const roleField = field.linkedRoleField;
      const currentRole = roleField ? String(form[roleField] ?? "") : "";
      const list = registrants ?? [];
      const matched = list.find(
        (item) => item.name === currentName && (!currentRole || item.roleLabel === currentRole),
      ) ?? list.find((item) => item.name === currentName);
      const isManual = registrantManualMode[field.name] ?? (Boolean(currentName) && !matched);
      const selectValue = matched ? matched.id : "";

      const nameCount = new Map<string, number>();
      for (const item of list) {
        nameCount.set(item.name, (nameCount.get(item.name) ?? 0) + 1);
      }
      const options = list.map((item) => ({
        value: item.id,
        label:
          (nameCount.get(item.name) ?? 0) > 1 && item.roleLabel
            ? `${item.name} · ${item.roleLabel}`
            : item.name,
      }));

      const roleFieldDef = roleField ? fields.find((f) => f.name === roleField) : undefined;
      const roleLabelText = roleFieldDef?.label ?? "Program & Batch";

      return (
        <div className="min-w-0 space-y-4">
          <Field {...fieldProps}>
            <div className="min-w-0 space-y-2.5">
              <div className="inline-flex rounded-full border border-admin-line bg-admin-surface p-0.5 text-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    setRegistrantManualMode((prev) => ({ ...prev, [field.name]: false }));
                    if (matched && roleField) {
                      setForm((prev) => ({ ...prev, [roleField]: matched.roleLabel }));
                    }
                  }}
                  className={`cursor-pointer rounded-full px-3 py-1 font-medium transition-colors ${
                    !isManual
                      ? "bg-admin-ink text-admin-on-ink"
                      : "text-admin-text-secondary hover:text-admin-ink"
                  }`}
                >
                  Pilih pendaftar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegistrantManualMode((prev) => ({ ...prev, [field.name]: true }));
                  }}
                  className={`cursor-pointer rounded-full px-3 py-1 font-medium transition-colors ${
                    isManual
                      ? "bg-admin-ink text-admin-on-ink"
                      : "text-admin-text-secondary hover:text-admin-ink"
                  }`}
                >
                  Isi manual
                </button>
              </div>

              {isManual ? (
                <AdminInput
                  id={id}
                  type="text"
                  required={field.required}
                  aria-required={field.required ? "true" : undefined}
                  aria-invalid={error ? true : undefined}
                  placeholder="Masukkan nama pemberi testimoni"
                  value={currentName}
                  onChange={(event) => setValue(field, event.target.value)}
                />
              ) : (
                <AdminSelect
                  id={id}
                  value={selectValue}
                  placeholder={list.length === 0 ? "Belum ada data pendaftar" : "Pilih pendaftar…"}
                  onValueChange={(nextId) => {
                    const selected = list.find((item) => item.id === nextId);
                    if (selected) {
                      setForm((prev) => ({
                        ...prev,
                        [field.name]: selected.name,
                        ...(roleField ? { [roleField]: selected.roleLabel } : {}),
                      }));
                      setFieldErrors((prev) => {
                        if (!prev[field.name]) return prev;
                        const next = { ...prev };
                        delete next[field.name];
                        return next;
                      });
                    }
                  }}
                  options={options}
                  required={field.required}
                  aria-invalid={error ? true : undefined}
                />
              )}
            </div>
          </Field>

          {roleField && (
            <Field
              label={roleLabelText}
              htmlFor={`${id}-role`}
              hint={
                !isManual
                  ? "Terisi otomatis dari data pendaftar (read-only)."
                  : "Opsional. Contoh: Public Speaking Series · Batch 11."
              }
            >
              <AdminInput
                id={`${id}-role`}
                type="text"
                value={currentRole}
                readOnly={!isManual}
                placeholder={
                  !isManual
                    ? "Otomatis terisi setelah memilih pendaftar"
                    : "Contoh: Public Speaking Series · Batch 11"
                }
                className={
                  !isManual
                    ? "cursor-default bg-admin-surface-muted/70 text-admin-text-secondary hover:border-admin-line focus-visible:bg-admin-surface-muted/70"
                    : undefined
                }
                onChange={
                  isManual
                    ? (event) => setForm((prev) => ({ ...prev, [roleField]: event.target.value }))
                    : undefined
                }
              />
            </Field>
          )}
        </div>
      );
    }

    if (field.type === "tags") {
      const raw = String(value ?? "");
      const tags = raw.split(",").map((tag) => tag.trim()).filter(Boolean);
      return (
        <div className="space-y-2">
          <Field {...fieldProps}>
            <AdminInput
              id={id}
              aria-invalid={error ? true : undefined}
              value={raw}
              placeholder={field.placeholder ?? "Pisahkan dengan koma, mis. Public Speaking, MC"}
              onChange={(event) => setValue(field, event.target.value)}
            />
          </Field>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-admin-lilac-soft px-2.5 py-1 text-[11px] font-semibold text-admin-lilac-ink"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Hapus ${tag}`}
                    onClick={() => setValue(field, tags.filter((item) => item !== tag).join(", "))}
                    className="cursor-pointer text-admin-lilac-ink/70 hover:text-admin-danger"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (field.type === "gallery") {
      if (multiGallery) {
        const inputId = `${id}-multi-file`;
        const totalWithQueue = rows.length + stagedGalleryFiles.length;
        const isFull = !editingRow && totalWithQueue >= multiGallery.maxTotal;
        const existingEditUrl = editingRow ? String(value ?? "") : "";
        const stagedReplacementUrl = editingRow && stagedGalleryFiles[0] ? stagedGalleryFiles[0].previewUrl : "";
        const editPreviewUrl = stagedReplacementUrl || existingEditUrl;

        return (
          <div className="space-y-4">
            {!editingRow && (
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-[14px] font-semibold text-admin-ink">
                  Foto{" "}
                  <span className={totalWithQueue < multiGallery.minRecommended ? "text-admin-peach-ink" : "text-admin-text-secondary"}>
                    {totalWithQueue} / {multiGallery.maxTotal}
                  </span>
                </p>
                <span className="rounded-full bg-admin-peach-soft px-2.5 py-0.5 text-[12px] font-medium text-admin-peach-ink">
                  Disarankan {multiGallery.minRecommended}–{multiGallery.maxTotal} foto
                </span>
              </div>
            )}

            <input
              id={inputId}
              type="file"
              multiple={!editingRow}
              accept="image/jpeg,image/png,image/webp"
              disabled={isSaving || isFull}
              className="sr-only"
              onChange={(event) => {
                const selected = Array.from(event.target.files ?? []);
                event.target.value = "";
                if (selected.length > 0 && !isSaving) {
                  stageGalleryFiles(field, selected);
                }
              }}
            />

            {editingRow && editPreviewUrl ? (
              <div className="space-y-2.5">
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (!isSaving) setGalleryDragging(true);
                  }}
                  onDragLeave={() => setGalleryDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setGalleryDragging(false);
                    const dropped = Array.from(event.dataTransfer.files ?? []);
                    if (dropped.length > 0 && !isSaving) {
                      stageGalleryFiles(field, dropped);
                    }
                  }}
                  className={`relative mx-auto w-fit max-w-full overflow-hidden rounded-2xl bg-admin-surface transition-all ${
                    galleryDragging
                      ? "border-2 border-dashed border-admin-ink ring-2 ring-admin-ink/20"
                      : "border border-admin-line"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={editPreviewUrl} alt="" className="block max-h-[340px] w-auto max-w-full object-contain" />
                  {galleryDragging && (
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-4 text-center backdrop-blur-[2px]">
                      <span className="rounded-full bg-white/95 px-4 py-1.5 text-[13px] font-semibold text-admin-ink shadow">
                        Lepas foto untuk mengganti
                      </span>
                    </div>
                  )}
                  {stagedReplacementUrl && (
                    <>
                      <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-admin-canvas/90 px-2.5 py-0.5 text-[11px] font-medium text-admin-ink shadow-xs">
                        Belum disimpan
                      </span>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={clearStagedGallery}
                        aria-label="Batalkan penggantian foto"
                        title="Kembalikan foto awal"
                        className="absolute right-2.5 top-2.5 z-10 inline-flex size-8 items-center justify-center rounded-full bg-admin-canvas/90 text-admin-danger shadow-sm transition-colors hover:bg-admin-rose-soft disabled:opacity-50 cursor-pointer"
                      >
                        <X aria-hidden="true" size={15} />
                      </button>
                    </>
                  )}
                  <label
                    htmlFor={isSaving ? undefined : inputId}
                    className={`absolute bottom-3 left-1/2 z-10 inline-flex h-9 -translate-x-1/2 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-black/70 px-4 text-[13px] font-medium text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/85 ${
                      isSaving ? "pointer-events-none opacity-60" : "cursor-pointer"
                    }`}
                  >
                    <ImageIcon aria-hidden="true" size={15} />
                    <span>Ganti foto</span>
                  </label>
                </div>
                <p className="text-center text-[12px] text-admin-text-secondary">
                  Tarik & lepas foto baru ke atas gambar atau klik Ganti foto. Perubahan baru diunggah saat klik Simpan.
                </p>
              </div>
            ) : (
              <label
                htmlFor={isFull ? undefined : inputId}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!isSaving && !isFull) setGalleryDragging(true);
                }}
                onDragLeave={() => setGalleryDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setGalleryDragging(false);
                  const dropped = Array.from(event.dataTransfer.files ?? []);
                  if (dropped.length > 0 && !isSaving && !isFull) {
                    stageGalleryFiles(field, dropped);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed px-6 py-7 text-center transition-colors ${
                  isFull || isSaving
                    ? "cursor-not-allowed border-admin-line bg-admin-surface/60 opacity-60"
                    : galleryDragging
                      ? "cursor-copy border-admin-ink bg-admin-surface"
                      : "cursor-pointer border-admin-line-strong bg-admin-surface/50 hover:border-admin-ink/50 hover:bg-admin-surface"
                }`}
              >
                <span className="inline-flex size-11 items-center justify-center rounded-full bg-admin-canvas text-admin-ink shadow-xs">
                  <ImageIcon aria-hidden="true" size={20} strokeWidth={1.5} />
                </span>
                <p className="text-[14px] font-medium text-admin-ink">
                  {isFull
                    ? `Batas ${multiGallery.maxTotal} foto sudah tercapai`
                    : field.placeholder || "Tarik & lepas beberapa foto ke sini, atau klik untuk memilih"}
                </p>
                {field.help && (
                  <p className="text-[12px] text-admin-text-secondary">{field.help}</p>
                )}
              </label>
            )}

            {!editingRow && stagedGalleryFiles.length > 0 && (
              <div className="space-y-3 rounded-[20px] border border-admin-line-strong bg-admin-surface/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-semibold text-admin-ink">
                      Siap dikirim ({stagedGalleryFiles.length} foto)
                    </p>
                    <p className="text-[12px] text-admin-text-secondary">
                      Foto disimpan sementara di cache browser dan otomatis terhapus jika modal ditutup atau halaman diganti.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={clearStagedGallery}
                    className="inline-flex h-9 items-center justify-center rounded-full border border-admin-line-strong bg-admin-canvas px-3.5 text-[12px] font-medium text-admin-ink transition-colors hover:bg-admin-surface disabled:opacity-50 cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {stagedGalleryFiles.map((item) => (
                    <div
                      key={item.id}
                      className="group relative aspect-[4/3] overflow-hidden rounded-[16px] border border-admin-line bg-admin-canvas"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt={item.file.name} className="size-full object-cover" />
                      <span className="absolute left-2 top-2 rounded-full bg-admin-canvas/90 px-2 py-0.5 text-[10px] font-medium text-admin-ink shadow-xs">
                        Belum dikirim
                      </span>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => removeStagedGalleryItem(item.id)}
                        aria-label={`Batalkan ${item.file.name}`}
                        title="Hapus dari antrean"
                        className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-admin-canvas/90 text-admin-danger shadow-sm transition-colors hover:bg-admin-rose-soft disabled:opacity-50 cursor-pointer"
                      >
                        <X aria-hidden="true" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      const url = stagedSingleFiles[field.name]?.previewUrl ?? String(value ?? "");
      const inputId = `${id}-file`;
      return (
        <div className="space-y-2">
          <p className="text-[11px] font-bold tracking-wider text-zinc-600 dark:text-zinc-400 uppercase">
            {field.label}
          </p>
          {field.help && (
            <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 -mt-1">{field.help}</span>
          )}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              if (!galleryUploading) setGalleryDragging(true);
            }}
            onDragLeave={() => setGalleryDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setGalleryDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file && !galleryUploading) stageSingleGalleryFile(field, file);
            }}
            className={`relative ${
              url ? "mx-auto w-fit max-w-full" : "w-full"
            } rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${
              galleryDragging ? "border-admin-lilac-dot/30 bg-admin-lilac-dot/5" : "border-border-default bg-bg-well/40"
            }`}
          >
            <input
              id={inputId}
              type="file"
              accept="image/*"
              disabled={galleryUploading}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file && !galleryUploading) stageSingleGalleryFile(field, file);
              }}
            />
            {url ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="block max-h-[420px] w-auto max-w-full object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    if (stagedSingleFiles[field.name]) {
                      setStagedSingleFiles((prev) => {
                        const target = prev[field.name];
                        if (target) URL.revokeObjectURL(target.previewUrl);
                        const next = { ...prev };
                        delete next[field.name];
                        return next;
                      });
                    } else {
                      setValue(field, "");
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <X size={14} />
                </button>
                <label
                  htmlFor={inputId}
                  className="absolute bottom-2 right-2 h-8 px-3 rounded-full bg-admin-surface/90 text-admin-ink hover:bg-admin-surface text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ImageIcon size={13} /> Ganti foto
                </label>
                {galleryUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-white" />
                  </div>
                )}
              </div>
            ) : (
              <label
                htmlFor={inputId}
                className="w-full px-6 py-8 flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                {galleryUploading ? (
                  <Loader2 size={30} className="animate-spin text-text-muted" />
                ) : (
                  <ImageIcon size={30} className="text-text-muted" />
                )}
                <p className="text-xs font-bold text-text-primary">
                  {galleryUploading ? "Mengunggah foto…" : field.placeholder ?? "Pilih Foto"}
                </p>
                <p className="text-[10px] text-text-muted text-center">
                  Klik untuk unggah foto, atau tarik &amp; lepas ke sini. Maksimal 5MB (JPG, PNG, WEBP)
                </p>
              </label>
            )}
          </div>
          {error && (
            <p id={`${id}-error`} role="alert" className="text-xs text-destructive font-semibold">
              {error}
            </p>
          )}
        </div>
      );
    }

    if (field.type === "textarea") {
      const words = countWords(String(value ?? ""));
      return (
        <div className="space-y-1">
          <Field {...fieldProps}>
            <AdminTextarea
              id={id}
              aria-invalid={error ? true : undefined}
              value={String(value ?? "")}
              onChange={(event) => setValue(field, event.target.value)}
              rows={5}
              placeholder={field.placeholder}
            />
          </Field>
          {(field.minWords || field.maxWords) && (
            <p
              className={`text-[12px] font-medium ${
                field.maxWords && words > field.maxWords
                  ? "text-admin-danger"
                  : "text-admin-text-secondary"
              }`}
            >
              {words} kata · {field.minWords ?? 0}–{field.maxWords} kata
            </p>
          )}
        </div>
      );
    }

    if (field.type === "price") {
      return (
        <Field {...fieldProps}>
          <PriceInput
            id={id}
            aria-invalid={error ? true : undefined}
            value={String(value ?? "")}
            onValueChange={(next) => setValue(field, next)}
            placeholder={field.placeholder ?? "1.500.000"}
          />
        </Field>
      );
    }

    return (
      <Field {...fieldProps}>
        <AdminInput
          id={id}
          aria-invalid={error ? true : undefined}
          type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"}
          value={String(value ?? "")}
          onChange={(event) => setValue(field, event.target.value)}
          min={field.type === "number" ? 0 : undefined}
          placeholder={field.placeholder}
        />
      </Field>
    );
  };

  return (
    <div className="w-full space-y-5">
      <TableToolbar
        search={searchPlaceholder ? { placeholder: searchPlaceholder } : undefined}
        filters={filters}
        exportModule={exportModule}
        exportDisabled={visibleRows.length === 0}
        create={{ label: createLabel ?? `Tambah ${title.toLowerCase()}`, onClick: openCreate }}
      />

      <p role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </p>

      {error && (
        <div role="alert" className="p-3 rounded-xl text-xs font-semibold bg-admin-rose-soft text-admin-rose-ink">
          {error}
        </div>
      )}

      <AdminSheet
        open={isFormOpen}
        onOpenChange={(open) => { if (!open) closeForm(); }}
        size={modalSize ?? (fields.length <= 3 ? "sm" : twoColumns ? "lg" : "md")}
        icon={editingRow ? <Pencil aria-hidden="true" size={18} /> : <Plus aria-hidden="true" size={18} />}
        title={editingRow ? (editTitle ?? `Ubah ${title}`) : (createTitle ?? `Tambah ${title}`)}
        description={formHint ?? `Lengkapi informasi ${title.toLowerCase()} di bawah ini.`}
        footer={
          <>
            <button
              type="button"
              onClick={closeForm}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
            >
              Batal
            </button>
            <button
              type="submit"
              form={formId}
              disabled={isSaving}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center gap-2 rounded-full bg-admin-ink text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
            >
              {isSaving ? <Loader2 aria-hidden="true" size={16} className="animate-spin" /> : <Check aria-hidden="true" size={16} />}
              {isSaving ? "Menyimpan…" : `Simpan ${title}`}
            </button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="p-3 rounded-xl text-xs font-semibold bg-admin-rose-soft text-admin-rose-ink">
              {error}
            </div>
          )}

          {fields
            .filter((field) => field.type === "gallery")
            .map((field) => (
              <div key={field.name}>{renderField(field)}</div>
            ))}

          <div className={twoColumns ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
            {fields.filter((field) => !field.hiddenInForm && field.type !== "gallery").map((field) => (
              <div
                key={field.name}
                className={
                  twoColumns && (field.type === "textarea" || field.type === "sessions")
                    ? "md:col-span-2"
                    : ""
                }
              >
                {renderField(field)}
              </div>
            ))}
          </div>
        </form>
      </AdminSheet>

      <AdminSheet
        open={detailRow !== null}
        onOpenChange={(open) => { if (!open) setDetailRow(null); }}
        size="md"
        icon={<Eye aria-hidden="true" size={18} />}
        title={detailRow ? displayRowTitle(fields, displayField, detailRow) : title}
        description={`Detail ${title.toLowerCase()}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setDetailRow(null)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface"
            >
              Tutup
            </button>
            {detailRow && (
              <button
                type="button"
                onClick={() => {
                  const target = detailRow;
                  setDetailRow(null);
                  openEdit(target);
                }}
                className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center gap-2 rounded-full bg-admin-ink text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft"
              >
                <Pencil aria-hidden="true" size={16} />
                <span>Ubah</span>
              </button>
            )}
          </>
        }
      >
        {detailRow && (
          <div className="space-y-4">
            {fields
              .filter((field) => field.type === "gallery" && detailRow[field.name])
              .map((field) => (
                <div key={field.name} className="overflow-hidden rounded-[20px] border border-admin-line bg-admin-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={String(detailRow[field.name])}
                    alt={displayRowTitle(fields, displayField, detailRow)}
                    className="block max-h-72 w-full object-cover"
                  />
                </div>
              ))}
            <dl className="divide-y divide-admin-line border-y border-admin-line">
              {fields
                .filter((field) => field.type !== "gallery")
                .map((field) => (
                  <div key={field.name} className="py-3">
                    <dt className="text-[12px] font-medium text-admin-text-secondary">{field.label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-[14px] text-admin-ink">{displayValue(field, detailRow)}</dd>
                  </div>
                ))}
            </dl>
          </div>
        )}
      </AdminSheet>

      <AdminSheet
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        size="sm"
        tone="danger"
        icon={<Trash2 aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={`Hapus ${title}?`}
        description={
          deleteTarget
            ? (() => {
                const hasDisplayField = tableFields.some(
                  (field) => field.name === displayField && field.type !== "gallery"
                );
                const name = hasDisplayField ? displayRowTitle(fields, displayField, deleteTarget) : "";
                return name && name !== "—"
                  ? `Hapus "${name}"? Tindakan ini permanen.`
                  : bento
                    ? "Hapus foto ini? Tindakan ini permanen."
                    : "Hapus item ini? Tindakan ini permanen.";
              })()
            : ""
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => { if (deleteTarget) void handleDelete(deleteTarget); }}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full bg-admin-danger text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
            >
              Hapus
            </button>
          </>
        }
      />

      {groupField && (
        <div className="flex flex-wrap gap-4 border-b border-border-default pb-0">
          {groups.map((option) => {
            const count = rows.filter((row) => String(row[groupField.name]) === option).length;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setActiveGroup(option)}
                aria-pressed={activeGroup === option}
                className={`pb-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${activeGroup === option
                    ? "text-text-primary border-b-2 border-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                {groupField.labels?.[option] ?? option} ({count})
              </button>
            );
          })}
        </div>
      )}

      {galleryCards ? (
        visibleRows.length === 0 ? emptyState : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRows.map((row) => {
              const imageField = tableFields.find((field) => field.type === "gallery");
              const imageUrl = imageField ? String(row[imageField.name] ?? "") : "";
              const label = displayRowTitle(fields, displayField, row);
              const metaField = tableFields.find((field) => field.name !== displayField && field.type !== "gallery" && field.type !== "textarea");
              const metaText = metaField ? displayValue(metaField, row) : null;
              return (
                <article
                  key={String(row[primaryKey])}
                  className="overflow-hidden rounded-[24px] border border-admin-line bg-admin-surface"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-admin-surface-muted">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={label} className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-admin-text-faint">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        aria-label={`Hapus ${label}`}
                        title="Hapus"
                        className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-admin-canvas/90 text-admin-danger shadow-sm transition-colors hover:bg-admin-rose-soft"
                      >
                        <Trash2 aria-hidden="true" size={16} />
                      </button>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-3 pb-3 pt-8">
                      <button
                        type="button"
                        onClick={() => setDetailRow(row)}
                        aria-label={`Detail ${label}`}
                        title="Detail"
                        className="inline-flex size-9 items-center justify-center rounded-full bg-admin-canvas/95 text-admin-ink shadow-sm transition-colors hover:bg-admin-surface"
                      >
                        <Eye aria-hidden="true" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        aria-label={`Ubah ${label}`}
                        title="Ubah"
                        className="inline-flex size-9 items-center justify-center rounded-full bg-admin-ink text-admin-on-ink shadow-sm transition-colors hover:bg-admin-ink-soft"
                      >
                        <Pencil aria-hidden="true" size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="truncate text-[15px] font-semibold text-admin-ink" title={label}>{label}</h3>
                    {metaText && metaText !== "—" && (
                      <p className="mt-1 truncate text-[13px] text-admin-text-secondary" title={metaText}>{metaText}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : bento ? (
        visibleRows.length === 0 ? emptyState : (() => {
          const activeCols = Math.max(1, Math.min(masonryCols, visibleRows.length));
          const columns = Array.from({ length: activeCols }, (_, colIndex) =>
            visibleRows.filter((_, rowIndex) => rowIndex % activeCols === colIndex)
          );
          const hasDisplayField = tableFields.some(
            (field) => field.name === displayField && field.type !== "gallery"
          );
          return (
            <div
              className="grid items-start gap-3"
              style={{ gridTemplateColumns: `repeat(${activeCols}, minmax(0, 1fr))` }}
            >
              {columns.map((colRows, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-3">
                  {colRows.map((row) => {
                    const imageField = tableFields.find((field) => field.type === "gallery");
                    const imageUrl = imageField ? String(row[imageField.name] ?? "") : "";
                    const label = displayRowTitle(fields, displayField, row);
                    const showLabel = hasDisplayField && label !== "—" && label !== "";
                    const actionLabel = showLabel ? label : "foto";
                    return (
                      <div
                        key={String(row[primaryKey])}
                        className="group relative overflow-hidden rounded-2xl border border-border-default bg-bg-well/40"
                      >
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt=""
                            className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-40 items-center justify-center text-text-muted">
                            <ImageIcon size={28} />
                          </div>
                        )}
                        {showLabel && (
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          aria-label={`Ubah ${actionLabel}`}
                          className="absolute inset-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
                        />
                        {showLabel && (
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
                            <p className="line-clamp-2 text-[11px] font-bold leading-snug text-white drop-shadow">
                              {label}
                            </p>
                          </div>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(row)}
                            title="Hapus"
                            aria-label={`Hapus ${actionLabel}`}
                            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-100 md:opacity-0 backdrop-blur transition-opacity hover:bg-red-600 focus:opacity-100 md:group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()
      ) : (
        <>
      {visibleRows.length === 0 && emptyState}
      <div className={visibleRows.length === 0 ? "hidden" : "hidden md:block"}><DataTable caption={title}>
            <thead>
              <tr>
                {tableFields.map((field) => (
                  <th scope="col" key={field.name}>
                    {field.label}
                  </th>
                ))}
                {activeField && (
                  <th scope="col">Status</th>
                )}
                <th scope="col" className="text-right"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={String(row[primaryKey])}>
                  {tableFields.map((field) => (
                    <td
                      key={field.name}
                      className={`max-w-[280px] truncate ${field.name === displayField ? "" : "text-admin-text-secondary"}`}
                      title={displayValue(field, row)}
                    >
                      {field.type === "gallery" && row[field.name] ? (
                        <img
                          src={String(row[field.name])}
                          alt=""
                          className="size-10 rounded-xl object-cover"
                        />
                      ) : field.type === "gallery" ? (
                        <span
                          aria-hidden="true"
                          className="inline-flex size-10 items-center justify-center rounded-full bg-admin-butter-soft text-[12px] font-bold text-admin-butter-ink"
                        >
                          {(() => {
                            const words = displayRowTitle(fields, displayField, row).trim().split(/\s+/).filter(Boolean).slice(0, 2);
                            if (words.length === 0) return "—";
                            if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
                            return words.map((w) => w[0]?.toUpperCase() ?? "").join("");
                          })()}
                        </span>
                      ) : field.name === displayField ? (
                        <span className="font-medium">{displayValue(field, row)}</span>
                      ) : (
                        displayValue(field, row)
                      )}
                    </td>
                  ))}
                  {activeField && (
                    <td>
                      {renderActiveToggle(row)}
                    </td>
                  )}
                  <td className="text-right">
                    <RowActions itemName={displayRowTitle(fields, displayField, row)} onEdit={() => openEdit(row)} onDelete={() => handleDelete(row)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable></div>

      {visibleRows.length === 0 ? null : (
        <div className="md:hidden grid grid-cols-1 gap-4">
          {visibleRows.map((row) => (
            <Card
              key={String(row[primaryKey])}
              className="p-4 flex flex-col gap-3"
            >
              <div>
                <h3 className="text-sm font-black text-text-primary break-words">{displayRowTitle(fields, displayField, row)}</h3>
                <dl className="mt-2 space-y-1">
                  {tableFields
                    .filter((field) => field.name !== displayField && field.name !== primaryKey)
                    .map((field) => (
                      <div key={field.name} className="flex gap-2 text-[11px]">
                        <dt className="text-text-secondary shrink-0">{field.label}</dt>
                        <dd className="text-text-primary break-words min-w-0">{displayValue(field, row)}</dd>
                      </div>
                    ))}
                </dl>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-1">
                {renderActiveToggle(row)}
                <span className="ml-auto"><RowActions itemName={displayRowTitle(fields, displayField, row)} onEdit={() => openEdit(row)} onDelete={() => handleDelete(row)} /></span>
              </div>
            </Card>
          ))}
        </div>
      )}
        </>
      )}
      <UploadBlockingModal
        open={galleryUploading || multiUploadProgress !== null}
        title="Mengunggah gambar galeri…"
        current={multiUploadProgress?.current}
        total={multiUploadProgress?.total}
      />
    </div>
  );
}
