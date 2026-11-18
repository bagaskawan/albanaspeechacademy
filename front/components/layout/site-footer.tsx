import { ArrowUpRight, MapPin } from "lucide-react";

const RRI_BANDUNG_EMBED =
  "https://www.google.com/maps?q=RRI+Bandung,+Jl.+Diponegoro+No.+61,+Bandung&output=embed";
const RRI_BANDUNG_LINK =
  "https://www.google.com/maps/search/?api=1&query=RRI+Bandung,+Jl.+Diponegoro+No.+61,+Bandung";

export function SiteFooter({ className = "" }: { className?: string } = {}) {
  return (
    <footer
      className={`tone-night border-t border-[var(--tone-rule)] bg-[var(--tone-bg)] text-[var(--tone-ink)] [&_a:focus-visible]:outline-white ${className}`.trim()}
    >
      <div className="home-container">
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-0 lg:py-16">
          <div className="lg:col-span-6 lg:pr-10">
            <p className="font-display text-sm font-bold uppercase tracking-[0.12em]">
              Albana Speech Academy
            </p>
            <p className="type-small mt-4 max-w-[42ch] uppercase leading-relaxed text-[var(--tone-muted)]">
              Lembaga pelatihan public speaking berbasis praktik untuk individu, pembicara profesional, dan tim organisasi.
            </p>
            <div className="mt-6 border-t border-[var(--tone-rule)] pt-5">
              <p className="eyebrow text-[var(--tone-muted)]">[ Badan Hukum ]</p>
              <p className="eyebrow mt-1.5 text-[var(--tone-ink)]">
                CV Asa Albana · NIB 2701260111907
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 lg:border-l lg:border-[var(--tone-rule)] lg:pl-10">
            <p className="eyebrow text-[var(--tone-muted)]">Lokasi</p>
            <p className="type-small mt-3 font-medium text-[var(--tone-ink)]">
              RRI Bandung · Jl. Diponegoro No. 61, Kota Bandung
            </p>
            <div className="mt-3 aspect-[16/9] w-full overflow-hidden rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)]">
              <iframe
                src={RRI_BANDUNG_EMBED}
                title="Peta lokasi RRI Bandung"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
            <a
              href={RRI_BANDUNG_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow mt-2 inline-flex min-h-8 items-center gap-1.5 text-[var(--tone-ink)] underline-offset-4 transition-colors hover:text-[var(--tone-sun)] hover:underline"
            >
              <span>Buka di Google Maps</span>
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="border-t border-[var(--tone-rule)] py-10 text-center lg:py-12">
          <p className="type-title text-[var(--tone-muted)] opacity-60">
            Berlatih Bicara, Siap di Setiap Panggung.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--tone-rule)] py-6">
          <p className="eyebrow text-[var(--tone-muted)]">
            © 2026 Albana Speech Academy · CV Asa Albana.
          </p>
          <p className="eyebrow inline-flex items-center gap-1.5 text-[var(--tone-muted)]">
            <MapPin className="size-3.5 text-[var(--tone-sun)]" aria-hidden="true" />
            <span>RRI Bandung · Bandung, Indonesia</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
