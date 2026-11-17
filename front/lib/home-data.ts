import type { ProgramCard } from "@/lib/server/program-showcase";

export type HomeMedia = {
  id: number;
  kind: "image" | "video";
  src: string;
  poster: string | null;
  alt: string;
};

export type HomeProgram = {
  card: ProgramCard;
  media: HomeMedia[];
  bundleNote?: string;
};

export type HomePartner = {
  id: number;
  name: string;
  logoUrl: string | null;
};

export type HomeTestimonial = {
  id: number;
  quote: string;
  attribution: string;
  roleLabel: string | null;
};

export type HomeData = {
  preview: boolean;
  hero: {
    photo: HomeMedia | null;
    openPrograms: number;
    nextBatch: {
      programTitle: string;
      batchName: string;
      firstDateLabel: string;
      formatLabel: string;
      statusLabel: string;
    } | null;
  };
  programs: HomeProgram[] | "failed";
  inhouse: {
    card: ProgramCard | null;
    whatsappHref: string | null;
    media: HomeMedia[];
    partners: HomePartner[];
  };
  testimonials: HomeTestimonial[];
  moments: HomeMedia[];
};
