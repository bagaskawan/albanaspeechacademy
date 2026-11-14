import { Container } from "@/components/layout/container";
import { contactHref, type ContactRow } from "@/lib/server/public-contacts";

const CONTACTS: ContactRow[] = [
  { kind: "instagram", value: "@albanaspeechacademy" },
  { kind: "whatsapp", value: "0857-1779-7637" },
  { kind: "email", value: "asaalbana91@gmail.com" },
  { kind: "address", value: "Jl. Diponegoro No. 61 Bandung" },
];

export function ContactSection() {
  const contacts = CONTACTS;
  const whatsapp = contacts.find((channel) => channel.kind === "whatsapp");
  return (
    <section
      id="kontak"
      className="contact-section w-full bg-panel-soft py-16 text-ink md:py-20 lg:py-24"
      aria-labelledby="contact-title"
    >
      <Container className="max-w-5xl">
        <div className="grid gap-10 md:grid-cols-8 md:gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col md:col-span-4 lg:col-span-5">
            <p className="eyebrow text-accent">Mulai percakapan</p>
            <h2
              id="contact-title"
              className="mt-3 max-w-[14ch] text-[2rem] leading-[1.05] font-semibold tracking-[-0.045em] text-balance md:text-[2.5rem] lg:text-[3rem]"
            >
              Ceritakan situasi komunikasi yang ingin kamu latih
            </h2>
            <p className="mt-4 max-w-[35em] text-sm leading-[1.6] text-muted">
              Sampaikan apakah kamu ingin melatih presentasi, memandu acara, atau menyiapkan pelatihan untuk tim. Tim Albana akan menjelaskan program yang tersedia.
            </p>
            {whatsapp ? <a
              className="button-primary mt-8 md:mt-auto md:self-start"
              href={contactHref(whatsapp)}
              rel="noreferrer"
              target="_blank"
            >
              Chat lewat WhatsApp
            </a> : <p className="mt-8 text-sm text-muted">Kanal WhatsApp belum tersedia. Silakan periksa kembali nanti.</p>}
          </div>

          <div className="md:col-span-4 lg:col-span-6 lg:col-start-7">
            <dl className="divide-y divide-rule border-t border-rule">
              {contacts.map((channel) => (
                <div key={channel.kind} className="py-5 md:py-6">
                  <dt className="eyebrow text-muted">{{ email: "Email", instagram: "Instagram", address: "Alamat", whatsapp: "WhatsApp" }[channel.kind]}</dt>
                  <dd className="mt-1.5 text-lg font-semibold tracking-[-0.01em]">
                    {contactHref(channel) ? (
                      <a
                        className="inline-flex min-h-11 items-center gap-2 underline decoration-control/60 underline-offset-4 hover:decoration-accent"
                        href={contactHref(channel)}
                        rel={channel.kind === "instagram" || channel.kind === "whatsapp" ? "noreferrer" : undefined}
                        target={channel.kind === "instagram" || channel.kind === "whatsapp" ? "_blank" : undefined}
                      >
                        {channel.value}
                        <span aria-hidden="true" className="text-sm">
                          ↗
                        </span>
                      </a>
                    ) : (
                      channel.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
