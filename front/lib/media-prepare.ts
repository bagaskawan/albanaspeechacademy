import sharp from "sharp";

export const MAX_IMAGE_SOURCE = 10 * 1024 * 1024;
export const MAX_IMAGE_OUTPUT = 5 * 1024 * 1024;
export const MAX_VIDEO_SOURCE = 25 * 1024 * 1024;

export async function prepareImage(bytes: Buffer, minWidth: number, minHeight: number): Promise<Buffer> {
  if (!bytes.length || bytes.length > MAX_IMAGE_SOURCE) throw new Error("Gambar harus berukuran maksimal 10 MiB.");
  let metadata;
  try { metadata = await sharp(bytes, { failOn: "error", limitInputPixels: 100_000_000 }).metadata(); }
  catch { throw new Error("Berkas gambar rusak atau formatnya tidak didukung."); }
  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
    throw new Error("Gunakan gambar JPEG, PNG, atau WebP statis.");
  }
  const swapped = metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8;
  const width = swapped ? metadata.height : metadata.width;
  const height = swapped ? metadata.width : metadata.height;
  if (!width || !height || width < minWidth || height < minHeight) {
    throw new Error(`Resolusi gambar minimal ${minWidth}×${minHeight} piksel.`);
  }
  for (const quality of [90, 84, 78, 72]) {
    const output = await sharp(bytes).rotate().webp({ quality, effort: 4 }).toBuffer();
    if (output.length <= MAX_IMAGE_OUTPUT) return output;
  }
  throw new Error("Gambar belum bisa dipadatkan ke 5 MiB tanpa menurunkan kualitas terlalu jauh. Pilih sumber yang lebih ringan.");
}

export function readMp4Resolution(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 16 || bytes.toString("ascii", 4, 8) !== "ftyp") return null;
  let largest: { width: number; height: number } | null = null;
  const walk = (start: number, end: number, depth: number): boolean => {
    if (depth > 4) return false;
    for (let pos = start; pos + 8 <= end;) {
      let size = bytes.readUInt32BE(pos);
      const type = bytes.toString("ascii", pos + 4, pos + 8);
      let header = 8;
      if (size === 1) {
        if (pos + 16 > end) return false;
        const extended = bytes.readBigUInt64BE(pos + 8);
        if (extended > BigInt(Number.MAX_SAFE_INTEGER)) return false;
        size = Number(extended);
        header = 16;
      } else if (size === 0) size = end - pos;
      if (size < header || pos + size > end) return false;
      if (type === "moov" || type === "trak") {
        if (!walk(pos + header, pos + size, depth + 1)) return false;
      } else if (type === "tkhd" && size >= header + 8) {
        const width = bytes.readUInt32BE(pos + size - 8) / 65536;
        const height = bytes.readUInt32BE(pos + size - 4) / 65536;
        if (Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0 &&
          (!largest || width * height > largest.width * largest.height)) largest = { width, height };
      }
      pos += size;
    }
    return true;
  };
  return walk(0, bytes.length, 0) ? largest : null;
}
