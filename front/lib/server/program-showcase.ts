import { formatSessionDate, formatTimeRange } from "@/lib/format";
import { isAcceptingBatch } from "@/lib/registration";
import { readPrograms } from "./catalog";
import { academyRequest } from "./academy-api";
import { readAddressLabel } from "./public-contacts";
import { youtubeVideoId } from "@/lib/youtube";

export type ProgramBatchSummary = {
  name: string;
  dateLabels: string[];
  timeLabel: string;
  formatLabel: string;
  scheduleMode?: "per_session" | "start_only";
  venueLabel: string;
  priceIdr: number | null;
  normalPriceIdr: number | null;
  dpPercent: number | null;
};

export type ProgramCard = {
  slug: string;
  title: string;
  summary: string;
  topics: string[];
  statusLabel: string;
  registrationUrl: string | null;
  batch: ProgramBatchSummary | null;
};

export type ProgramShowcase =
  | { status: "ready"; cards: ProgramCard[] }
  | { status: "failed" };

export type ProgramDetail =
  | { status: "ready"; card: ProgramCard; media: { id: number; kind: "image" | "video"; src: string; alt: string; youtubeId: string | null }[] }
  | { status: "missing" }
  | { status: "failed" };

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function asObjectArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    : [];
}

// The active batch is the one shown publicly; fall back to the batch that is
// accepting registrations when the active flag is absent.
function pickBatch(batches: Record<string, unknown>[]): Record<string, unknown> | null {
  return batches.find((batch) => batch.is_active === true) ?? batches.find(isAcceptingBatch) ?? batches[0] ?? null;
}

function statusLabel(batch: Record<string, unknown>): string {
  return isAcceptingBatch(batch) ? "Pendaftaran dibuka" : "Pendaftaran ditutup";
}

function readSessions(batch: Record<string, unknown>) {
  return asObjectArray(batch.sessions)
    .map((session, index) => ({
      sequence: typeof session.sequence_no === "number" ? session.sequence_no : index + 1,
      startsAt: asString(session.starts_at),
      endsAt: asString(session.ends_at),
      startOnly: session.start_only === true,
      sessionCount: typeof session.session_count === "number" && session.session_count >= 1 ? session.session_count : null,
    }))
    .filter(
      (session): session is { sequence: number; startsAt: string; endsAt: string; startOnly: boolean; sessionCount: number | null } =>
        session.startsAt !== null && session.endsAt !== null,
    )
    .sort((a, b) => a.sequence - b.sequence);
}

function readTopics(materials: unknown): string[] {
  return Array.isArray(materials)
    ? materials.filter((topic): topic is string => typeof topic === "string" && topic.trim() !== "")
    : [];
}

// Biaya dan DP milik Program; batch hanya menyumbang nama dan jadwal, dan
// alamat pelaksanaan datang dari menu Kontak.
function readBatchSummary(
  program: Record<string, unknown>,
  batch: Record<string, unknown>,
  address: string,
): ProgramBatchSummary | null {
  const sessions = readSessions(batch);
  if (sessions.length === 0) return null;
  const priceIdr = Number(program.price_idr);
  const normalPriceIdr = Number(program.original_price_idr);
  const dpPercent = Number(program.dp_percent);
  const isStartOnly = sessions[0]?.startOnly === true;
  const totalSessions = isStartOnly ? (sessions[0].sessionCount ?? 4) : sessions.length;
  return {
    name: asString(batch.title) ?? "Batch",
    dateLabels: isStartOnly
      ? [`Mulai ${formatSessionDate(sessions[0].startsAt)}`]
      : sessions.map((session) => formatSessionDate(session.startsAt)),
    timeLabel: formatTimeRange(sessions[0].startsAt, sessions[0].endsAt),
    formatLabel: `${totalSessions} pertemuan`,
    scheduleMode: isStartOnly ? "start_only" : "per_session",
    venueLabel: address,
    priceIdr: Number.isSafeInteger(priceIdr) && priceIdr > 0 ? priceIdr : null,
    normalPriceIdr: Number.isSafeInteger(normalPriceIdr) && normalPriceIdr > priceIdr ? normalPriceIdr : null,
    dpPercent: Number.isInteger(dpPercent) && dpPercent > 0 ? dpPercent : null,
  };
}

function toCard(program: Record<string, unknown>, address: string): ProgramCard | null {
  const slug = asString(program.slug);
  const title = asString(program.title);
  const summary = asString(program.description);
  if (!slug || !title || !summary) return null;

  const batch = pickBatch(asObjectArray(program.batches));
  const batchSummary = batch ? readBatchSummary(program, batch, address) : null;

  let statusText = "Jadwal menyusul";
  if (slug === "inhouse-training") statusText = "Konsultasi privat dengan tim Albana";
  let registrationUrl: string | null = null;
  if (batch && batchSummary) {
    statusText = statusLabel(batch);
    if (isAcceptingBatch(batch)) {
      registrationUrl = `/register/${encodeURIComponent(slug)}`;
    }
  }

  return {
    slug,
    title,
    summary,
    topics: readTopics(program.materials),
    statusLabel: statusText,
    registrationUrl,
    batch: batchSummary,
  };
}

export async function readProgramShowcase(): Promise<ProgramShowcase> {
  try {
    const [programs, address] = await Promise.all([readPrograms(), readAddressLabel()]);
    const cards = asObjectArray(programs)
      .map((program) => toCard(program, address))
      .filter((card): card is ProgramCard => card !== null);
    return { status: "ready", cards };
  } catch {
    return { status: "failed" };
  }
}

export async function readProgramDetail(slug: string): Promise<ProgramDetail> {
  const showcase = await readProgramShowcase();
  if (showcase.status === "failed") return showcase;

  const card = showcase.cards.find((program) => program.slug === slug);
  if (!card) return { status: "missing" };
  try {
    const rows = await academyRequest(`media_assets?select=id,provider,kind,object_key,alt_text&program_slug=eq.${encodeURIComponent(slug)}&published=eq.true&order=created_at.desc`);
    const media = asObjectArray(rows).flatMap((item) => {
      const id = Number(item.id);
      const kind = item.kind === "image" || item.kind === "video" ? item.kind : null;
      const provider = item.provider;
      const youtubeId = provider === "youtube" && typeof item.object_key === "string" ? youtubeVideoId(item.object_key) : null;
      const src = provider === "supabase_storage" ? `/api/media/${id}` : youtubeId ? `https://www.youtube-nocookie.com/embed/${youtubeId}` : null;
      return Number.isSafeInteger(id) && id > 0 && kind && src ? [{ id, kind: kind as "image" | "video", src, alt: asString(item.alt_text) ?? card.title, youtubeId }] : [];
    });
    return { status: "ready", card, media };
  } catch { return { status: "ready", card, media: [] }; }
}
