export type BentoMedia = { id: number; kind: "image" | "video" };
export type BentoTile<T extends BentoMedia> = { media: T; className: string };

function orderMedia<T extends BentoMedia>(media: T[]): T[] {
  const images = media.filter((item) => item.kind === "image");
  const videos = media.filter((item) => item.kind === "video");
  if (videos.length === 0) return [...images];
  if (images.length === 0) return [...videos];
  return [images[0], videos[0], ...images.slice(1), ...videos.slice(1)];
}

/** Urutkan (video ke petak ke-2) dan kembalikan seluruh media sebagai 1 petak seragam. */
export function bentoLayout<T extends BentoMedia>(
  media: T[],
): { tiles: BentoTile<T>[]; ordered: T[]; rest: number } {
  if (media.length === 0) return { tiles: [], ordered: [], rest: 0 };

  const ordered = orderMedia(media);
  const tiles = ordered.map((item) => ({
    media: item,
    className: "aspect-[4/3]",
  }));

  return {
    tiles,
    ordered,
    rest: 0,
  };
}

/**
 * Mosaik bab Dokumentasi. Pola 10 petak di grid 4 kolom (desktop) dan 2 kolom (ponsel)
 * dengan `grid-flow-dense`; prefiks 4 dan 8 juga menutup persegi tanpa lubang.
 */
const MOSAIC = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-2 row-span-1",
] as const;
const MOSAIC_SIZES = [10, 8, 4] as const;

export function mosaicLayout<T extends BentoMedia>(
  media: T[],
): { tiles: BentoTile<T>[]; ordered: T[]; rest: number } {
  const ordered = orderMedia(media);
  const count = MOSAIC_SIZES.find((size) => size <= ordered.length) ?? 0;
  if (count === 0) return bentoLayout(media);
  const tiles = ordered.slice(0, count).map((item, index) => ({ media: item, className: MOSAIC[index] }));
  return { tiles, ordered, rest: ordered.length - count };
}
