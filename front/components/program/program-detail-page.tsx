import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RetryButton } from "@/components/ui/retry-button";
import type { ProgramCard } from "@/lib/server/program-showcase";

function PublicPage({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="pb-20 md:pb-28">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

export function ProgramDetailPage({ card, media, consultationHref, partners = [] }: { card: ProgramCard; media: { id: number; kind: "image" | "video"; src: string; alt: string; youtubeId: string | null }[]; consultationHref?: string; partners?: { id: number; name: string; logo_url: string | null }[] }) {
  const registrationUrl = card.registrationUrl ?? `/register/${encodeURIComponent(card.slug)}`;

  return (
    <PublicPage>
      <Container className="max-w-3xl">
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
          <p className="eyebrow">Detail program</p>
          <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance md:text-[3.25rem]">
            {card.title}
          </h1>
          <p className="sub-title-program mt-4 text-lg leading-[1.6] text-muted md:text-xl">
            {card.summary}
          </p>
        </div>

        <aside className="mt-8 border border-rule bg-card p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:150ms] fill-mode-both">
          <p className="flex items-center gap-2.5 font-semibold">
            <span aria-hidden="true" className="size-2 shrink-0 bg-accent" />
            {card.statusLabel}
          </p>
          {card.batch ? (
            <dl className="mt-5 divide-y divide-rule border-t border-rule text-sm">
              <div className="py-3">
                <dt className="eyebrow">Format</dt>
                <dd className="mt-1">{card.batch.formatLabel}</dd>
              </div>
              <div className="py-3">
                <dt className="eyebrow">Tanggal</dt>
                <dd className="mt-1">
                  <ul className="flex flex-col gap-1 font-semibold tabular-nums leading-normal">
                    {card.batch.dateLabels.map((date) => (
                      <li key={date}>{date}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="py-3">
                <dt className="eyebrow">Jam</dt>
                <dd className="mt-1 tabular-nums">{card.batch.timeLabel}</dd>
              </div>
              <div className="pt-3">
                <dt className="eyebrow">Tempat</dt>
                <dd className="mt-1">{card.batch.venueLabel}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Tanggal, jam, dan tempat akan ditampilkan setelah batch diterbitkan.
            </p>
          )}
        </aside>

        <section className="mt-12 border-t border-rule pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:300ms] fill-mode-both" aria-labelledby="curriculum-title">
          <div>
            <p className="eyebrow">Materi</p>
            <h2 id="curriculum-title" className="mt-2 text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
              Yang akan dipelajari
            </h2>
          </div>
          <div className="mt-6">
            <ol className="divide-y divide-rule border-y border-rule">
              {card.topics.map((topic, index) => (
                <li
                  key={topic}
                  className="flex items-center gap-5 py-4 md:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                  style={{ animationDelay: `${350 + index * 50}ms` }}
                >
                  <span className="eyebrow shrink-0 text-accent tabular-nums" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium">{topic}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {card.slug === "inhouse-training" ? <section className="mt-12 border-t border-rule pt-10" aria-labelledby="partners-title">
          <p className="eyebrow">Kolaborasi</p><h2 id="partners-title" className="mt-2 text-2xl font-semibold">Our Partner</h2>
          {partners.length ? <ul className="mt-6 grid gap-4 sm:grid-cols-2">{partners.map((partner) => <li key={partner.id} className="flex min-h-28 items-center gap-4 border border-rule bg-card p-4">
            {partner.logo_url ? <img src={partner.logo_url} alt="" loading="lazy" className="max-h-16 max-w-28 object-contain" /> : null}
            <span className="font-semibold">{partner.name}</span>
          </li>)}</ul> : <p className="mt-5 text-sm text-muted">Daftar partner akan tampil setelah admin menerbitkannya.</p>}
        </section> : null}

        <section className="mt-12 border-t border-rule pt-10" aria-labelledby="program-media-title">
          <p className="eyebrow">Lihat kegiatannya</p>
          <h2 id="program-media-title" className="mt-2 text-2xl font-semibold">Foto dan video program</h2>
          {media.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {media.map((item) => <figure key={item.id} className="overflow-hidden border border-rule bg-card">
              {item.kind === "image" ? <img src={item.src} alt={item.alt} loading="lazy" className="aspect-video w-full object-cover" /> :
                item.youtubeId ? <iframe src={item.src} title={item.alt} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="aspect-video w-full" /> :
                <video src={item.src} controls preload="metadata" aria-label={item.alt} className="aspect-video w-full" />}
              <figcaption className="p-3 text-sm text-muted">{item.alt}</figcaption>
            </figure>)}
          </div> : <p className="mt-5 text-sm text-muted">Dokumentasi program akan ditampilkan setelah admin menerbitkannya.</p>}
        </section>

        <div className="mt-10 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:500ms] fill-mode-both">
          {card.slug === "inhouse-training" ? consultationHref ? <a className="button-primary" href={`${consultationHref}?text=${encodeURIComponent("Halo Admin Albana, saya ingin berkonsultasi tentang Inhouse Training.")}`} target="_blank" rel="noopener noreferrer">Konsultasi Inhouse via WhatsApp <span aria-hidden="true">↗</span></a> :
            <p className="text-sm text-muted">Kanal konsultasi akan tampil setelah admin mengisi WhatsApp resmi.</p> :
            card.registrationUrl ? <Link className="button-primary" href={registrationUrl}>Daftar program <span aria-hidden="true">→</span></Link> :
              <p className="text-sm text-muted">Pendaftaran dibuka kembali setelah jadwal batch tersedia.</p>}
        </div>
      </Container>
    </PublicPage>
  );
}

export function ProgramDetailLoading() {
  return (
    <PublicPage>
      <Container className="max-w-3xl">
        <div className="pt-12" aria-label="Memuat detail program">
          <div className="h-3 w-28 bg-surface" />
          <div className="mt-5 h-14 w-full max-w-2xl bg-surface" />
          <div className="mt-5 h-5 w-full max-w-xl bg-surface" />
        </div>
      </Container>
    </PublicPage>
  );
}

export function ProgramDetailFailure() {
  return (
    <PublicPage>
      <Container className="max-w-3xl">
        <div className="py-16 md:py-24">
          <p className="eyebrow">Detail program</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            Program belum bisa dimuat
          </h1>
          <p className="mt-4 max-w-[42em] text-muted">
            Data program sedang tidak tersedia. Coba muat ulang sebentar lagi.
          </p>
          <RetryButton />
        </div>
      </Container>
    </PublicPage>
  );
}

export function ProgramNotFound() {
  return (
    <PublicPage>
      <Container className="max-w-3xl">
        <div className="py-16 md:py-24">
          <p className="eyebrow">Program</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
            Program tidak ditemukan
          </h1>
          <p className="mt-4 max-w-[42em] text-muted">
            Program yang kamu cari tidak tersedia atau belum diterbitkan.
          </p>
          <Link className="button-primary mt-7" href="/#program-pilihan">
            Lihat semua program
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Container>
    </PublicPage>
  );
}
