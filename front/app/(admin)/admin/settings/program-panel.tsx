import { requireAdminMember } from "@/lib/server/admin-guard";
import { academyBillingClient } from "@/lib/server/academy-billing";
import { CERTIFICATION_SLUG, INHOUSE_SLUG, SERIES_SLUG, SPEAKER_SLUG } from "@/lib/bundle";
import type { ProgramMediaItem } from "@/lib/program-media";
import { youtubeVideoId } from "@/lib/youtube";
import {
  InhouseTrainingSettingsClient,
  PublicTrainingSettingsClient,
  type SettingsProgramRow,
} from "./ProgramSettingsClient";

const PUBLIC_ORDER = [SERIES_SLUG, SPEAKER_SLUG, CERTIFICATION_SLUG] as const;

export async function PublicTrainingProgramPanel() {
  const supabase = await requireAdminMember();
  const { data, error } = await supabase
    .from("programs")
    .select("slug, title, description, price_idr, original_price_idr, dp_percent, fee_details, materials")
    .in("slug", [...PUBLIC_ORDER]);

  if (error) throw new Error("Gagal memuat program Public Training: " + error.message);

  const rows = (data ?? []) as SettingsProgramRow[];
  const ordered = PUBLIC_ORDER
    .map((slug) => rows.find((r) => r.slug === slug))
    .filter((r): r is SettingsProgramRow => Boolean(r));

  return <PublicTrainingSettingsClient programs={ordered} />;
}

export async function InhouseTrainingProgramPanel() {
  const supabase = await requireAdminMember();
  const [{ data: program, error }, { data: rawMedia }] = await Promise.all([
    supabase
      .from("programs")
      .select("slug, title, description, price_idr, original_price_idr, dp_percent, fee_details, materials")
      .eq("slug", INHOUSE_SLUG)
      .maybeSingle(),
    academyBillingClient()
      .from("media_assets")
      .select("id, provider, kind, object_key, alt_text")
      .eq("program_slug", INHOUSE_SLUG)
      .order("created_at", { ascending: true }),
  ]);

  if (error) throw new Error("Gagal memuat program In House Training: " + error.message);

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
          alt: row.alt_text || "Video In House Training",
          youtubeId: videoId,
        };
      }
      if (row.provider === "supabase_storage") {
        return {
          id: row.id,
          kind: row.kind === "video" ? "video" : "image",
          provider: "supabase_storage",
          src: `/api/media/${row.id}`,
          alt: row.alt_text || program?.title || INHOUSE_SLUG,
          youtubeId: null,
        };
      }
      return null;
    })
    .filter((item): item is ProgramMediaItem => item !== null);

  return <InhouseTrainingSettingsClient program={(program as SettingsProgramRow | null) ?? null} media={media} />;
}
