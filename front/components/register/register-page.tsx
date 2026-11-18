import Link from "next/link";
import { Tile } from "@/components/home/ui/tile";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { RegisterBrandBar } from "@/components/register/register-brand-bar";
import { RegistrationChoice } from "@/components/register/registration-choice";
import { RetryButton } from "@/components/ui/retry-button";
import type { RegistrationSelection } from "@/lib/server/registration-batch";
import { readBundleOffer, type BundleOffer } from "@/lib/server/bundle-offer";

function RegistrationState({
  selection,
  offer,
  programPhoto,
}: {
  selection: RegistrationSelection;
  offer: BundleOffer | null;
  programPhoto?: { src: string; alt: string } | null;
}) {
  if (selection.status === "ready") {
    return (
      <RegistrationChoice
        batch={selection.batch}
        offer={offer}
        programPhoto={programPhoto}
      />
    );
  }

  if (selection.status === "program") {
    return (
      <Tile tone="plain" className="tone-canvas p-6 lg:p-10">
        <RegisterBrandBar />
        <section className="mt-8">
          <p className="eyebrow text-[var(--tone-muted)]">Program pilihan</p>
          <h2 className="type-title mt-2">{selection.program.title}</h2>
          <p className="type-small mt-3 text-[var(--tone-muted)]">
            Jadwal program ini belum tersedia. Pendaftaran dapat dilanjutkan setelah batch dibuka.
          </p>
          <Link className="button-secondary mt-6" href={`/#${selection.program.slug}`}>
            Kembali ke program
          </Link>
        </section>
      </Tile>
    );
  }

  const message = {
    loading: ["Memeriksa pilihan batch", "Data program dan status pendaftaran sedang dimuat."],
    failed: ["Pilihan batch belum bisa diperiksa", "Data program sedang tidak tersedia. Coba muat ulang sebelum mendaftar."],
    missing: ["Belum ada pendaftaran yang dibuka", "Pilih program untuk melihat jadwal dan status pendaftaran terkini."],
  }[selection.status];

  return (
    <Tile tone="plain" className="tone-canvas p-6 lg:p-10">
      <RegisterBrandBar />
      <section className="mt-8" aria-live="polite">
        <h2 className="type-title">{message[0]}</h2>
        <p className="type-small mt-3 text-[var(--tone-muted)]">{message[1]}</p>
        {selection.status === "failed" ? <RetryButton /> : null}
        {selection.status === "missing" ? (
          <Link className="button-primary mt-6" href="/#program">
            Lihat pilihan program
          </Link>
        ) : null}
      </section>
    </Tile>
  );
}

export async function RegisterPage({
  selection,
  programPhoto = null,
}: {
  selection: RegistrationSelection;
  programPhoto?: { src: string; alt: string } | null;
}) {
  let offer: BundleOffer | null = null;
  if (selection.status === "ready") {
    try {
      offer = await readBundleOffer(selection.batch);
    } catch { /* Standalone registration remains available if the offer lookup fails. */ }
  }

  return (
    <main id="main-content" className="tone-mist min-h-screen py-8 lg:py-16">
      <div className="home-container">
        <h1 className="sr-only">Pendaftaran kelas</h1>
        <RegistrationState selection={selection} offer={offer} programPhoto={programPhoto} />
      </div>
      <ThemeToggle className="fixed right-5 bottom-5 z-50 inline-flex size-12 aspect-square items-center justify-center rounded-full border border-[var(--tone-rule)] bg-[var(--tone-tile)] text-[var(--tone-ink)] shadow-lg transition-transform hover:scale-105 hover:bg-[var(--tone-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:right-6 sm:bottom-6" />
    </main>
  );
}
