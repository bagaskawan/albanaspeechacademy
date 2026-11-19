export const MAX_PROGRAM_PHOTOS = 20;
export const MIN_PROGRAM_PHOTOS = 10;
export const MAX_PROGRAM_VIDEOS = 2;
export const MIN_PROGRAM_VIDEOS = 1;

const PROGRAM_BUCKETS = new Set([
  "public-speaking-series",
  "public-speaking-for-speakers",
  "sertifikasi-pembicara-profesional",
]);

export function programBucket(programSlug?: string | null): string {
  if (programSlug && PROGRAM_BUCKETS.has(programSlug)) return programSlug;
  return "academy-media";
}

export type ProgramMediaItem = {
  id: number;
  kind: "image" | "video";
  provider: "supabase_storage" | "youtube";
  src: string;
  alt: string;
  youtubeId: string | null;
  blurDataURL?: string | null;
};

export function mediaCapacity(items: readonly { kind: string }[]) {
  let photos = 0;
  let videos = 0;
  for (const item of items) {
    if (item.kind === "image") photos += 1;
    else if (item.kind === "video") videos += 1;
  }
  const photoSlotsLeft = Math.max(0, MAX_PROGRAM_PHOTOS - photos);
  const videoSlotsLeft = Math.max(0, MAX_PROGRAM_VIDEOS - videos);
  return {
    photos,
    videos,
    photoSlotsLeft,
    videoSlotsLeft,
    photoFull: photos >= MAX_PROGRAM_PHOTOS,
    videoFull: videos >= MAX_PROGRAM_VIDEOS,
    photosBelowMin: photos < MIN_PROGRAM_PHOTOS,
    videosBelowMin: videos < MIN_PROGRAM_VIDEOS,
  };
}

export function photoLimitError(current: number, adding: number): string | null {
  if (adding <= 0) return null;
  if (current + adding <= MAX_PROGRAM_PHOTOS) return null;
  const left = Math.max(0, MAX_PROGRAM_PHOTOS - current);
  if (left === 0) return `Maksimal ${MAX_PROGRAM_PHOTOS} foto per program sudah penuh.`;
  return `Maksimal ${MAX_PROGRAM_PHOTOS} foto per program; sisa ${left} slot.`;
}

export function videoLimitError(current: number): string | null {
  if (current < MAX_PROGRAM_VIDEOS) return null;
  return `Maksimal ${MAX_PROGRAM_VIDEOS} tautan YouTube per program.`;
}
