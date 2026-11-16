"use client";

import { createClient } from "@/lib/supabase/client";
import { RowActions } from "@/components/admin/ui/row-actions";

export default function ProgramRowActions({ slug, title }: { slug: string; title: string }) {
  // RLS limits deletes to adminsuper; RowActions only shows Hapus to that role and confirms first.
  async function remove() {
    const { error } = await createClient().from("programs").delete().eq("slug", slug);
    return error ? { error: `Gagal menghapus program: ${error.message}` } : {};
  }
  return <RowActions itemName={title} editHref={`/admin/program/${slug}/edit`} onDelete={remove} />;
}
