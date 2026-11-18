"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Eye, Image as ImageIcon, Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/file-compress";
import { TableToolbar, matchesQuery } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { useIsAdminSuper } from "@/components/admin/ui/row-actions";
import { AdminSheet } from "@/components/admin/ui/AdminSheet";
import { FormDialog } from "@/components/admin/ui/form/FormDialog";
import { UploadBlockingModal } from "@/components/admin/ui/UploadBlockingModal";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { AdminInput } from "@/components/admin/ui/form/controls";
import { deletePartner, savePartner } from "./actions";

export type PartnerRow = {
  id: number;
  name: string;
  logo_url: string | null;
  published: boolean;
};

export function PartnerClient({ partners }: { partners: PartnerRow[] }) {
  const router = useRouter();
  const canDelete = useIsAdminSuper();
  const query = useSearchParams().get("q") ?? "";
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerRow | null>(null);
  const [detailPartner, setDetailPartner] = useState<PartnerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartnerRow | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedPreviewUrl, setStagedPreviewUrl] = useState("");
  const stagedPreviewRef = useRef("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    stagedPreviewRef.current = stagedPreviewUrl;
  }, [stagedPreviewUrl]);

  useEffect(() => {
    return () => {
      if (stagedPreviewRef.current) URL.revokeObjectURL(stagedPreviewRef.current);
    };
  }, []);

  function clearStagedLogo() {
    if (stagedPreviewRef.current) {
      URL.revokeObjectURL(stagedPreviewRef.current);
      stagedPreviewRef.current = "";
    }
    setStagedFile(null);
    setStagedPreviewUrl("");
  }

  const visible = partners.filter((partner) => matchesQuery(partner.name || "Partner", query));

  function openCreate() {
    clearStagedLogo();
    setEditing(null);
    setName("");
    setLogoUrl("");
    setError(null);
    setModalOpen(true);
  }

  function openEdit(partner: PartnerRow) {
    clearStagedLogo();
    setEditing(partner);
    setName(partner.name);
    setLogoUrl(partner.logo_url ?? "");
    setError(null);
    setModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    if (uploading) return;
    if (!open) {
      clearStagedLogo();
    }
    setModalOpen(open);
  }

  function stageLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal 5MB.");
      return;
    }
    if (stagedPreviewRef.current) {
      URL.revokeObjectURL(stagedPreviewRef.current);
    }
    const nextPreview = URL.createObjectURL(file);
    stagedPreviewRef.current = nextPreview;
    setStagedFile(file);
    setStagedPreviewUrl(nextPreview);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (uploading || pending) return;
    setError(null);

    if (!name.trim() && !logoUrl && !stagedFile) {
      setError("Isi nama partner atau unggah logo partner.");
      return;
    }

    let finalLogoUrl = logoUrl;
    if (stagedFile) {
      setUploading(true);
      try {
        const compressed = await compressImage(stagedFile);
        const body = new FormData();
        body.set("purpose", "landing");
        body.set("file", compressed);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setError(data.error || "Gagal mengunggah logo.");
          setUploading(false);
          return;
        }
        finalLogoUrl = data.url;
      } catch {
        setError("Gagal mengunggah logo.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const formData = new FormData();
    if (editing) formData.set("id", String(editing.id));
    formData.set("name", name);
    formData.set("logo", finalLogoUrl);

    startTransition(async () => {
      const res = await savePartner(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      clearStagedLogo();
      setModalOpen(false);
      toast.success(editing ? "Partner diperbarui." : "Partner ditambahkan.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <TableToolbar
        search={{ placeholder: "Cari partner…" }}
        exportModule="partner"
        exportDisabled={visible.length === 0}
        create={{ label: "Tambah partner", onClick: openCreate }}
      />

      {visible.length === 0 ? (
        query ? (
          <EmptyState searching title="Tidak ada partner yang cocok" description="Coba nama lain." />
        ) : (
          <EmptyState title="Belum ada partner" description="Tambahkan instansi yang pernah dilatih Albana." />
        )
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((partner) => {
            const label = partner.name || "Partner tanpa nama";
            return (
              <article
                key={partner.id}
                className="overflow-hidden rounded-[24px] border border-admin-line bg-admin-surface"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-admin-surface-muted">
                  {partner.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- logos may be external URLs or /api/media redirects
                    <img
                      src={partner.logo_url}
                      alt={label}
                      className="size-full bg-admin-canvas object-contain p-5"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-admin-text-faint">
                      <Building2 size={32} />
                    </div>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(partner)}
                      aria-label={`Hapus ${label}`}
                      title="Hapus"
                      className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-admin-canvas/90 text-admin-danger shadow-sm transition-colors hover:bg-admin-rose-soft cursor-pointer"
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-2 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-3 pb-3 pt-8">
                    <button
                      type="button"
                      onClick={() => setDetailPartner(partner)}
                      aria-label={`Detail ${label}`}
                      title="Detail"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-admin-canvas/95 text-admin-ink shadow-sm transition-colors hover:bg-admin-surface cursor-pointer"
                    >
                      <Eye aria-hidden="true" size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(partner)}
                      aria-label={`Ubah ${label}`}
                      title="Ubah"
                      className="inline-flex size-9 items-center justify-center rounded-full bg-admin-ink text-admin-on-ink shadow-sm transition-colors hover:bg-admin-ink-soft cursor-pointer"
                    >
                      <Pencil aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="truncate text-[15px] font-semibold text-admin-ink" title={label}>
                    {label}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <FormDialog
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        icon={<Building2 aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={editing ? `Ubah ${editing.name || "partner"}` : "Tambah partner"}
        description="Partner yang disimpan otomatis langsung diterbitkan di halaman publik."
        size="sm"
        submitLabel="Simpan partner"
        pending={pending || uploading}
        onSubmit={handleSubmit}
      >
        <FieldGrid columns={1}>
          <Field label="Nama partner (opsional)" htmlFor="partner-name" hint="Jika tidak ada logo, nama partner akan ditampilkan di landing page.">
            <AdminInput
              id="partner-name"
              maxLength={160}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Bank Indonesia"
            />
          </Field>

          <div className="w-full space-y-2 sm:col-span-2">
            <p className="text-[13px] font-medium text-admin-ink">Logo partner (opsional)</p>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                if (!uploading) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files?.[0];
                if (file && !uploading) stageLogo(file);
              }}
              className={`relative ${
                stagedPreviewUrl || logoUrl ? "mx-auto w-fit max-w-full" : "w-full"
              } overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${
                dragging ? "border-admin-ink bg-admin-surface-muted" : "border-admin-line-strong bg-admin-surface/60"
              }`}
            >
              <input
                id="partner-logo-file"
                type="file"
                accept="image/*"
                disabled={uploading}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file && !uploading) stageLogo(file);
                }}
              />
              {stagedPreviewUrl || logoUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stagedPreviewUrl || logoUrl}
                    alt={name || "Logo partner"}
                    className="block max-h-56 w-auto max-w-full object-contain p-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (stagedPreviewUrl) {
                        clearStagedLogo();
                      } else {
                        setLogoUrl("");
                      }
                    }}
                    className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-red-600"
                    title="Hapus logo"
                  >
                    <X size={14} />
                  </button>
                  <label
                    htmlFor="partner-logo-file"
                    className="absolute bottom-2 right-2 flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-admin-surface/90 px-3 text-[11px] font-bold text-admin-ink transition-colors hover:bg-admin-surface"
                  >
                    <ImageIcon size={13} /> Ganti logo
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="partner-logo-file"
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 px-6 py-8"
                >
                  {uploading ? (
                    <Loader2 size={28} className="animate-spin text-admin-text-secondary" />
                  ) : (
                    <ImageIcon size={28} className="text-admin-text-secondary" />
                  )}
                  <p className="text-xs font-bold text-admin-ink">
                    {uploading ? "Mengunggah logo…" : "Pilih Logo"}
                  </p>
                  <p className="text-center text-[11px] text-admin-text-secondary">
                    Klik untuk unggah logo, atau tarik &amp; lepas ke sini. Semua resolusi &amp; orientasi diperbolehkan (JPG, PNG, WEBP · maks. 5MB)
                  </p>
                </label>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-[12px] text-admin-danger">
              {error}
            </p>
          )}
        </FieldGrid>
      </FormDialog>

      <AdminSheet
        open={detailPartner !== null}
        onOpenChange={(open) => { if (!open) setDetailPartner(null); }}
        size="md"
        icon={<Eye aria-hidden="true" size={18} />}
        title={detailPartner?.name || "Partner tanpa nama"}
        description="Detail partner"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDetailPartner(null)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface cursor-pointer"
            >
              Tutup
            </button>
            {detailPartner && (
              <button
                type="button"
                onClick={() => {
                  const target = detailPartner;
                  setDetailPartner(null);
                  openEdit(target);
                }}
                className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center gap-2 rounded-full bg-admin-ink text-[15px] font-medium text-admin-on-ink transition-colors hover:bg-admin-ink-soft cursor-pointer"
              >
                <Pencil aria-hidden="true" size={16} />
                <span>Ubah</span>
              </button>
            )}
          </>
        }
      >
        {detailPartner && (
          <div className="space-y-4">
            {detailPartner.logo_url && (
              <div className="overflow-hidden rounded-[20px] border border-admin-line bg-admin-surface p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailPartner.logo_url}
                  alt={detailPartner.name || "Logo partner"}
                  className="mx-auto block max-h-72 w-auto max-w-full object-contain"
                />
              </div>
            )}
            <dl className="divide-y divide-admin-line border-y border-admin-line">
              <div className="py-3">
                <dt className="text-[12px] font-medium text-admin-text-secondary">Nama partner</dt>
                <dd className="mt-1 text-[14px] text-admin-ink">{detailPartner.name || "—"}</dd>
              </div>
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
        title={`Hapus ${deleteTarget?.name || "partner"}?`}
        description="Tindakan ini tidak dapat dibatalkan."
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => {
                if (!deleteTarget) return;
                const target = deleteTarget;
                setDeleteTarget(null);
                startTransition(async () => {
                  const res = await deletePartner(target.id);
                  if (res.error) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success(`${target.name || "Partner"} dihapus.`);
                  router.refresh();
                });
              }}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full bg-admin-danger text-[15px] font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              Hapus
            </button>
          </>
        }
      />

      <UploadBlockingModal open={uploading} title="Mengunggah logo partner…" />
    </div>
  );
}
