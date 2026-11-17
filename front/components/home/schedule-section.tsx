import Link from "next/link";
import { Container } from "@/components/layout/container";
import { readProgramShowcase } from "@/lib/server/program-showcase";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { RetryButton } from "@/components/ui/retry-button";
import { SectionIntro } from "./section-intro";

const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export async function ScheduleSection() {
  const showcase = await readProgramShowcase();
  let whatsapp: string | undefined;
  try { const channel = (await readPublishedContacts()).find((item) => item.kind === "whatsapp"); whatsapp = channel ? contactHref(channel) : undefined; } catch { /* Contact link is optional. */ }
  const cards = showcase.status === "ready" ? showcase.cards.filter((card) => card.slug !== "inhouse-training" && card.batch) : [];
  return <section id="jadwal" className="section bg-panel-soft" aria-labelledby="jadwal-title">
    <Container className="max-w-7xl">
      <SectionIntro eyebrow="[ JADWAL & BIAYA ]" title={<>Pilih batch, <mark className="bg-highlight text-ink">tandai kalendermu</mark></>} titleId="jadwal-title" description="Semua tanggal, jam, tempat, dan biaya ada di sini. Waktu dalam WIB." />
      {showcase.status === "failed" ? <div className="mt-8"><p>Jadwal belum bisa dimuat.</p><RetryButton /></div> : cards.length ? <div className="mt-8 grid gap-5">
        {cards.map((card) => <article key={card.slug} data-motion="rise" className="rounded-card border border-rule bg-card">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-rule p-5 md:p-7">
            <h3 className="text-xl font-semibold">{card.title} · {card.batch!.name}</h3>
            <span className="text-sm font-medium text-accent">{card.statusLabel}</span>
          </div>
          <div className="grid lg:grid-cols-[2fr_1fr]">
            <div className="p-5 md:p-7">
              <ol className="divide-y divide-rule border-y border-rule">{card.batch!.dateLabels.map((date, index) => <li key={`${date}-${index}`} data-motion="slide" className="flex flex-wrap gap-x-5 gap-y-1 py-3 text-sm"><strong className="shrink-0">Sesi {index + 1}</strong><span>{date}</span><span className="tabular-nums">{card.batch!.timeLabel} WIB</span></li>)}</ol>
              <p className="mt-5 text-sm text-muted">Tempat: {card.batch!.venueLabel}</p>
            </div>
            <div className="flex flex-col border-t border-rule p-5 md:p-7 lg:border-l lg:border-t-0">
              <p className="text-sm text-muted">Biaya</p>
              {card.batch!.normalPriceIdr ? <p className="mt-2 text-sm text-muted line-through tabular-nums">{rupiah(card.batch!.normalPriceIdr)}</p> : null}
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{card.batch!.priceIdr ? rupiah(card.batch!.priceIdr) : "—"}</p>
              {card.batch!.dpPercent && card.batch!.priceIdr ? <p className="mt-2 text-sm text-muted">DP {card.batch!.dpPercent}% · {rupiah(Math.ceil(card.batch!.priceIdr * card.batch!.dpPercent / 100))}</p> : null}
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-6">
                {card.registrationUrl ? <Link href={card.registrationUrl} className="button-primary">Daftar kelas ini</Link> : whatsapp ? <a href={whatsapp} className="button-primary" target="_blank" rel="noopener noreferrer">Tanya admin</a> : null}
                <Link href={`/program/${card.slug}`} className="min-h-11 content-center text-sm font-semibold underline underline-offset-4">Detail program</Link>
              </div>
            </div>
          </div>
        </article>)}
      </div> : <div className="mt-8 rounded-card border border-rule bg-card p-6"><p>Jadwal kelas berikutnya belum tersedia.</p>{whatsapp ? <a href={whatsapp} className="button-secondary mt-4" target="_blank" rel="noopener noreferrer">Chat lewat WhatsApp</a> : null}</div>}
    </Container>
  </section>;
}
