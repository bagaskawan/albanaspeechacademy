import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { RegistrationChoice } from "@/components/register/registration-choice";
import { RetryButton } from "@/components/ui/retry-button";
import type { RegistrationSelection } from "@/lib/server/registration-batch";
import { readBundleChoice, type BundleChoice } from "@/lib/server/bundle-offer";

function RegistrationState({ selection, bundle }: { selection: RegistrationSelection; bundle: BundleChoice | null }) {
  if (selection.status === "ready") {
    return (
      <>
        <RegistrationChoice batch={selection.batch} bundle={bundle} />
      </>
    );
  }

  if (selection.status === "program") {
    return (
      <section className="mt-10 border-t border-rule pt-8">
        <p className="eyebrow">Program pilihan</p>
        <h2 className="mt-2 text-xl font-semibold">{selection.program.title}</h2>
        <p className="mt-3 text-muted text-sm">Jadwal program ini belum tersedia. Pendaftaran dapat dilanjutkan setelah batch dibuka.</p>
        <Link className="button-secondary mt-6" href={`/program/${selection.program.slug}`}>Kembali ke detail program</Link>
      </section>
    );
  }

  const message = {
    loading: ["Memeriksa pilihan batch", "Data program dan status pendaftaran sedang dimuat."],
    failed: ["Pilihan batch belum bisa diperiksa", "Data program sedang tidak tersedia. Coba muat ulang sebelum mendaftar."],
    missing: ["Belum ada pendaftaran yang dibuka", "Pilih program untuk melihat jadwal dan status pendaftaran terkini."],
  }[selection.status];

  return (
    <section className="mt-10 border-t border-rule pt-8" aria-live="polite">
      <h2 className="text-xl font-semibold">{message[0]}</h2>
      <p className="mt-3 text-muted">{message[1]}</p>
      {selection.status === "failed" ? <RetryButton /> : null}
      {selection.status === "missing" ? <Link className="button-primary mt-6" href="/#program-pilihan">Lihat pilihan program</Link> : null}
    </section>
  );
}

export async function RegisterPage({ selection }: { selection: RegistrationSelection }) {
  let bundle: BundleChoice | null = null;
  if (selection.status === "ready") {
    try { bundle = await readBundleChoice(selection.batch); }
    catch { /* Standalone registration remains available if the offer lookup fails. */ }
  }
  return (
    <main id="main-content" className="min-h-screen bg-surface px-4 py-6 sm:px-8 sm:py-12 lg:py-16">
      <div className="mx-auto w-full max-w-[52rem] border border-rule bg-card px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
        <Link href="/" aria-label="Albana Speech Academy, beranda" className="inline-flex min-h-11 items-center">
          <BrandLogo className="h-11 w-[7.2rem]" />
        </Link>
        <h1 className="sr-only">Pendaftaran kelas</h1>
        <RegistrationState selection={selection} bundle={bundle} />
      </div>
    </main>
  );
}
