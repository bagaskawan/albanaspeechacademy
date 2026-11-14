import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";
import { TrainerGallery, type Trainer } from "./trainer-gallery";

type TrainerRow = {
  slug: string;
  name: string;
  expertise: string[] | null;
  bio: string | null;
  photo_url: string | null;
};

export async function TrainerSection() {
  let trainers: Trainer[] = [];
  try {
    const rows = await academyRequest("trainers?select=slug,name,expertise,bio,photo_url&order=name");
    if (Array.isArray(rows)) {
      trainers = (rows as TrainerRow[]).map((trainer) => ({
        slug: trainer.slug,
        name: trainer.name,
        role: trainer.expertise?.length ? trainer.expertise.join(" · ") : "Trainer",
        bio: trainer.bio ?? undefined,
        image: trainer.photo_url ?? undefined,
      }));
    }
  } catch { /* Section stays available when the catalog is offline. */ }

  return (
    <section
      id="trainer"
      className="section"
      aria-labelledby="trainer-title"
    >
      <Container className="max-w-7xl">
        <p className="eyebrow">Pendamping latihan</p>
        <h2
          id="trainer-title"
          className="mt-3 max-w-[24ch] text-[2rem] leading-[1.05] font-semibold tracking-[-0.045em] text-balance md:text-[2.5rem] lg:text-[3rem]"
        >
          Temui praktisi yang mendampingi proses belajarmu
        </h2>
        <p className="mt-3 max-w-[42em] leading-[1.6] text-muted">
          Setiap trainer hadir sesuai kebutuhan program. Buka profil untuk melihat informasi yang sudah tersedia.
        </p>

        {trainers.length ? (
          <TrainerGallery trainers={trainers} />
        ) : (
          <p className="mt-8 leading-[1.6] text-muted">Data trainer belum tersedia.</p>
        )}
      </Container>
    </section>
  );
}
