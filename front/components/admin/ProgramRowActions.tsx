"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { rowActionClass, rowDangerActionClass } from "@/components/admin/ui/data-table";

export default function ProgramRowActions({ slug, title }: { slug: string; title: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("programs").delete().eq("slug", slug);
    setIsDeleting(false);

    if (error) {
      toast.error("Gagal menghapus program: " + error.message);
      return;
    }

    toast.success(`Program "${title}" berhasil dihapus.`);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <Link href={`/admin/program/${slug}/edit`} aria-label={`Ubah ${title}`} title="Ubah" className={rowActionClass}>
          <Pencil aria-hidden="true" size={18} strokeWidth={1.5} />
        </Link>
        <button type="button" onClick={() => setIsOpen(true)} aria-label={`Hapus ${title}`} title="Hapus" className={rowDangerActionClass}>
          <Trash2 aria-hidden="true" size={18} strokeWidth={1.5} />
        </button>
      </div>

      <DeleteConfirmDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleDelete}
        title="Hapus Program"
        description={`Hapus "${title}"? Tindakan ini permanen dan dapat memengaruhi data batch/member terkait.`}
      />

      {isDeleting && <span className="sr-only" role="status">Menghapus program...</span>}
    </>
  );
}
