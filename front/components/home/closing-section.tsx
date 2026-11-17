import Image from "next/image";
import { Container } from "@/components/layout/container";
import type { HomeMedia } from "@/lib/home-data";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { readProgramShowcase } from "@/lib/server/program-showcase";

const labels = { whatsapp: "WhatsApp admin", email: "Email", instagram: "Instagram", address: "Kantor" } as const;

export async function ClosingSection({ moments }: { moments: HomeMedia[] }) {
  let contacts: Awaited<ReturnType<typeof readPublishedContacts>> = [];
  try { contacts = await readPublishedContacts(); } catch { /* No stale contact details. */ }
  const whatsapp = contacts.find((item) => item.kind === "whatsapp");
  const showcase = await readProgramShowcase();
  const hasBatch = showcase.status === "ready" && showcase.cards.some((card) => card.batch);
  if (!hasBatch && !whatsapp && !contacts.length) return null;
  return <section id="kontak" className="tone-night py-14 md:py-24" aria-labelledby="kontak-title"><Container className="max-w-7xl">
    {moments.length >= 6 ? <div data-bento className="mb-12 grid grid-cols-3 gap-1 md:mb-16">{moments.slice(3, 6).map((photo) => <div key={photo.id} data-motion="media" className="relative aspect-[4/5] overflow-hidden bg-[var(--tone-tile)]"><Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1280px) 400px, 33vw" className="object-cover" /></div>)}</div> : null}
    {hasBatch || whatsapp ? <div data-motion="rise" className="border-b border-[var(--tone-rule)] pb-12 md:pb-16">
      <h2 id="kontak-title" data-motion="heading" className="max-w-[14ch] font-display text-4xl leading-tight font-semibold tracking-tight md:text-6xl">Usulan apa yang ingin <em className="accent-serif">kamu latih</em>?</h2>
      <p className="mt-5 max-w-xl text-lg">Ceritakan situasinya — presentasi, memandu acara, atau pelatihan tim. Kami bantu memilih program yang pas.</p>
      <div className="mt-7 flex flex-wrap items-center gap-5"><a className="button-secondary" href="#jadwal">Lihat jadwal</a>{whatsapp ? <a className="min-h-11 content-center underline underline-offset-4" href={contactHref(whatsapp)} target="_blank" rel="noopener noreferrer">Chat lewat WhatsApp</a> : null}</div>
    </div> : <h2 id="kontak-title" className="text-3xl font-semibold">Kontak</h2>}
    {contacts.length ? <dl className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-4">{contacts.map((channel) => {
      const href = contactHref(channel);
      return <div key={channel.kind} data-motion="slide"><dt className="text-sm text-[var(--tone-muted)]">{labels[channel.kind]}</dt><dd className="mt-2 font-semibold break-words">{href ? <a className="inline-flex min-h-11 items-center underline underline-offset-4" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{channel.value}</a> : channel.value}</dd>{channel.kind === "address" ? <p className="text-xs text-[var(--tone-muted)]">Lokasi kelas tertera di jadwal tiap batch.</p> : null}</div>;
    })}</dl> : null}
  </Container></section>;
}
