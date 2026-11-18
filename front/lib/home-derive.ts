import type { HomeData, HomeMedia, HomeProgram } from "./home-data";
import type { ProgramMediaItem } from "./program-media";
import type { ProgramCard } from "./server/program-showcase";

const MONTHS_ID: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

function parseIndonesianDate(label: string): number {
  const match = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(label);
  if (!match) return Number.POSITIVE_INFINITY;
  const day = Number(match[1]);
  const month = MONTHS_ID[match[2].toLowerCase()];
  const year = Number(match[3]);
  if (!Number.isFinite(day) || month === undefined || !Number.isFinite(year)) {
    return Number.POSITIVE_INFINITY;
  }
  return Date.UTC(year, month, day);
}

export function toHomeMedia(item: ProgramMediaItem): HomeMedia {
  return {
    id: item.id,
    kind: item.kind,
    src: item.src,
    poster: item.kind === "video" && item.youtubeId
      ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`
      : null,
    alt: item.alt,
  };
}

export function pickHeroPhoto(programs: HomeProgram[], inhouse: HomeMedia[]): HomeMedia | null {
  for (const program of programs) {
    const first = program.media.find((item) => item.kind === "image");
    if (first) return first;
  }
  return inhouse.find((item) => item.kind === "image") ?? null;
}

export function buildMoments(
  programs: HomeProgram[],
  inhouse: HomeMedia[],
  exclude: number[],
): HomeMedia[] {
  const excluded = new Set(exclude);
  const seenSrc = new Set<string>();
  const buckets: HomeMedia[][] = [
    ...programs.map((program) => program.media.filter((item) => item.kind === "image")),
    inhouse.filter((item) => item.kind === "image"),
  ];

  const result: HomeMedia[] = [];
  let index = 0;
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const bucket of buckets) {
      if (index >= bucket.length) continue;
      remaining = true;
      const item = bucket[index];
      if (!excluded.has(item.id) && item.src && !seenSrc.has(item.src)) {
        seenSrc.add(item.src);
        result.push(item);
      }
    }
    index += 1;
  }
  return result;
}

export function nextBatchOf(cards: ProgramCard[]): HomeData["hero"]["nextBatch"] {
  let best: { card: ProgramCard; firstDate: string; timestamp: number } | null = null;
  for (const card of cards) {
    if (!card.registrationUrl || !card.batch) continue;
    const firstDate = card.batch.dateLabels[0];
    if (!firstDate) continue;
    const timestamp = parseIndonesianDate(firstDate);
    if (!best || timestamp < best.timestamp) {
      best = { card, firstDate, timestamp };
    }
  }
  if (!best || !best.card.batch) return null;
  return {
    programTitle: best.card.title,
    batchName: best.card.batch.name,
    firstDateLabel: best.firstDate,
    formatLabel: best.card.batch.formatLabel,
    statusLabel: best.card.statusLabel,
  };
}
