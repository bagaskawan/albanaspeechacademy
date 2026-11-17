"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { AdminSheet } from "./AdminSheet";
import { rowActionClass, rowDangerActionClass } from "./data-table";

// The shell knows the admin role once per request; row actions read it here instead of every page.
const AdminRoleContext = createContext<string | null>(null);
export const AdminRoleProvider = AdminRoleContext.Provider;
export const useIsAdminSuper = () => useContext(AdminRoleContext) === "adminsuper";

/** Row action template (admin-ui-patterns §8.2): optional extra pill · ✎ Ubah · 🗑 Hapus (adminsuper only, confirmed). */
export function RowActions({ itemName, editHref, onEdit, onDelete, extra }: {
  itemName: string;
  editHref?: string;
  onEdit?: () => void;
  /** Server actions may return `{ error }`; the template then toasts and refreshes the list. */
  onDelete?: () => void | Promise<void | { error?: string }>;
  extra?: React.ReactNode;
}) {
  const canDelete = useIsAdminSuper();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const editIcon = <Pencil aria-hidden="true" size={18} strokeWidth={1.5} />;

  return <div className="inline-flex items-center justify-end gap-1">
    {extra}
    {editHref && <Link href={editHref} aria-label={`Ubah ${itemName}`} title="Ubah" className={rowActionClass}>{editIcon}</Link>}
    {onEdit && <button type="button" onClick={onEdit} aria-label={`Ubah ${itemName}`} title="Ubah" className={rowActionClass}>{editIcon}</button>}
    {onDelete && canDelete && <>
      <button type="button" onClick={() => setConfirming(true)} aria-label={`Hapus ${itemName}`} title="Hapus" className={rowDangerActionClass}>
        <Trash2 aria-hidden="true" size={18} strokeWidth={1.5} />
      </button>
      <AdminSheet
        open={confirming}
        onOpenChange={setConfirming}
        size="sm"
        tone="danger"
        icon={<Trash2 aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={`Hapus ${itemName}?`}
        description="Tindakan ini tidak dapat dibatalkan."
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full border border-admin-line-strong text-[15px] font-medium text-admin-ink transition-colors hover:bg-admin-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={async () => {
                setConfirming(false);
                const result = await onDelete();
                if (!result) return;
                if (result.error) { toast.error(result.error); return; }
                toast.success(`${itemName} dihapus.`);
                router.refresh();
              }}
              className="inline-flex h-12 w-full shrink-0 sm:w-auto sm:flex-1 items-center justify-center rounded-full bg-admin-danger text-[15px] font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
            >
              Hapus
            </button>
          </>
        }
      />
    </>}
  </div>;
}

/** Small text pill for module-specific row actions (Aktifkan, Terbitkan, Verifikasi). */
export const rowPillClass = "inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink disabled:opacity-50";
