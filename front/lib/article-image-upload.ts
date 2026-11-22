export type UploadedArticleImage = {
  id: string;
  url: string;
  width: number;
  height: number;
};

export async function uploadArticleImage(
  file: File,
  profile: "thumbnail" | "inline",
  signal?: AbortSignal,
): Promise<UploadedArticleImage> {
  const form = new FormData();
  form.set("purpose", "article");
  form.set("profile", profile);
  form.set("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
    signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | { id?: string; url?: string; width?: number; height?: number; error?: string }
    | null;

  if (!response.ok || !payload?.id || !payload?.url) {
    throw new Error(payload?.error || "Gambar gagal diunggah. Coba lagi.");
  }

  return {
    id: payload.id,
    url: payload.url,
    width: payload.width ?? 0,
    height: payload.height ?? 0,
  };
}
