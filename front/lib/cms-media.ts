const formats = [
  { mime: "image/jpeg", extension: "jpg", max: 5_242_880, matches: (b: Uint8Array) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", extension: "png", max: 5_242_880, matches: (b: Uint8Array) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/webp", extension: "webp", max: 5_242_880, matches: (b: Uint8Array) => String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP" },
  { mime: "video/mp4", extension: "mp4", max: 26_214_400, matches: (b: Uint8Array) => String.fromCharCode(...b.slice(4, 8)) === "ftyp" },
  { mime: "video/webm", extension: "webm", max: 26_214_400, matches: (b: Uint8Array) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
] as const;

export function detectCmsMedia(bytes: Uint8Array, mime: string) {
  return formats.find((format) => format.mime === mime && bytes.length > 0 && bytes.length <= format.max && format.matches(bytes)) ?? null;
}
