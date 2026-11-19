import type { HomeData, HomeMedia } from "@/lib/home-data";
import { BentoGallery } from "./bento-gallery";
import { PartnerLogo } from "./partner-logo";
import { PartnerMarquee } from "./partner-marquee";
import { SkeletonImage } from "./skeleton-image";
import { Accent } from "./ui/accent";
import { MoreLink } from "./ui/more-link";

function still(media: HomeMedia) {
  return media.kind === "video" ? (media.poster ?? "") : media.src;
}

export function InhouseTrainingSection({ inhouse }: { inhouse: HomeData["inhouse"] }) {
  const isExternal = Boolean(inhouse.whatsappHref?.startsWith("http"));
  const description =
    inhouse.card?.summary ??
    "Pelatihan di tempat perusahaanmu. Materi, silabus, tanggal, dan waktu kami susun bersama timmu.";
  const [main, small, ...rest] = inhouse.media;

  return (
    <section id="inhouse-training" aria-labelledby="inhouse-training-title" className="tone-night home-section">
      <div className="home-container home-stack-block">
        <div className="home-grid gap-y-10">
          <div className="col-span-4 flex flex-col justify-between gap-8 sm:col-span-8 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <p className="type-label text-[var(--tone-muted)]">03 · Inhouse Training</p>
              <h2 id="inhouse-training-title" data-motion="heading" className="type-display text-balance">
                Saat yang perlu berlatih adalah <Accent>satu tim.</Accent>
              </h2>
            </div>
            <div className="flex flex-col items-start gap-6">
              <p data-motion="rise" className="type-lead text-[var(--tone-ink)] text-pretty">{description}</p>
              <p data-motion="rise" className="type-body text-[var(--tone-muted)] text-pretty">
                Mulai dari satu percakapan: ceritakan kebutuhan timmu seperti presentasi ke klien, rapat pimpinan, atau acara perusahaan, lalu kami susun latihannya.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {inhouse.whatsappHref ? (
                  <a
                    href={inhouse.whatsappHref}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="type-small inline-flex min-h-11 items-center rounded-xs bg-white px-6 py-3 font-display font-semibold text-[var(--color-accent-strong)] transition-colors hover:bg-white/90"
                  >
                    Konsultasi via WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* Dua foto bertumpuk asimetris (ala Larch). */}
          {main ? (
            <div className="relative col-span-4 sm:col-span-8 lg:col-span-6 lg:col-start-7">
              <div data-motion="media" className="relative ml-auto aspect-[4/5] w-4/5 overflow-hidden rounded-xs bg-[var(--tone-tile)]">
                <SkeletonImage fill src={still(main)} alt={main.alt} sizes="(min-width: 1024px) 38vw, 80vw" className="object-cover" />
              </div>
              {small ? (
                <div
                  data-motion="media"
                  className="absolute bottom-8 left-0 aspect-square w-2/5 overflow-hidden rounded-xs border-4 border-[var(--tone-bg)] bg-[var(--tone-tile)]"
                >
                  <SkeletonImage fill src={still(small)} alt={small.alt} sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {rest.length > 0 ? (
          <div className="pt-8 lg:pt-12">
            <BentoGallery
              media={rest}
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
