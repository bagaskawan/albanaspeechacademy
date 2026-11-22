import sharp from "sharp";

export const MAX_IMAGE_SOURCE = 10 * 1024 * 1024;
export const MAX_IMAGE_OUTPUT = 5 * 1024 * 1024;
export const MAX_VIDEO_SOURCE = 25 * 1024 * 1024;
export const MAX_ARTICLE_IMAGE_PIXELS = 40_000_000;

export type ArticleImageProfile = "thumbnail" | "inline";

export type PreparedArticleImage = {
  bytes: Buffer;
  contentType: "image/webp";
  width: number;
  height: number;
};

const ARTICLE_IMAGE_LIMITS: Record<
  ArticleImageProfile,
  { maxWidth: number; maxHeight: number; softBytes: number; hardBytes: number }
> = {
  thumbnail: { maxWidth: 480, maxHeight: 360, softBytes: 120 * 1024, hardBytes: 240 * 1024 },
  inline: { maxWidth: 1600, maxHeight: 2400, softBytes: 500 * 1024, hardBytes: 900 * 1024 },
};

export async function prepareArticleImage(
  bytes: Buffer,
  profile: ArticleImageProfile,
): Promise<PreparedArticleImage> {
  if (!bytes.length || bytes.length > MAX_IMAGE_SOURCE) {
    throw new Error("Ukuran gambar melebihi 10 MB. Pilih file lain.");
  }

  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(bytes, { failOn: "error", limitInputPixels: MAX_ARTICLE_IMAGE_PIXELS }).metadata();
  } catch {
    throw new Error("Berkas gambar rusak, terlalu besar (maks. 40 MP), atau formatnya tidak didukung.");
  }

  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
    throw new Error("Gunakan gambar JPEG, PNG, atau WebP statis.");
  }

  const swapped = Boolean(metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8);
  const srcWidth = swapped ? metadata.height : metadata.width;
  const srcHeight = swapped ? metadata.width : metadata.height;
  if (!srcWidth || !srcHeight) {
    throw new Error("Dimensi gambar tidak dapat dibaca.");
  }
  if (srcWidth * srcHeight > MAX_ARTICLE_IMAGE_PIXELS) {
    throw new Error("Resolusi gambar melebihi 40 megapiksel. Pilih file lain.");
  }

  const spec = ARTICLE_IMAGE_LIMITS[profile];
  let targetWidth = spec.maxWidth;
  let targetHeight = spec.maxHeight;
  if (profile === "thumbnail" && (srcWidth < spec.maxWidth || srcHeight < spec.maxHeight)) {
    const scale = Math.min(srcWidth / 4, srcHeight / 3);
    targetWidth = Math.max(1, Math.floor(scale * 4));
    targetHeight = Math.max(1, Math.floor(scale * 3));
  }

  let lastResult: { data: Buffer; info: sharp.OutputInfo } | null = null;
  for (const quality of [85, 82, 78]) {
    let pipeline = sharp(bytes, { failOn: "error", limitInputPixels: MAX_ARTICLE_IMAGE_PIXELS })
      .rotate()
      .toColorspace("srgb");

    if (profile === "thumbnail") {
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      });
    } else {
      pipeline = pipeline.resize(spec.maxWidth, spec.maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const result = await pipeline.webp({ quality, effort: 4 }).toBuffer({ resolveWithObject: true });
    lastResult = result;
    if (result.data.length <= spec.softBytes) {
      return {
        bytes: result.data,
        contentType: "image/webp",
        width: result.info.width,
        height: result.info.height,
      };
    }
  }

  if (lastResult && lastResult.data.length <= spec.hardBytes) {
    return {
      bytes: lastResult.data,
      contentType: "image/webp",
      width: lastResult.info.width,
      height: lastResult.info.height,
    };
  }

  throw new Error("Ukuran gambar masih terlalu besar setelah dioptimalkan. Pilih file gambar lain.");
}

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
  if (!width || !height) {
    throw new Error("Dimensi gambar tidak dapat dibaca.");
  }
  if ((minWidth > 0 && width < minWidth) || (minHeight > 0 && height < minHeight)) {
    throw new Error(`Resolusi gambar minimal ${minWidth}×${minHeight} piksel.`);
  }
  for (const quality of [90, 84, 78, 72]) {
    const output = await sharp(bytes).rotate().webp({ quality, effort: 4 }).toBuffer();
    if (output.length <= MAX_IMAGE_OUTPUT) return output;
  }
  throw new Error("Gambar belum bisa dipadatkan ke 5 MiB tanpa menurunkan kualitas terlalu jauh. Pilih sumber yang lebih ringan.");
}

/** Buat pratinjau blur selebar ~10 px dalam format data URI WebP dari gambar yang sama. */
export async function createBlurDataUrl(bytes: Buffer): Promise<string> {
  const preview = await sharp(bytes)
    .rotate()
    .resize(10, undefined, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${preview.toString("base64")}`;
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
