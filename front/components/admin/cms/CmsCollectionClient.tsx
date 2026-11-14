"use client";

import React, { useState } from "react";
import { Check, Image as ImageIcon, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/file-compress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { DialogIconHeader } from "@/components/ui/DialogIconHeader";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { InputLine } from "@/components/ui/style-line/InputLine";
import { TextareaLine } from "@/components/ui/style-line/TextareaLine";
import { SelectLine } from "@/components/ui/SelectLine";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";

export type CmsFieldType =
  | "text"
  | "textarea"
  | "number"
  | "price"
  | "boolean"
  | "select"
  | "member"
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
};

export type CmsMemberOption = { id: string; name: string };

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
  /** Override the dialog max width, e.g. "max-w-lg". */
  maxWidth?: string;
  /** Tampilkan baris sebagai grid bento yang bisa diklik, bukan tabel. */
  bento?: boolean;
  /** Pilihan member untuk field bertipe "member". */
  members?: CmsMemberOption[];
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
  description,
  fields,
  initialRows,
  displayField,
  emptyText,
  groupBy,
  activeField,
  formHint,
  maxWidth,
  bento,
  members,
}: CmsCollectionClientProps) {
  const groupField = groupBy ? fields.find((field) => field.name === groupBy) : undefined;
  const groups = groupField?.options ?? [];
  const tableFields = groupField ? fields.filter((field) => field.name !== groupField.name) : fields;

  const [rows, setRows] = useState<Row[]>(initialRows);
  const [activeGroup, setActiveGroup] = useState(groups[0] ?? "");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>(() => initialFormState(fields, null));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [liveMessage, setLiveMessage] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryDragging, setGalleryDragging] = useState(false);
  const [activatingKey, setActivatingKey] = useState<string | null>(null);

  const uploadGalleryFile = async (field: CmsField, file: File) => {
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
      setValue(field, publicUrl);
      toast.success("Foto diunggah.");
    } catch (err) {
      toast.error(errorMessage(err, "Gagal mengunggah foto."));
    } finally {
      setGalleryUploading(false);
    }
  };

  const fieldId = (field: CmsField) => `${table}-${field.name}`;

  const visibleRows = groupField
    ? rows.filter((row) => String(row[groupField.name]) === activeGroup)
    : rows;

  const openCreate = () => {
    setEditingRow(null);
    setForm({
      ...initialFormState(fields, null),
      ...(groupField ? { [groupField.name]: activeGroup } : {}),
    });
    setError(null);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditingRow(row);
    setForm(initialFormState(fields, row));
    setError(null);
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
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
      if (editingRow) {
        const { error: updateError } = await supabase
          .from(table)
          .update(payload)
          .eq(primaryKey, editingRow[primaryKey]);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from(table).insert(payload);
        if (insertError) throw insertError;
      }
      await refresh();
      const message = editingRow ? "Perubahan tersimpan." : "Data ditambahkan.";
      toast.success(message);
      announce(message);
      if (groupField) setActiveGroup(String(payload[groupField.name] ?? activeGroup));
      setIsFormOpen(false);
      setEditingRow(null);
      setFieldErrors({});
    } catch (err) {
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
      await refresh();
      toast.success("Data berhasil dihapus.");
      announce("Data berhasil dihapus.");
    } catch (err) {
      setError(errorMessage(err, "Gagal menghapus data."));
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
        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-[11px] font-bold uppercase tracking-wider transition-colors ${
          active
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default"
            : "border-border-default bg-bg-well/50 text-text-secondary hover:text-text-primary cursor-pointer"
        }`}
      >
        {busy ? <Loader2 size={12} className="animate-spin" /> : active ? "Active" : "Inactive"}
      </button>
    );
  };

  const twoColumns = fields.length >= 5;

  const renderField = (field: CmsField) => {
    const value = form[field.name];
    const id = fieldId(field);
    const error = fieldErrors[field.name];
    const common = { id, label: field.label, error, required: field.required, hint: field.help };

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
                    className="rounded-full border border-red-500/20"
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
            className="h-9 w-full rounded-full border-sky-500/20 bg-sky-500/10 text-[11px] font-bold uppercase tracking-wider text-sky-600 hover:bg-sky-500/20 dark:text-sky-400"
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
      return (
        <SelectLine
          id={id}
          label={field.label}
          value={String(value ?? "")}
          onValueChange={(next) => setValue(field, next)}
          options={(field.options ?? []).map((option) => ({
            value: option,
            label: field.labels?.[option] ?? option,
          }))}
          placeholder="Pilih…"
          hint={field.help}
          error={error}
          required={field.required}
        />
      );
    }

    if (field.type === "member") {
      return (
        <SelectLine
          id={id}
          label={field.label}
          value={String(value ?? "")}
          onValueChange={(next) => setValue(field, next)}
          options={(members ?? []).map((member) => ({
            value: member.id,
            label: member.name,
          }))}
          placeholder="Pilih dari data member…"
          hint={field.help}
          error={error}
          required={field.required}
        />
      );
    }

    if (field.type === "tags") {
      const raw = String(value ?? "");
      const tags = raw.split(",").map((tag) => tag.trim()).filter(Boolean);
      return (
        <div className="space-y-2">
          <InputLine
            id={id}
            label={field.label}
            hint={field.help}
            required={field.required}
            error={error}
            value={raw}
            placeholder={field.placeholder ?? "Pisahkan dengan koma, mis. Public Speaking, MC"}
            onChange={(event) => setValue(field, event.target.value)}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Hapus ${tag}`}
                    onClick={() => setValue(field, tags.filter((item) => item !== tag).join(", "))}
                    className="cursor-pointer text-sky-600/70 hover:text-red-500 dark:text-sky-300/70"
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
      const url = String(value ?? "");
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
              if (file && !galleryUploading) void uploadGalleryFile(field, file);
            }}
            className={`relative ${
              url ? "mx-auto w-fit max-w-full" : "w-full"
            } rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${
              galleryDragging ? "border-sky-500 bg-sky-500/5" : "border-border-default bg-bg-well/40"
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
                if (file && !galleryUploading) void uploadGalleryFile(field, file);
              }}
            />
            {url ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="block max-h-[420px] w-auto max-w-full object-contain" />
                <button
                  type="button"
                  onClick={() => setValue(field, "")}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <X size={14} />
                </button>
                <label
                  htmlFor={inputId}
                  className="absolute bottom-2 right-2 h-8 px-3 rounded-full bg-white/90 text-zinc-900 hover:bg-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <TextareaLine
            {...common}
            value={String(value ?? "")}
            onChange={(event) => setValue(field, event.target.value)}
            rows={5}
            placeholder={field.placeholder}
          />
          {(field.minWords || field.maxWords) && (
            <p
              className={`text-[10px] font-semibold ${
                field.maxWords && words > field.maxWords
                  ? "text-destructive"
                  : "text-text-secondary"
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
        <InputLine
          {...common}
          inputMode="numeric"
          prefixText="Rp"
          value={String(value ?? "")}
          onChange={(event) => setValue(field, event.target.value.replace(/\D/g, ""))}
          placeholder={field.placeholder ?? "1.500.000"}
        />
      );
    }

    return (
      <InputLine
        {...common}
        type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"}
        value={String(value ?? "")}
        onChange={(event) => setValue(field, event.target.value)}
        min={field.type === "number" ? 0 : undefined}
        placeholder={field.placeholder}
      />
    );
  };

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black tracking-wider text-text-primary uppercase">{title}</h1>
          <p className="text-xs text-text-secondary mt-0.5 max-w-2xl">{description}</p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="hidden md:inline-flex h-10 shrink-0 rounded-full px-5 text-[11px] font-bold uppercase tracking-wider"
        >
          <Plus size={8} /> Tambah
        </Button>
      </div>

      <Button
        type="button"
        onClick={openCreate}
        aria-label={`Tambah ${title}`}
        className="md:hidden fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full p-0 shadow-lg"
      >
        <Plus size={22} className="size-[22px]" />
      </Button>

      <p role="status" aria-live="polite" className="sr-only">
        {liveMessage}
      </p>

      {error && (
        <div role="alert" className="p-3 rounded-xl text-xs font-semibold bg-[#FEE2E2] text-[#991B1B] dark:bg-[#450A0A] dark:text-[#FECACA]">
          {error}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
        <DialogContent className={`admin-dialog-motion ${maxWidth ?? (twoColumns ? "max-w-4xl" : "max-w-2xl")} bg-bg-card border-border-default`}>
          <DialogIconHeader
            icon={editingRow ? <Pencil size={18} /> : <Plus size={18} />}
            title={editingRow ? `Ubah ${title}` : `Tambah ${title}`}
            description={formHint ?? `Lengkapi informasi ${title.toLowerCase()} di bawah ini.`}
          />

          <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto space-y-4 pr-1">
              {error && (
                <div role="alert" className="p-3 rounded-xl text-xs font-semibold bg-[#FEE2E2] text-[#991B1B] dark:bg-[#450A0A] dark:text-[#FECACA]">
                  {error}
                </div>
              )}

              {fields
                .filter((field) => field.type === "gallery")
                .map((field) => (
                  <div key={field.name}>{renderField(field)}</div>
                ))}

              <div className={twoColumns ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                {fields.filter((field) => field.type !== "gallery").map((field) => (
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
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                className="h-9 rounded-full px-5 text-xs font-bold uppercase tracking-wider text-text-secondary"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-9 rounded-full px-5 text-xs font-bold uppercase tracking-wider"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {isSaving ? "Menyimpan…" : `Simpan ${title}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title={`Hapus ${title}`}
        description={
          deleteTarget
            ? `Hapus "${displayRowTitle(fields, displayField, deleteTarget)}"? Tindakan ini permanen.`
            : ""
        }
        onConfirm={() => { if (deleteTarget) void handleDelete(deleteTarget); }}
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

      {bento ? (
        visibleRows.length === 0 ? (
          <div className="bg-bg-card border border-border-default border-dashed rounded-2xl p-10 text-center">
            <p className="text-xs font-semibold text-text-muted">{emptyText}</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {visibleRows.map((row) => {
              const imageField = tableFields.find((field) => field.type === "gallery");
              const imageUrl = imageField ? String(row[imageField.name] ?? "") : "";
              const label = displayRowTitle(fields, displayField, row);
              return (
                <div
                  key={String(row[primaryKey])}
                  className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-border-default bg-bg-well/40"
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <button
                    type="button"
                    onClick={() => openEdit(row)}
                    aria-label={`Ubah ${label}`}
                    className="absolute inset-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
                    <p className="line-clamp-2 text-[11px] font-bold leading-snug text-white drop-shadow">
                      {label === "—" ? "Tanpa nama" : label}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(row)}
                    title="Hapus"
                    aria-label={`Hapus ${label}`}
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-100 md:opacity-0 backdrop-blur transition-opacity hover:bg-red-600 focus:opacity-100 md:group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <>
      <div className="hidden md:block bg-bg-card border border-border-default rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-zinc-650 dark:text-zinc-400 font-semibold border-b border-border-default bg-bg-well/50">
                {tableFields.map((field) => (
                  <th key={field.name} className="py-3.5 px-5 border-r border-border-default/60 whitespace-nowrap">
                    {field.label}
                  </th>
                ))}
                {activeField && (
                  <th className="py-3.5 px-5 border-r border-border-default/60 text-center whitespace-nowrap">Status</th>
                )}
                <th className="py-3.5 px-5 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={tableFields.length + (activeField ? 2 : 1)} className="py-12 px-5 text-center text-xs font-semibold text-text-muted">
                    {emptyText}
                  </td>
                </tr>
              )}
              {visibleRows.map((row) => (
                <tr key={String(row[primaryKey])} className="hover:bg-bg-well/40 transition-colors">
                  {tableFields.map((field) => (
                    <td
                      key={field.name}
                      className="py-3.5 px-5 border-r border-border-default/40 max-w-[240px] truncate text-text-secondary"
                      title={displayValue(field, row)}
                    >
                      {field.type === "gallery" && row[field.name] ? (
                        <img
                          src={String(row[field.name])}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover border border-border-default/60"
                        />
                      ) : field.name === displayField ? (
                        <span className="font-bold text-text-primary">{displayValue(field, row)}</span>
                      ) : (
                        displayValue(field, row)
                      )}
                    </td>
                  ))}
                  {activeField && (
                    <td className="py-3.5 px-5 border-r border-border-default/40 text-center">
                      {renderActiveToggle(row)}
                    </td>
                  )}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        title="Ubah"
                        className="p-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        title="Hapus"
                        className="p-1.5 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="md:hidden bg-bg-card border border-border-default border-dashed rounded-2xl p-10 text-center">
          <p className="font-desc p-8 text-xs text-center text-text-muted">{emptyText}</p>
        </div>
      ) : (
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
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="ml-auto h-8 px-3 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Pencil size={12} /> Ubah
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(row)}
                  className="h-8 px-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
