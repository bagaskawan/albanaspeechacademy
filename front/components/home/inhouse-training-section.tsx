import type { HomeData } from "@/lib/home-data";
import { BentoGallery } from "./bento-gallery";
import { PartnerLogo } from "./partner-logo";
import { PartnerMarquee } from "./partner-marquee";
import { Accent } from "./ui/accent";
import { MoreLink } from "./ui/more-link";

export function InhouseTrainingSection({ inhouse }: { inhouse: HomeData["inhouse"] }) {
  const isExternal = Boolean(inhouse.whatsappHref?.startsWith("http"));
  const description =
    inhouse.card?.summary ??
    "Pelatihan di tempat perusahaanmu. Materi, silabus, tanggal, dan waktu kami susun bersama timmu.";

  return (
    <section id="inhouse-training" aria-labelledby="inhouse-training-title" className="tone-night home-section">
      <div className="home-container home-stack-block">
        <div className="home-grid items-start gap-y-8">
          <div className="col-span-4 flex flex-col gap-4 sm:col-span-8 lg:col-span-6">
            <p className="type-label text-[var(--tone-muted)]">03 · Inhouse Training</p>
            <h2 id="inhouse-training-title" data-motion="heading" className="type-display text-balance">
              Saat yang perlu berlatih adalah <Accent>satu tim.</Accent>
            </h2>
          </div>

          <div className="col-span-4 flex flex-col items-start gap-6 sm:col-span-8 lg:col-span-5 lg:col-start-8">
            <p data-motion="rise" className="type-lead text-[var(--tone-ink)] text-pretty">{description}</p>
            <p data-motion="rise" className="type-body text-[var(--tone-muted)] text-pretty">
              Mulai dari satu percakapan: ceritakan kebutuhan timmu seperti presentasi ke klien, rapat pimpinan, atau acara perusahaan, lalu kami susun latihannya.
            </p>
            {inhouse.whatsappHref ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                <a
                  href={inhouse.whatsappHref}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="type-small inline-flex min-h-11 items-center rounded-xs bg-white px-6 py-3 font-display font-semibold text-[var(--color-accent-strong)] transition-colors hover:bg-white/90"
                >
                  Konsultasi via WhatsApp
                </a>
              </div>
            ) : null}
          </div>
        </div>

        {inhouse.media.length > 0 ? (
          <div className="pt-8 lg:pt-12">
            <BentoGallery
              media={inhouse.media}
              label="Galeri Inhouse Training"
              variant="editorial"
              editorialTitle="Inhouse Training"
            />
          </div>
        ) : null}
      </div>

      {inhouse.partners.length > 0 ? (
        <div className="home-container pt-20 lg:pt-28">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
            <p className="type-label text-[var(--tone-muted)]">Partner kami</p>
            <p className="type-body text-[var(--tone-ink)] text-pretty">
              Dipercaya untuk melatih tim di organisasi berikut.
            </p>
          </div>

          {/* Mobile: 2,5 logo per layar, geser otomatis, loop, dan bisa di-swipe */}
          <PartnerMarquee partners={inhouse.partners} />

          {/* Tablet & Desktop: grid Logofolio */}
          <ul
            data-motion="rise"
            className="mt-8 hidden sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4"
          >
            {inhouse.partners.map((partner) => (
              <li
                key={partner.id}
                className="flex h-28 items-center justify-center border-t border-[var(--tone-rule)] px-2 pt-4"
              >
                {partner.logoUrl ? (
                  <PartnerLogo src={partner.logoUrl} alt={partner.name || "Partner Albana Speech Academy"} />
                ) : partner.name ? (
                  <span className="type-small text-center font-medium text-[var(--tone-ink)] opacity-80">{partner.name}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
