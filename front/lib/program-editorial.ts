export type ProgramEditorial = {
  metaDescription: string;
  audienceLead: string;
  audiencePoints: string[];
  learningIntro: string;
  practiceFormats: string[];
  trainingAreas?: string[];
  fallbackTopics: string[];
};

const EDITORIAL_BY_SLUG: Record<string, ProgramEditorial> = {
  "public-speaking-series": {
    metaDescription:
      "Kelas Public Speaking Series di Bandung untuk pemula. Latih dasar berbicara, MC formal/nonformal, dan moderator dengan praktik langsung dan masukan trainer.",
    audienceLead:
      "Untukmu yang ingin membangun dasar komunikasi yang kuat dan berlatih banyak peran bicara di satu rangkaian kelas.",
    audiencePoints: [
      "Mahasiswa, profesional muda, atau pemula yang ingin tampil lebih percaya diri saat berbicara di depan umum.",
      "Peserta yang ingin mempraktikkan dasar public speaking sekaligus peran MC formal, MC nonformal, dan moderator.",
      "Tidak membutuhkan pengalaman panggung sebelumnya; latihan dimulai dari fondasi dan praktik bertahap.",
    ],
    learningIntro:
      "Kelas dijalankan berbasis praktik langsung di depan peserta lain, dilanjutkan evaluasi dan masukan dari trainer.",
    practiceFormats: [
      "80% praktik langsung, simulasi panggung, role play MC dan pembicara, serta presentasi kasus nyata.",
      "20% coaching, evaluasi performa pribadi, masukan langsung dari trainer, dan kerangka komunikasi.",
    ],
    fallbackTopics: [
      "Basic Public Speaking",
      "MC formal dan nonformal",
      "Moderator",
    ],
  },
  "public-speaking-for-speakers": {
    metaDescription:
      "Kelas Public Speaking for Speakers di Bandung. Latih pembukaan kuat, struktur pesan, teknik interaktif, dan tanya jawab langsung bersama trainer Albana.",
    audienceLead:
      "Untukmu yang ingin tampil sebagai pembicara di depan audiens dengan pesan terstruktur dan penyampaian meyakinkan.",
    audiencePoints: [
      "Profesional, akademisi, narasumber, atau calon pembicara yang perlu menyampaikan gagasan di depan audiens.",
      "Peserta yang ingin mempertajam pembukaan, alur pesan, teknik interaktif, dan penanganan sesi tanya jawab.",
      "Cocok bagi peserta yang ingin meningkatkan jam terbang tampil dan menerima evaluasi langsung.",
    ],
    learningIntro:
      "Setiap sesi berfokus pada praktik berbicara di depan kelas dengan umpan balik langsung dari trainer agar perbaikan terasa sejak pertemuan pertama.",
    practiceFormats: [
      "80% praktik presentasi, simulasi panggung, role play, dan studi kasus nyata.",
      "20% coaching, evaluasi performa pribadi, masukan langsung dari trainer, dan kerangka struktur pesan.",
    ],
    fallbackTopics: [
      "Fundamental, opening, dan closing",
      "Struktur pesan",
      "Teknik interaktif dan tanya jawab",
    ],
  },
  "sertifikasi-pembicara-profesional": {
    metaDescription:
      "Program Sertifikasi Pembicara Profesional di Albana Speech Academy Bandung bagi pembicara yang membutuhkan pengakuan kompetensi formal. Lihat jadwal dan info batch.",
    audienceLead:
      "Untukmu yang membutuhkan pengakuan kompetensi secara formal sebagai pembicara.",
    audiencePoints: [
      "Pembicara, trainer, praktisi, atau profesional yang ingin menempuh jalur sertifikasi kompetensi pembicara.",
      "Prasyarat peserta dan teknis asesmen diumumkan secara resmi bersama informasi jadwal batch.",
    ],
    learningIntro:
      "Materi dan alur asesmen program ini disampaikan secara resmi bersama jadwal batch yang diterbitkan admin.",
    practiceFormats: [],
    fallbackTopics: [],
  },
  "inhouse-training": {
    metaDescription:
      "Inhouse Training public speaking dan komunikasi untuk tim, perusahaan, dan instansi bersama Albana Speech Academy. Materi, silabus, dan jadwal disesuaikan kebutuhan.",
    audienceLead:
      "Untuk tim, perusahaan, BUMN, kementerian, maupun organisasi yang membutuhkan pelatihan komunikasi terarah sesuai situasi kerja.",
    audiencePoints: [
      "Tim yang menyiapkan presentasi ke klien, rapat pimpinan, atau penyampaian laporan lintas divisi.",
      "Organisasi yang membutuhkan pelatihan MC internal, moderator acara, service excellence, atau komunikasi kepemimpinan.",
      "Instansi yang ingin materi, silabus, tanggal, dan lokasi pelatihan disesuaikan dengan kebutuhan internal.",
    ],
    learningIntro:
      "Dimulai dari konsultasi bersama tim Albana untuk memetakan tujuan pelatihan, menyusun silabus, lalu menentukan jadwal serta lokasi pelaksanaan di tempat perusahaan atau lokasi yang disepakati.",
    practiceFormats: [
      "Konsultasi kebutuhan tim dan pemetaan situasi bicara yang dihadapi organisasi.",
      "Penyusunan materi dan silabus khusus sesuai profil peserta.",
      "Pelaksanaan pelatihan berbasis praktik langsung, simulasi nyata, dan masukan trainer.",
    ],
    trainingAreas: [
      "Public Speaking",
      "Professional Presentation",
      "MC & Event Communication",
      "Moderator & Host Training",
      "Leadership Communication",
      "Service Excellence",
      "Training of Trainer",
    ],
    fallbackTopics: [],
  },
};

export function getProgramEditorial(slug: string): ProgramEditorial | null {
  return EDITORIAL_BY_SLUG[slug] ?? null;
}

export function resolveProgramTopics(slug: string, cmsTopics: string[]): string[] {
  if (cmsTopics.length > 0) return cmsTopics;
  return EDITORIAL_BY_SLUG[slug]?.fallbackTopics ?? [];
}

export function resolveProgramMetaDescription(slug: string, fallbackSummary: string): string {
  const editorial = EDITORIAL_BY_SLUG[slug];
  if (editorial) return editorial.metaDescription;
  const cleaned = fallbackSummary.replace(/\s+/g, " ").trim();
  return cleaned.length > 158 ? `${cleaned.slice(0, 155).trimEnd()}...` : cleaned;
}
