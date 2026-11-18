import "server-only";
import type { HomeData, HomeMedia, HomeProgram } from "@/lib/home-data";
import { buildMoments, nextBatchOf, pickHeroPhoto, toHomeMedia } from "@/lib/home-derive";
import { academyRequest } from "./academy-api";
import { readInhouseGallery, readLegality, readPartners, readTestimonials } from "./home-sources";
import { type ProgramGallery, readProgramGalleries } from "./program-galleries";
import { type ProgramCard, readProgramShowcase } from "./program-showcase";
import { contactHref, readPublishedContacts } from "./public-contacts";

const PUBLIC_SLUGS = [
  "public-speaking-series",
  "public-speaking-for-speakers",
  "sertifikasi-pembicara-profesional",
] as const;

type BundleRow = {
  speaker_program_slug?: string | null;
  certification_program_slug?: string | null;
};

async function readBundleNotes(): Promise<Map<string, string>> {
  const notes = new Map<string, string>();
  try {
    const rows = await academyRequest(
      "bundle_offers?select=speaker_program_slug,certification_program_slug&active=eq.true&placement_scope=eq.program",
    );
    if (!Array.isArray(rows)) return notes;
    for (const row of rows as BundleRow[]) {
      if (typeof row.speaker_program_slug === "string" && row.speaker_program_slug.trim()) {
        notes.set(row.speaker_program_slug.trim(), "Tersedia paket dengan Sertifikasi");
      }
      if (typeof row.certification_program_slug === "string" && row.certification_program_slug.trim()) {
        notes.set(row.certification_program_slug.trim(), "Tersedia paket dengan Speaker");
      }
    }
    return notes;
  } catch {
    return notes;
  }
}

async function readWhatsappHref(): Promise<string | null> {
  try {
    const contacts = await readPublishedContacts();
    const wa = contacts.find((row) => row.kind === "whatsapp");
    return wa ? contactHref(wa) ?? null : null;
  } catch {
    return null;
  }
}

function galleryToHomeMedia(gallery?: ProgramGallery): HomeMedia[] {
  if (!gallery) return [];
  return [...gallery.images, ...gallery.videos].map(toHomeMedia);
}

export async function readHomeData(): Promise<HomeData> {
  const [
    showcase,
    galleries,
    bundleNotes,
    whatsappHref,
    inhouseGallery,
    partners,
    testimonials,
    legality,
  ] = await Promise.all([
    readProgramShowcase(),
    readProgramGalleries(),
    readBundleNotes(),
    readWhatsappHref(),
    readInhouseGallery(),
    readPartners(),
    readTestimonials(),
    readLegality(),
  ]);

  const cards: ProgramCard[] = showcase.status === "ready" ? showcase.cards : [];
  const cardBySlug = new Map(cards.map((card) => [card.slug, card]));

  const publicPrograms: HomeProgram[] = [];
  if (showcase.status === "ready") {
    for (const slug of PUBLIC_SLUGS) {
      const card = cardBySlug.get(slug);
      if (!card) continue;
      const bundleNote = bundleNotes.get(slug);
      publicPrograms.push({
        card,
        media: galleryToHomeMedia(galleries[slug]),
        ...(bundleNote ? { bundleNote } : {}),
      });
    }
  }

  const publicCards = publicPrograms.map((item) => item.card);
  const inhouseMedia = [...inhouseGallery, ...galleryToHomeMedia(galleries["inhouse-training"])];
  const heroPhoto = pickHeroPhoto(publicPrograms, inhouseMedia);
  const moments = buildMoments(publicPrograms, inhouseMedia, heroPhoto ? [heroPhoto.id] : []);

  return {
    hero: {
      photo: heroPhoto,
      openPrograms: publicCards.filter((card) => card.registrationUrl !== null).length,
      nextBatch: nextBatchOf(publicCards),
    },
    programs: showcase.status === "failed" ? "failed" : publicPrograms,
    inhouse: {
      card: cardBySlug.get("inhouse-training") ?? null,
      whatsappHref,
      media: inhouseMedia,
      partners,
    },
    testimonials,
    moments,
    legality,
  };
}
