"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

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
      <div className="flex items-center justify-center gap-1.5">
        <Link
          href={`/admin/program/${slug}/edit`}
          className="p-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
          title="Edit Program"
        >
          <Pencil size={14} />
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-1.5 rounded-full border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
          title="Hapus Program"
        >
          <Trash2 size={14} />
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
