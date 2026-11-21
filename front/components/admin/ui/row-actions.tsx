"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteSheet } from "./delete-sheet";
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
  /** Returns `{ error }` on failure; DeleteSheet shows loading, toasts, and refreshes the list. */
  onDelete?: () => void | Promise<void | { error?: string }>;
  extra?: React.ReactNode;
}) {
  const canDelete = useIsAdminSuper();
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
      <DeleteSheet
        open={confirming}
        onOpenChange={setConfirming}
        title={`Hapus ${itemName}?`}
        successMessage={`${itemName} dihapus.`}
        onConfirm={onDelete}
      />
    </>}
  </div>;
}

/** Small text pill for module-specific row actions (Aktifkan, Terbitkan, Verifikasi). */
export const rowPillClass = "inline-flex h-9 items-center rounded-full px-3 text-[13px] font-medium text-admin-ink transition-colors hover:bg-admin-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink disabled:opacity-50";
