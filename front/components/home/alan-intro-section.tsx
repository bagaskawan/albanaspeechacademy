import Image from "next/image";
import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";

const alanPoints = [
  "Berpengalaman sebagai penyiar Radio Republik Indonesia sejak 2015.",
  "Berlatar pendidikan komunikasi penyiaran Islam dan komunikasi pendidikan.",
  "Memiliki sertifikasi Master Trainer dan Public Speaker BNSP.",
] as const;

export async function AlanIntroSection() {
  let alan: { name: string; role: string; bio: string | null; photo_url: string | null } | null = null;
  try {
    const rows = await academyRequest("trainers?select=name,role,bio,photo_url&slug=eq.alan-albana&limit=1");
    if (Array.isArray(rows) && rows.length > 0) alan = rows[0] ?? null;
  } catch { /* The section remains with approved editorial copy. */ }

  const name = alan?.name ?? "Alan Albana";
  const role = alan?.role ?? "Founder";
  const bio = alan?.bio ?? "Pengalaman siaran, panggung, dan pelatihan menjadi bekal Alan saat mendampingi sesi praktik.";
  const photoUrl = alan?.photo_url || "/images/alan-albana-profile-blue-background.png";

  return (
    <section
      id="alan"
      className="section"
      aria-labelledby="alan-title"
    >
      <Container className="max-w-5xl">
        <div className="grid gap-8 rounded-panel p-6 md:grid-cols-8 md:items-stretch md:p-8 lg:grid-cols-12 lg:p-10">
          <div className="md:col-span-4 lg:col-span-6">
            <Image
              alt="Alan Albana, founder Albana Speech Academy"
              className="h-auto w-full rounded-card object-cover object-top"
              height={500}
              priority
              sizes="(min-width: 768px) 46vw, 90vw"
              src={photoUrl}
              width={362}
            />
          </div>

          <div className="flex flex-col justify-end gap-6 md:col-span-4 lg:col-span-6">
            <div>
              <p className="eyebrow">Di balik kelas</p>
              <h2
                id="alan-title"
                className="mt-3 max-w-[18ch] text-[2rem] leading-[1.05] font-bold tracking-[-0.045em] text-balance md:text-[2.5rem] lg:text-[3.5rem]"
              >
                {name}
              </h2>
              <p className="eyebrow mt-2">
                {role} Albana Speech Academy
              </p>
              <p className="mt-4 max-w-[36em] leading-[1.6] text-muted">
                {bio}
              </p>
            </div>

            <div className="relative z-10 rounded-card bg-accent-strong p-6 text-canvas md:-ml-16 md:p-8 lg:-ml-20">
              <ol className="grid list-none gap-3">
                {alanPoints.map((point, index) => (
                  <li key={point} className="flex items-start gap-3.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 text-sm font-semibold text-highlight tabular-nums"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-[1.5] text-sm">{point}</span>
                  </li>
                ))}
              </ol>
              <a className="button-secondary mt-6 focus-visible:outline-canvas" href="#cara-ngajar">
                Lihat cara mengajar
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
