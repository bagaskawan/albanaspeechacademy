import { Container } from "@/components/layout/container";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { readProgramShowcase } from "@/lib/server/program-showcase";

const labels = { whatsapp: "WhatsApp admin", email: "Email", instagram: "Instagram", address: "Kantor" } as const;

export async function ClosingSection() {
  let contacts: Awaited<ReturnType<typeof readPublishedContacts>> = [];
  try { contacts = await readPublishedContacts(); } catch { /* No stale contact details. */ }
  const whatsapp = contacts.find((item) => item.kind === "whatsapp");
  const showcase = await readProgramShowcase();
  const hasBatch = showcase.status === "ready" && showcase.cards.some((card) => card.batch);
  if (!hasBatch && !whatsapp && !contacts.length) return null;
  return <section id="kontak" className="bg-accent-strong py-14 text-canvas md:py-24" aria-labelledby="kontak-title"><Container className="max-w-7xl">
    {hasBatch || whatsapp ? <div data-motion="rise" className="border-b border-canvas/30 pb-12 md:pb-16">
      <h2 id="kontak-title" data-motion="heading" className="max-w-[14ch] font-display text-4xl leading-tight font-semibold tracking-tight md:text-6xl">Usulan apa yang ingin <mark className="bg-highlight text-accent-strong">kamu latih</mark>?</h2>
      <p className="mt-5 max-w-xl text-lg">Ceritakan situasinya — presentasi, memandu acara, atau pelatihan tim. Kami bantu memilih program yang pas.</p>
      <div className="mt-7 flex flex-wrap items-center gap-5"><a className="button-secondary bg-card text-accent-strong" href="#jadwal">Lihat jadwal</a>{whatsapp ? <a className="min-h-11 content-center underline underline-offset-4" href={contactHref(whatsapp)} target="_blank" rel="noopener noreferrer">Chat lewat WhatsApp</a> : null}</div>
    </div> : <h2 id="kontak-title" className="text-3xl font-semibold">Kontak</h2>}
    {contacts.length ? <dl className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-4">{contacts.map((channel) => {
      const href = contactHref(channel);
      return <div key={channel.kind} data-motion="slide"><dt className="text-sm text-canvas/75">{labels[channel.kind]}</dt><dd className="mt-2 font-semibold break-words">{href ? <a className="inline-flex min-h-11 items-center underline underline-offset-4" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{channel.value}</a> : channel.value}</dd>{channel.kind === "address" ? <p className="text-xs text-canvas/75">Lokasi kelas tertera di jadwal tiap batch.</p> : null}</div>;
    })}</dl> : null}
  </Container></section>;
}
