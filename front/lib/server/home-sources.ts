import "server-only";
import type { HomeLegality, HomeMedia, HomePartner, HomeTestimonial } from "@/lib/home-data";
import { academyRequest } from "./academy-api";

const EMPTY_LEGALITY: HomeLegality = {
  akta: null,
  nib: null,
  skt: null,
  npwpFront: null,
  npwpBack: null,
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

async function readGalleryTable(
  table: "gallery" | "inhouse_gallery",
  idOffset: number,
  fallbackAlt: string,
): Promise<HomeMedia[]> {
  try {
    const rows = await academyRequest(
      `${table}?select=id,image_url,title&consent_verified_at=not.is.null&order=id.desc`,
    );
    if (!Array.isArray(rows)) return [];
    const items: HomeMedia[] = [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const id = Number(r.id);
      const src = asString(r.image_url);
      if (!Number.isSafeInteger(id) || id <= 0 || !src) continue;
      items.push({
        id: idOffset + id,
        kind: "image",
        src,
        poster: null,
        alt: asString(r.title) ?? fallbackAlt,
      });
    }
    return items;
  } catch {
    return [];
  }
}

export function readInhouseGallery(): Promise<HomeMedia[]> {
  return readGalleryTable("inhouse_gallery", 100000, "Dokumentasi Inhouse Training");
}

export function readContentGallery(): Promise<HomeMedia[]> {
  return readGalleryTable("gallery", 200000, "Dokumentasi Albana Speech Academy");
}

export async function readPartners(): Promise<HomePartner[]> {
  try {
    const rows = await academyRequest(
      "academy_partners?select=id,name,logo_url&published=eq.true&order=sort_order,id",
    );
    if (!Array.isArray(rows)) return [];
    const items: HomePartner[] = [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const id = Number(r.id);
      const name = asString(r.name) ?? "";
      const logoUrl = asString(r.logo_url);
      if (!Number.isSafeInteger(id) || id <= 0 || (!name && !logoUrl)) continue;
      items.push({
        id,
        name,
        logoUrl,
      });
    }
    items.sort((a, b) => Number(Boolean(b.logoUrl)) - Number(Boolean(a.logoUrl)));
    return items;
  } catch {
    return [];
  }
}

export async function readTestimonials(): Promise<HomeTestimonial[]> {
  try {
    const rows = await academyRequest(
      "testimonials?select=id,attribution,quote,role_label,photo_url&published=eq.true&consent_at=not.is.null&order=id.desc&limit=12",
    );
    if (!Array.isArray(rows)) return [];
    const items: HomeTestimonial[] = [];
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const id = Number(r.id);
      const attribution = asString(r.attribution);
      const quote = asString(r.quote);
      if (!Number.isSafeInteger(id) || id <= 0 || !attribution || !quote) continue;
      items.push({
        id,
        attribution,
        quote,
        roleLabel: asString(r.role_label),
        photoUrl: asString(r.photo_url),
      });
    }
    return items;
  } catch {
    return [];
  }
}

export async function readLegality(): Promise<HomeLegality> {
  try {
    const rows = await academyRequest("academy?select=legality&id=eq.1&limit=1");
    if (!Array.isArray(rows) || rows.length === 0) return EMPTY_LEGALITY;
    const raw = (rows[0] as Record<string, unknown> | undefined)?.legality;
    if (!raw || typeof raw !== "object") return EMPTY_LEGALITY;
    const legality = raw as Record<string, unknown>;
    return {
      akta: asString(legality.akta_url),
      nib: asString(legality.nib_url),
      skt: asString(legality.skt_url),
      npwpFront: asString(legality.npwp_front_url),
      npwpBack: asString(legality.npwp_back_url),
    };
  } catch {
    return EMPTY_LEGALITY;
  }
}
