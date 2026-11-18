/**
 * Utility untuk membersihkan (delete/replace) file di Supabase Storage
 * secara otomatis guna mencegah penumpukan orphan files (storage bloat).
 */

export interface ParsedStorageTarget {
  bucket: string;
  path: string;
}

const KNOWN_BUCKETS = [
  "member-assets",
  "member-avatars",
  "portfolio-images",
  "portfolio-thumbnails",
  "gallery",
  "testimonials",
  "legality",
  "academy-media",
  "public-speaking-series",
  "public-speaking-for-speakers",
  "sertifikasi-pembicara-profesional",
  "payment-proofs",
  "venues",
  "partners",
  "resources",
];

/**
 * Mengurai URL publik Supabase Storage menjadi nama bucket dan path file.
 * Mengabaikan URL eksternal (YouTube, link luar, dsb) secara aman.
 */
export function parseStorageUrl(url?: string | null): ParsedStorageTarget | null {
  if (!url || typeof url !== "string") return null;

  // Bersihkan query string (?t=123...) dan whitespace
  const cleanUrl = url.split("?")[0].trim();
  if (!cleanUrl) return null;

  // 1. Pola standar Supabase: /storage/v1/object/(public|sign)/{bucket}/{...path}
  const standardPattern = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/;
  const match = cleanUrl.match(standardPattern);
  if (match && match[1] && match[2]) {
    return {
      bucket: match[1],
      path: decodeURIComponent(match[2]),
    };
  }

  // 2. Pola fallback berdasarkan nama bucket yang terdaftar
  for (const bucket of KNOWN_BUCKETS) {
    const marker = `/${bucket}/`;
    if (cleanUrl.includes(marker)) {
      const parts = cleanUrl.split(marker);
      const filePath = parts[parts.length - 1];
      if (filePath) {
        return {
          bucket,
          path: decodeURIComponent(filePath),
        };
      }
    }
  }

  return null;
}

export interface StorageClientLike {
  storage: {
    from(bucket: string): {
      remove(paths: string[]): Promise<{ data: unknown; error: unknown }>;
    };
  };
}

/**
 * Menghapus satu atau banyak file dari Supabase Storage berdasarkan URL publiknya.
 * Mengelompokkan penghapusan per bucket dan mengeksekusi secara batch.
 */
export async function deleteStorageFiles(
  supabase: StorageClientLike,
  urls: (string | null | undefined)[]
): Promise<{ deleted: string[]; errors: unknown[] }> {
  if (!supabase || !urls || urls.length === 0) {
    return { deleted: [], errors: [] };
  }

  const bucketMap: Record<string, Set<string>> = {};

  for (const url of urls) {
    if (!url) continue;

    // Mendukung string tunggal maupun gabungan (comma-separated URLs)
    const subUrls = url.split(",").map((u) => u.trim());
    for (const subUrl of subUrls) {
      const parsed = parseStorageUrl(subUrl);
      if (parsed) {
        if (!bucketMap[parsed.bucket]) {
          bucketMap[parsed.bucket] = new Set();
        }
        bucketMap[parsed.bucket].add(parsed.path);
      }
    }
  }

  const deleted: string[] = [];
  const errors: unknown[] = [];

  for (const [bucket, pathSet] of Object.entries(bucketMap)) {
    const paths = Array.from(pathSet);
    if (paths.length === 0) continue;

    try {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        console.warn(`[Storage Cleanup] Gagal menghapus dari bucket "${bucket}":`, error);
        errors.push(error);
      } else {
        deleted.push(...paths);
      }
    } catch (err) {
      console.warn(`[Storage Cleanup] Exception saat menghapus dari "${bucket}":`, err);
      errors.push(err);
    }
  }

  return { deleted, errors };
}

/**
 * Helper ringkas untuk menghapus satu file saja
 */
export async function deleteStorageFile(
  supabase: StorageClientLike,
  url?: string | null
): Promise<boolean> {
  if (!url) return false;
  const res = await deleteStorageFiles(supabase, [url]);
  return res.deleted.length > 0;
}

function normalizeUrlForCompare(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.split("?")[0].trim();
  return trimmed || null;
}

/**
 * Membandingkan daftar URL lama dengan daftar URL baru (mendukung single maupun multiple),
 * dan mengembalikan URL lama yang tidak lagi dipakai untuk dihapus dari storage.
 */
export function getRemovedStorageUrls(
  oldUrls: (string | null | undefined)[],
  newUrls: (string | null | undefined)[]
): string[] {
  const nextSet = new Set<string>();
  for (const url of newUrls) {
    const norm = normalizeUrlForCompare(url);
    if (norm) nextSet.add(norm);
  }

  const removed: string[] = [];
  const seen = new Set<string>();
  for (const url of oldUrls) {
    const norm = normalizeUrlForCompare(url);
    if (norm && !nextSet.has(norm) && !seen.has(norm)) {
      seen.add(norm);
      removed.push(url as string);
    }
  }
  return removed;
}
