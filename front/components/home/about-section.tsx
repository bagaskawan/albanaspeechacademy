import Image from "next/image";
import { Container } from "@/components/layout/container";
import { academyRequest } from "@/lib/server/academy-api";
import { SectionIntro } from "./section-intro";

const missions = [
  "Mengembangkan pelatihan komunikasi dari dasar hingga lanjutan.",
  "Meningkatkan kepercayaan diri dan performa komunikasi.",
  "Menghadirkan pelatihan berbasis praktik nyata.",
  "Mendukung budaya komunikasi profesional di organisasi.",
];
const alanPoints = [
  "Penyiar Radio Republik Indonesia sejak 2015.",
  "Certified Master Trainer dan Certified Public Speaker BNSP.",
  "Pemateri untuk kementerian, BUMN, perbankan, dan korporasi.",
];

export async function AboutSection() {
  let photo = "/images/alan-albana-profile-blue-background.png";
  let academyName = "Albana Speech Academy";
  try {
    const [trainerRows, academyRows] = await Promise.all([
      academyRequest("trainers?select=photo_url&slug=eq.alan-albana&limit=1"),
      academyRequest("academy?select=name&id=eq.1&limit=1"),
    ]);
    if (Array.isArray(trainerRows) && typeof trainerRows[0]?.photo_url === "string") photo = trainerRows[0].photo_url;
    if (Array.isArray(academyRows) && typeof academyRows[0]?.name === "string") academyName = academyRows[0].name;
  } catch { /* Static copy and the existing local portrait remain available. */ }
  return <section id="tentang" className="section bg-panel-soft" aria-labelledby="tentang-title"><Container className="max-w-7xl">
    <SectionIntro eyebrow="[ TENTANG KAMI ]" title={<>Dibangun oleh <em className="accent-serif">praktisi panggung</em>, untuk orang yang harus bicara</>} titleId="tentang-title" description={`${academyName} oleh CV Asa Albana melatih individu dan organisasi agar tampil lebih percaya diri, komunikatif, dan profesional — lewat praktik langsung, bukan teori panjang.`} />
    <div className="mt-9 grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-12">
      <div data-motion="rise" className="space-y-7">
        <div><h3 className="eyebrow">VISI</h3><p className="mt-2 text-lg leading-relaxed">Menjadi mitra terpercaya dalam pengembangan kompetensi komunikasi profesional dan kepemimpinan SDM yang berdaya saing tinggi.</p></div>
        <div><h3 className="eyebrow">MISI</h3><ol className="mt-2 grid gap-2">{missions.map((mission, index) => <li key={mission} className="flex gap-3"><span className="text-accent tabular-nums">{index + 1}.</span>{mission}</li>)}</ol></div>
      </div>
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div data-motion="media" className="relative min-h-80 overflow-hidden rounded-card bg-card"><Image src={photo} alt="Alan Albana, founder Albana Speech Academy." fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 90vw" className="object-cover object-top" /></div>
        <div data-motion="rise" className="rounded-card bg-accent-strong p-6 text-canvas"><h3 className="text-xl font-semibold">Alan Albana, S.Kom.I., M.I.Kom.</h3><p className="mt-2 text-sm">Founder · Trainer · MC · Penyiar RRI</p><ul className="mt-6 grid gap-4 text-sm">{alanPoints.map((point) => <li key={point} className="border-t border-canvas/30 pt-3">{point}</li>)}</ul></div>
      </div>
    </div>
  </Container></section>;
}
