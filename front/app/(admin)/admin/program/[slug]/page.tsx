import { notFound, redirect } from "next/navigation";
import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { ProgramDetailBoard } from "@/components/admin/program/ProgramDetailBoard";
import type { BoardBatch, BoardBundle } from "@/components/admin/program/ProgramBatchBoard";
import { BUNDLE_SLUG, CERTIFICATION_SLUG, INHOUSE_SLUG, SERIES_SLUG, SPEAKER_SLUG } from "@/lib/bundle";
import { batchStatus } from "@/lib/program-batch";
import type { ProgramMediaItem } from "@/lib/program-media";
import { youtubeVideoId } from "@/lib/youtube";

export const dynamic = "force-dynamic";

async function loadProgramBoard(slug: string) {
  const supabase = await requireAdminMember();
  const billing = academyBillingClient();
  const [{ data: programs }, { data: batches }, { data: bundle }, { data: rawMedia }] = await Promise.all([
    supabase
      .from("programs")
      .select("slug,title,description,price_idr,original_price_idr,dp_percent,form_kind")
      .in("slug", [SERIES_SLUG, SPEAKER_SLUG, CERTIFICATION_SLUG]),
    supabase.from("batches").select("slug,program_slug,title,registration_open,sessions").order("slug"),
    billing.from("bundle_offers").select("active,price_idr,dp_percent,description").eq("slug", BUNDLE_SLUG).maybeSingle(),
    billing
      .from("media_assets")
      .select("id, provider, kind, object_key, alt_text")
      .eq("program_slug", slug)
      .order("created_at", { ascending: true }),
  ]);

  const program = (programs ?? []).find((p) => p.slug === slug);
  if (!program) return null;

  const nowMs = Date.now();
  const allBatches = (batches ?? []) as BoardBatch[];
  const hasOpen = (s: string) => allBatches.some((b) => b.program_slug === s && batchStatus(b, nowMs) === "open");

  const media: ProgramMediaItem[] = (rawMedia ?? [])
    .map((row): ProgramMediaItem | null => {
      if (row.provider === "youtube") {
        const videoId = youtubeVideoId(String(row.object_key ?? ""));
        if (!videoId) return null;
        return {
          id: row.id,
          kind: "video",
          provider: "youtube",
          src: `https://www.youtube-nocookie.com/embed/${videoId}`,
          alt: row.alt_text || "Video program",
          youtubeId: videoId,
        };
      }
      if (row.provider === "supabase_storage") {
        return {
          id: row.id,
          kind: row.kind === "video" ? "video" : "image",
          provider: "supabase_storage",
          src: `/api/media/${row.id}`,
          alt: row.alt_text || program.title || slug,
          youtubeId: null,
        };
      }
      return null;
    })
    .filter((item): item is ProgramMediaItem => item !== null);

  return {
    program,
    batches: allBatches.filter((b) => b.program_slug === slug),
    bundle: (bundle as BoardBundle | null) ?? null,
    speakerPrice: Number((programs ?? []).find((p) => p.slug === SPEAKER_SLUG)?.price_idr ?? 0),
    certificationPrice: Number((programs ?? []).find((p) => p.slug === CERTIFICATION_SLUG)?.price_idr ?? 0),
    bothProgramsHaveOpenBatch: hasOpen(SPEAKER_SLUG) && hasOpen(CERTIFICATION_SLUG),
    media,
    nowMs,
  };
}

export default async function ProgramSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === INHOUSE_SLUG) {
    redirect(`/admin/program/${INHOUSE_SLUG}/edit`);
  }
  if (![SERIES_SLUG, SPEAKER_SLUG, CERTIFICATION_SLUG].includes(slug)) {
    return notFound();
  }

  const board = await loadProgramBoard(slug);
  if (!board) return notFound();

  return <ProgramDetailBoard {...board} />;
}
