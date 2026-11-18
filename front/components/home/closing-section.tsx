import Image from "next/image";
import type { HomeMedia } from "@/lib/home-data";
import { academyChannels } from "@/components/layout/academy-channels";
import { contactHref, readPublishedContacts } from "@/lib/server/public-contacts";
import { readProgramShowcase } from "@/lib/server/program-showcase";
import { Accent } from "./ui/accent";
import { MoreLink } from "./ui/more-link";

export async function ClosingSection({ moments }: { moments: HomeMedia[] }) {
  let contacts: Awaited<ReturnType<typeof readPublishedContacts>> = [];
  try {
    contacts = await readPublishedContacts();
  } catch { /* No stale contact details. */ }

  const whatsapp = contacts.find((item) => item.kind === "whatsapp");
  const whatsappHref = whatsapp ? contactHref(whatsapp) : undefined;
  const channels = academyChannels(contacts);
  const showcase = await readProgramShowcase();
  const hasBatch = showcase.status === "ready" && showcase.cards.some((card) => card.batch);
  if (!hasBatch && !whatsapp && !channels.length) return null;

  return (
    <section id="kontak" className="tone-night" aria-labelledby="kontak-title">
      <div className="home-container home-section">
        <div className="home-grid items-start gap-y-10">
          <div className="col-span-4 sm:col-span-8 lg:col-span-7 lg:pr-8">
            <h2 id="kontak-title" data-motion="heading" className="type-display max-w-[18ch]">
              Usulan apa yang ingin <Accent>kamu latih</Accent>?
            </h2>
            <p className="type-lead mt-4 max-w-xl text-[var(--tone-muted)]">
              Ceritakan situasinya — presentasi, memandu acara, atau pelatihan tim. Kami bantu memilih program yang pas.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <a
                className="type-small inline-flex min-h-11 items-center rounded-xs bg-white px-6 py-3 font-display font-semibold text-[var(--color-accent-strong)] transition-colors hover:bg-white/90"
                href="#jadwal"
              >
                Lihat jadwal
              </a>
              {whatsappHref ? (
                <MoreLink href={whatsappHref} className="text-white">
                  Chat lewat WhatsApp
                </MoreLink>
              ) : null}
            </div>
          </div>

          {channels.length > 0 ? (
            <div className="col-span-4 border-t border-[var(--tone-rule)] pt-8 sm:col-span-8 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
              <p className="eyebrow text-[var(--tone-muted)]">Kontak & Sosial</p>
              <ul className="mt-4 grid gap-3 list-none">
                {channels.map(({ label, value, href, icon }) => {
                  const opensNewTab = href.startsWith("http");
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        aria-label={`${label}: ${value}`}
                        rel={opensNewTab ? "noreferrer" : undefined}
                        target={opensNewTab ? "_blank" : undefined}
                        className="type-small inline-flex min-h-8 items-center gap-3 text-[var(--tone-ink)] underline-offset-4 transition-colors hover:text-[var(--tone-sun)] hover:underline"
                      >
                        <svg
                          aria-hidden="true"
                          fill="none"
                          height="16"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.8"
                          viewBox="0 0 24 24"
                          width="16"
                          className="shrink-0 text-[var(--tone-muted)]"
                        >
                          {icon}
                        </svg>
                        <span className="break-all">{value}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
