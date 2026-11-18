"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Image as ImageIcon, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/file-compress";
import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { TableToolbar, matchesQuery } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { RowActions, rowPillClass } from "@/components/admin/ui/row-actions";
import { FormDialog } from "@/components/admin/ui/form/FormDialog";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { AdminInput } from "@/components/admin/ui/form/controls";
import { deletePartner, savePartner, togglePartner } from "./actions";

export type PartnerRow = {
  id: number;
  name: string;
  logo_url: string | null;
  published: boolean;
};

export function PartnerClient({ partners }: { partners: PartnerRow[] }) {
  const router = useRouter();
  const query = useSearchParams().get("q") ?? "";
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerRow | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sessionUploadsRef = useRef<Set<string>>(new Set());

  function cleanupTempUploads(urls: string[]) {
    if (urls.length === 0) return;
    fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    }).catch(() => {});
  }

  const visible = partners.filter((partner) => matchesQuery(partner.name, query));

  function openCreate() {
    sessionUploadsRef.current.clear();
    setEditing(null);
    setName("");
    setLogoUrl("");
    setError(null);
    setModalOpen(true);
  }

  function openEdit(partner: PartnerRow) {
    sessionUploadsRef.current.clear();
    setEditing(partner);
    setName(partner.name);
    setLogoUrl(partner.logo_url ?? "");
    setError(null);
    setModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    if (!open && sessionUploadsRef.current.size > 0) {
      cleanupTempUploads(Array.from(sessionUploadsRef.current));
      sessionUploadsRef.current.clear();
    }
    setModalOpen(open);
  }

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Hanya file gambar yang diizinkan.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran logo maksimal 5MB.");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const body = new FormData();
      body.set("purpose", "landing");
      body.set("file", compressed);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error || "Gagal mengunggah logo.");
      } else {
        if (logoUrl && logoUrl !== data.url && sessionUploadsRef.current.has(logoUrl)) {
          sessionUploadsRef.current.delete(logoUrl);
          cleanupTempUploads([logoUrl]);
        }
        sessionUploadsRef.current.add(data.url);
        setLogoUrl(data.url);
        toast.success("Logo berhasil diunggah.");
      }
    } catch {
      toast.error("Gagal mengunggah logo.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    if (editing) formData.set("id", String(editing.id));
    formData.set("name", name);
    formData.set("logo", logoUrl);

    startTransition(async () => {
      const res = await savePartner(formData);
      if (res.error) {
        setError(res.error);
        return;
      }
      const unused = Array.from(sessionUploadsRef.current).filter((u) => u !== logoUrl);
      sessionUploadsRef.current.clear();
      cleanupTempUploads(unused);
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
        <DataTable caption="Partner" stackOnMobile>
          <thead>
            <tr>
              <th scope="col">Partner</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((partner) => (
              <tr key={partner.id}>
                <td data-label="Partner">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- logos may be external URLs or /api/media redirects */}
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt="" className="size-10 shrink-0 rounded-xl bg-admin-canvas object-contain" />
                    ) : (
                      <span aria-hidden="true" className="size-10 shrink-0 rounded-xl bg-admin-surface-muted" />
                    )}
                    <span className="truncate font-medium" title={partner.name}>
                      {partner.name}
                    </span>
                  </div>
                </td>
                <td data-label="Status">
                  <StatusChip tone={partner.published ? "mint" : "neutral"}>
                    {partner.published ? "Terbit" : "Draf"}
                  </StatusChip>
                </td>
                <td className="text-right">
                  <RowActions
                    itemName={partner.name}
                    onEdit={() => openEdit(partner)}
                    onDelete={deletePartner.bind(null, partner.id)}
                    extra={
                      <form action={togglePartner}>
                        <input type="hidden" name="id" value={partner.id} />
                        <input type="hidden" name="published" value={partner.published ? "false" : "true"} />
                        <button type="submit" className={rowPillClass}>
                          {partner.published ? "Tarik" : "Terbitkan"}
                        </button>
                      </form>
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      )}

      <FormDialog
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        icon={<Building2 aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={editing ? `Ubah ${editing.name}` : "Tambah partner"}
        description={editing ? "Status terbit tidak berubah." : "Partner baru disimpan sebagai draf sampai diterbitkan."}
        size="sm"
        submitLabel="Simpan partner"
        pending={pending}
        onSubmit={handleSubmit}
      >
        <FieldGrid columns={1}>
          <Field label="Nama partner" htmlFor="partner-name" required>
            <AdminInput
              id="partner-name"
              required
              aria-required="true"
              maxLength={160}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Bank Indonesia"
            />
          </Field>

          <div className="space-y-2">
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
                if (file && !uploading) void uploadLogo(file);
              }}
              className={`relative ${
                logoUrl ? "mx-auto w-fit max-w-full" : "w-full"
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
                  if (file && !uploading) void uploadLogo(file);
                }}
              />
              {logoUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt={name || "Logo partner"} className="block max-h-56 w-auto max-w-full object-contain p-3" />
                  <button
                    type="button"
                    onClick={() => {
                      if (logoUrl && sessionUploadsRef.current.has(logoUrl)) {
                        sessionUploadsRef.current.delete(logoUrl);
                        cleanupTempUploads([logoUrl]);
                      }
                      setLogoUrl("");
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
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                  )}
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
                    Klik untuk unggah logo, atau tarik &amp; lepas ke sini. Maksimal 5MB (JPG, PNG, WEBP)
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
    </div>
  );
}
