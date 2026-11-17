import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { HomeData } from "@/lib/home-data";
import { BentoGallery } from "./bento-gallery";

export function InhouseTrainingSection({ inhouse }: { inhouse: HomeData["inhouse"] }) {
  const isExternalWhatsapp = Boolean(inhouse.whatsappHref?.startsWith("http"));
  const description =
    inhouse.card?.summary ??
    "Pelatihan di tempat perusahaanmu. Materi, silabus, tanggal, dan waktu kami susun bersama timmu.";

  return (
    <section
      id="inhouse-training"
      aria-labelledby="inhouse-training-title"
      className="tone-night mt-16 px-6 py-14 md:px-10 lg:py-20"
    >
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--tone-rule)] pb-4">
        <h3 id="inhouse-training-title" className="type-mega" data-motion="chapter">
          Inhouse <br className="sm:hidden" />
          Training
        </h3>
        <p className="eyebrow shrink-0">Korporat & Instansi</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-x-12">
        <div className="space-y-5 lg:col-span-5">
          <p data-motion="rise" className="max-w-[42ch] text-base leading-[1.6] text-[var(--tone-muted)] text-pretty">
            {description}
          </p>
          {inhouse.whatsappHref ? (
            <div data-motion="rise" className="pt-2">
              <a
                className="button-primary"
                href={inhouse.whatsappHref}
                target={isExternalWhatsapp ? "_blank" : undefined}
                rel={isExternalWhatsapp ? "noopener noreferrer" : undefined}
              >
                <span>Konsultasi via WhatsApp</span>
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </div>

        <div className="lg:col-span-7">
          {inhouse.media.length > 0 ? (
            <BentoGallery media={inhouse.media} label="Dokumentasi Inhouse Training" />
          ) : null}
        </div>
      </div>

      {inhouse.partners.length > 0 ? (
        <div className="mt-12 border-t border-[var(--tone-rule)] pt-8">
          <p className="eyebrow">Pernah melatih</p>
          <ul
            data-motion="rise"
            className="mt-5 grid grid-cols-3 gap-px bg-[var(--tone-rule)] sm:grid-cols-4 lg:grid-cols-6"
          >
            {inhouse.partners.map((partner) => (
              <li
                key={partner.id}
                className="flex h-24 items-center justify-center bg-[var(--tone-tile)] px-3"
              >
                {partner.logoUrl ? (
                  <Image
                    src={partner.logoUrl}
                    alt={partner.name}
                    width={120}
                    height={48}
                    className="max-h-12 w-auto object-contain opacity-80 grayscale transition-[filter,opacity] [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:hover:grayscale-0"
                  />
                ) : (
                  <span className="text-center text-sm text-[var(--tone-muted)]">
                    {partner.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
