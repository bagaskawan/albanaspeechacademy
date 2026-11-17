import Link from "next/link";
import { readPublishedContacts } from "@/lib/server/public-contacts";
import { academyRequest } from "@/lib/server/academy-api";
import { academyChannels } from "./academy-channels";
import { BrandLogo } from "./brand-logo";
import { Container } from "./container";

export async function SiteFooter({ className = "" }: { className?: string } = {}) {
  let contacts: Awaited<ReturnType<typeof readPublishedContacts>> = [];
  try { contacts = await readPublishedContacts(); } catch { /* No stale contact link on failure. */ }
  let trainersAvailable = false;
  try { const rows = await academyRequest("trainers?select=slug&limit=1"); trainersAvailable = Array.isArray(rows) && rows.length > 0; } catch { /* Hide broken anchor. */ }
  const footerLinks = [
    { href: "/#program", label: "Program" },
    { href: "/#tentang", label: "Tentang" },
    ...(trainersAvailable ? [{ href: "/#trainer", label: "Trainer" }] : []),
    { href: "/#jadwal", label: "Jadwal" },
    ...(contacts.length ? [{ href: "/#kontak", label: "Kontak" }] : []),
  ];
  return (
    <footer className={`border-t border-canvas/30 bg-accent-strong text-canvas [&_a:focus-visible]:outline-canvas ${className}`.trim()}>
      <Container>
        <div className="flex flex-col items-center py-12 text-center md:py-16">
          <Link
            className="inline-flex min-h-11 items-center"
            href="/"
            aria-label="Albana Speech Academy, beranda"
          >
            <BrandLogo
              className="h-10"
              imageClassName="scale-[1.1]"
              src="/images/Albana-Speech-Academy-Logo-White.png"
            />
          </Link>

          <nav className="mt-6" aria-label="Navigasi footer">
            <ul className="flex list-none flex-wrap justify-center gap-x-1">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    className="inline-flex min-h-11 items-center px-2 text-xs font-semibold tracking-[0.1em] text-canvas uppercase underline-offset-4 hover:text-highlight hover:underline"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-2 flex items-center gap-1">
            {academyChannels(contacts).map(({ label, href, icon }) => {
              const opensNewTab = href.startsWith("http");
              return (
                <a
                  key={label}
                  aria-label={label}
                  className="grid size-11 place-items-center text-canvas hover:text-highlight"
                  href={href}
                  rel={opensNewTab ? "noreferrer" : undefined}
                  target={opensNewTab ? "_blank" : undefined}
                  title={label}
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="20"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    {icon}
                  </svg>
                </a>
              );
            })}
          </div>

          <p className="mt-6 text-sm text-canvas/75">© 2026 Albana Speech Academy · CV Asa Albana</p>
        </div>
      </Container>
    </footer>
  );
}
