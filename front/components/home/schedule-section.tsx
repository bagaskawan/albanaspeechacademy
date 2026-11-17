import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import type { HomeData } from "@/lib/home-data";
import { readProgramShowcase } from "@/lib/server/program-showcase";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { RetryButton } from "@/components/ui/retry-button";
import { SectionIntro } from "./section-intro";

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export async function ScheduleSection({ programs, moments }: { programs: HomeData["programs"]; moments: HomeData["moments"] }) {
  const showcase = await readProgramShowcase();
  let whatsapp: string | undefined;
  try { const channel = (await readPublishedContacts()).find((item) => item.kind === "whatsapp"); whatsapp = channel ? contactHref(channel) : undefined; } catch { /* Contact link is optional. */ }
  const cards = showcase.status === "ready" ? showcase.cards.filter((card) => card.slug !== "inhouse-training" && card.batch) : [];
  return <section id="jadwal" className="section tone-mist" aria-labelledby="jadwal-title">
    <Container className="max-w-7xl">
      <SectionIntro eyebrow="[ JADWAL & BIAYA ]" title={<>Pilih batch, <em className="accent-serif">tandai kalendermu</em></>} titleId="jadwal-title" description="Semua tanggal, jam, tempat, dan biaya ada di sini. Waktu dalam WIB." />
      {showcase.status === "failed" ? <div className="mt-8"><p>Jadwal belum bisa dimuat.</p><RetryButton /></div> : cards.length ? <div className="mt-8 grid gap-5">
        {cards.map((card, cardIndex) => { const thumb = (programs === "failed" ? undefined : programs.find((program) => program.card.slug === card.slug)?.media.find((item) => item.kind === "image")) ?? moments[cardIndex % Math.max(moments.length, 1)]; return <article key={card.slug} data-motion="rise" className="grid border border-[var(--tone-rule)] bg-[var(--tone-tile)] lg:grid-cols-[18rem_1fr]">
          {thumb ? <div className="p-5 pb-0 md:p-7 md:pb-0 lg:p-0"><div data-motion="media" className="relative aspect-video overflow-hidden bg-[var(--tone-bg)] lg:h-full lg:min-h-48"><Image src={thumb.src} alt={thumb.alt} fill sizes="(min-width: 1024px) 18rem, 90vw" className="object-cover" /></div></div> : <div className="hidden lg:block" />}
          <div>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--tone-rule)] p-5 md:p-7">
            <h3 className="text-xl font-semibold">{card.title} · {card.batch!.name}</h3>
            <span className="text-sm font-medium text-[var(--tone-accent)]">{card.statusLabel}</span>
          </div>
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="p-5 md:p-7">
              <ol className="divide-y divide-[var(--tone-rule)] border-y border-[var(--tone-rule)]">{card.batch!.dateLabels.map((date, index) => <li key={`${date}-${index}`} data-motion="slide" className="flex flex-wrap gap-x-5 gap-y-1 py-3 text-sm"><strong className="shrink-0">Sesi {index + 1}</strong><span>{date}</span><span className="tabular-nums">{card.batch!.timeLabel} WIB</span></li>)}</ol>
              <p className="mt-5 text-sm text-[var(--tone-muted)]">Tempat: {card.batch!.venueLabel}</p>
            </div>
            <div className="flex flex-col border-t border-[var(--tone-rule)] p-5 md:p-7 lg:border-l lg:border-t-0">
              <p className="text-sm text-[var(--tone-muted)]">Biaya</p>
              {card.batch!.normalPriceIdr ? <p className="mt-2 text-sm text-[var(--tone-muted)] line-through tabular-nums">{rupiah(card.batch!.normalPriceIdr)}</p> : null}
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{card.batch!.priceIdr ? rupiah(card.batch!.priceIdr) : "—"}</p>
              {card.batch!.dpPercent && card.batch!.priceIdr ? <p className="mt-2 text-sm text-[var(--tone-muted)]">DP {card.batch!.dpPercent}% · {rupiah(Math.ceil(card.batch!.priceIdr * card.batch!.dpPercent / 100))}</p> : null}
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                {card.registrationUrl ? <Link href={card.registrationUrl} className="button-primary">Daftar kelas ini</Link> : whatsapp ? <a href={whatsapp} className="button-primary" target="_blank" rel="noopener noreferrer">Tanya admin</a> : null}
              </div>
            </div>
          </div>
          </div>
        </article>; })}
      </div> : <div className="mt-8 border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-6"><p>Jadwal kelas berikutnya belum tersedia.</p>{whatsapp ? <a href={whatsapp} className="button-secondary mt-4" target="_blank" rel="noopener noreferrer">Chat lewat WhatsApp</a> : null}</div>}
    </Container>
  </section>;
}
