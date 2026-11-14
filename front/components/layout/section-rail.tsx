import { academyChannels } from "./academy-channels";
import { readPublishedContacts } from "@/lib/server/public-contacts";

export async function SectionRail() {
  let contacts: Awaited<ReturnType<typeof readPublishedContacts>> = [];
  try { contacts = await readPublishedContacts(); } catch { /* No stale contact link on failure. */ }
  return (
    <nav aria-label="Kanal akademi" className="order-1 flex items-center gap-1 md:absolute md:top-[26%] md:bottom-[10%] md:left-[1%] lg:left-[4.3%] md:flex-col md:gap-0 md:after:mt-6 md:after:min-h-8 md:after:w-px md:after:flex-1 md:after:bg-control">
      {academyChannels(contacts).map(({ label, href, icon }) => (
        <a key={label} href={href} title={label} aria-label={label} className="grid size-11 shrink-0 place-items-center text-ink hover:text-accent">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
        </a>
      ))}
    </nav>
  );
}
