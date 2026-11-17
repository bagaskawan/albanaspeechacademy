import type { HomeData, HomeMedia } from "./home-data";

const PREVIEW_IMAGES = [
  { src: "/images/preview/praktik-berbicara.jpg", activity: "Praktik berbicara di depan kelas" },
  { src: "/images/preview/diskusi-kelompok.jpg", activity: "Diskusi kelompok peserta" },
  { src: "/images/preview/simulasi-panggung.jpg", activity: "Simulasi panggung" },
  { src: "/images/preview/suasana-kelas.jpg", activity: "Suasana ruang kelas" },
  { src: "/images/preview/latihan-mc.jpg", activity: "Latihan memandu acara" },
  { src: "/images/preview/umpan-balik-trainer.jpg", activity: "Umpan balik langsung dari trainer" },
] as const;

// Foto Unsplash berlisensi bebas (tanpa atribusi wajib); komentar memuat halaman fotonya.
const UNSPLASH_QUERY = "?w=1600&q=80&auto=format&fit=crop";
const UNSPLASH_PHOTOS = [
  // https://unsplash.com/photos/man-speaking-in-front-of-crowd-RfiBK6Y_upQ
  { id: "1544531586-fde5298cdd40", alt: "Pembicara berbicara di depan penonton" },
  // https://unsplash.com/photos/silver-corded-microphone-in-shallow-focus-photography-LETdkk7wHQk
  { id: "1475721027785-f74eccf877e2", alt: "Mikrofon dalam jarak dekat" },
  // https://unsplash.com/photos/speaker-addressing-a-large-audience-in-a-theater-Y-SvKc0Kmn8
  { id: "1774094474808-904ab1ad8586", alt: "Pembicara menyapa penonton besar di teater" },
  // https://unsplash.com/photos/man-presenting-in-office-workspace-wMRIcT86SWU
  { id: "1591115765373-5207764f72e7", alt: "Pria presentasi di ruang kerja" },
  // https://unsplash.com/photos/a-woman-standing-in-front-of-a-crowd-holding-a-microphone-NK02ShlfWDM
  { id: "1715610258704-e8f9f5710fe0", alt: "Perempuan memegang mikrofon di depan penonton" },
  // https://unsplash.com/photos/audience-watching-speaker-on-bright-screen--NXNaE9lu6w
  { id: "1627931539006-d5c4677e05ea", alt: "Penonton menyaksikan pembicara di layar terang" },
  // https://unsplash.com/photos/a-woman-speaking-into-a-microphone-on-a-stage-u6RJY5F3yM8
  { id: "1772419216340-fd8abb4f55de", alt: "Perempuan berbicara dengan mikrofon di panggung" },
  // https://unsplash.com/photos/people-raising-their-hands-4V1dC_eoCwg
  { id: "1477281765962-ef34e8bb0967", alt: "Peserta mengangkat tangan" },
  // https://unsplash.com/photos/a-woman-standing-in-front-of-a-projector-screen-giving-a-presentation-Ra23FmCoeiQ
  { id: "1733222814719-9c756a54ad92", alt: "Perempuan presentasi di depan layar proyektor" },
  // https://unsplash.com/photos/person-discussing-while-standing-in-front-of-a-large-screen-in-front-of-people-inside-dim-lighted-room-bzdhc5b3Bxs
  { id: "1505373877841-8d25f7d46678", alt: "Presenter di depan layar besar di ruangan redup" },
  // https://unsplash.com/photos/speaker-addresses-a-large-audience-at-an-indoor-event-Gn10-uWDna4
  { id: "1782860888850-de50d7b94a84", alt: "Pembicara menyapa audiens di acara dalam ruangan" },
  // https://unsplash.com/photos/crowd-of-people-sitting-on-chairs-inside-room-F2KRf_QfCqw
  { id: "1540575467063-178a50c2df87", alt: "Peserta duduk di ruangan" },
  // https://unsplash.com/photos/an-elderly-asian-man-speaks-animatedly-on-a-stage-_CqOmfCqZ_U
  { id: "1770097286213-6d6fc60f4cdf", alt: "Pria lanjut usia berbicara dengan ekspresif di panggung" },
  // https://unsplash.com/photos/people-sitting-on-chair-inside-room-ID1yWa1Wpx0
  { id: "1594122230689-45899d9e6f69", alt: "Orang-orang duduk di dalam ruangan" },
  // https://unsplash.com/photos/speaker-presents-book-to-audience-on-stage-nyYvpVt8OlU
  { id: "1762968280286-0bfcc4afd0ea", alt: "Pembicara memaparkan materi di panggung" },
  // https://unsplash.com/photos/a-microphone-that-is-on-a-stand-in-the-dark-iuklQeAMVB4
  { id: "1710360683896-e0506fb3579a", alt: "Mikrofon di standar dalam gelap" },
  // https://unsplash.com/photos/man-standing-infront-of-group-of-people-Q7wGvnbuwj0
  { id: "1528605105345-5344ea20e269", alt: "Pria berdiri di depan sekelompok orang" },
  // https://unsplash.com/photos/a-woman-standing-at-a-podium-holding-a-microphone-X0iAUm_mJmA
  { id: "1715610237622-748477adf2e4", alt: "Perempuan di podium memegang mikrofon" },
] as const;

const SAMPLE_SUFFIX = " — contoh visual, bukan dokumentasi kelas Albana";

let nextId = -1;
function previewPhoto(index: number): HomeMedia {
  const item = PREVIEW_IMAGES[index % PREVIEW_IMAGES.length];
  return {
    id: nextId--,
    kind: "image",
    src: item.src,
    poster: null,
    alt: `${item.activity}${SAMPLE_SUFFIX}`,
  };
}

function unsplashPhoto(index: number): HomeMedia {
  const item = UNSPLASH_PHOTOS[index];
  return {
    id: nextId--,
    kind: "image",
    src: `https://images.unsplash.com/photo-${item.id}${UNSPLASH_QUERY}`,
    poster: null,
    alt: `${item.alt}${SAMPLE_SUFFIX}`,
  };
}

function previewVideo(title: string): HomeMedia {
  return {
    id: nextId--,
    kind: "video",
    src: "",
    poster: "/images/preview/simulasi-panggung.jpg",
    alt: `${title} — sematan YouTube tampil setelah data asli tersedia`,
  };
}

export const HOME_DUMMY: HomeData = {
  preview: true,
  hero: {
    photo: previewPhoto(0),
    openPrograms: 2,
    nextBatch: {
      programTitle: "Public Speaking for Speakers",
      batchName: "Batch Contoh 1",
      firstDateLabel: "Minggu, 7 Desember 2026",
      formatLabel: "1 pertemuan",
      statusLabel: "Pendaftaran dibuka",
    },
  },
  programs: [
    {
      card: {
        slug: "public-speaking-series",
        title: "Public Speaking Series",
        summary: "Untukmu yang ingin dasar kuat dan berlatih banyak peran bicara.",
        topics: [
          "Basic Public Speaking",
          "MC formal dan nonformal",
          "Moderator",
          "Presentasi persuasif",
          "Mengelola gugup di panggung",
        ],
        statusLabel: "Pendaftaran dibuka",
        registrationUrl: "/register/public-speaking-series",
        batch: {
          name: "Batch Contoh 1",
          dateLabels: ["Sabtu, 13 Desember 2026", "Minggu, 14 Desember 2026"],
          timeLabel: "09.00–16.00 WIB",
          formatLabel: "2 pertemuan",
          venueLabel: "Albana Speech Academy",
          priceIdr: 750000,
          normalPriceIdr: 950000,
          dpPercent: 20,
        },
      },
      media: [
        previewPhoto(0),
        previewPhoto(1),
        previewPhoto(2),
        previewPhoto(3),
        previewPhoto(4),
        previewPhoto(5),
        previewVideo("Video kegiatan Public Speaking Series"),
      ],
    },
    {
      card: {
        slug: "public-speaking-for-speakers",
        title: "Public Speaking for Speakers",
        summary: "Untukmu yang ingin tampil sebagai pembicara di depan audiens.",
        topics: [
          "Fundamental, opening, dan closing",
          "Struktur pesan",
          "Teknik interaktif dan tanya jawab",
          "Olahraga vokal dan artikulasi",
        ],
        statusLabel: "Pendaftaran dibuka",
        registrationUrl: "/register/public-speaking-for-speakers",
        batch: {
          name: "Batch Contoh 1",
          dateLabels: ["Minggu, 7 Desember 2026"],
          timeLabel: "09.00–16.00 WIB",
          formatLabel: "1 pertemuan",
          venueLabel: "Albana Speech Academy",
          priceIdr: 650000,
          normalPriceIdr: null,
          dpPercent: 20,
        },
      },
      bundleNote: "Tersedia paket dengan Sertifikasi",
      media: [
        previewPhoto(3),
        previewPhoto(4),
        previewPhoto(5),
        previewPhoto(0),
        previewPhoto(1),
        previewVideo("Video kegiatan Public Speaking for Speakers"),
      ],
    },
    {
      card: {
        slug: "sertifikasi-pembicara-profesional",
        title: "Sertifikasi Pembicara Profesional",
        summary: "Untukmu yang membutuhkan pengakuan kompetensi sebagai pembicara.",
        topics: [
          "Asesmen kompetensi pembicara profesional",
          "Penyusunan portofolio dan materi presentasi",
          "Simulasi uji kompetensi bersama asesor",
        ],
        statusLabel: "Jadwal menyusul",
        registrationUrl: null,
        batch: null,
      },
      media: [
        previewPhoto(2),
        previewPhoto(5),
        previewPhoto(0),
        previewPhoto(3),
        previewVideo("Video kegiatan Sertifikasi Pembicara Profesional"),
      ],
    },
  ],
  inhouse: {
    card: {
      slug: "inhouse-training",
      title: "Inhouse Training",
      summary: "Pelatihan di tempat perusahaanmu. Materi, silabus, tanggal, dan waktu kami susun bersama timmu.",
      topics: [],
      statusLabel: "Konsultasi privat dengan tim Albana",
      registrationUrl: null,
      batch: null,
    },
    whatsappHref: "#kontak",
    media: [
      previewPhoto(1),
      previewPhoto(2),
      previewPhoto(4),
      previewPhoto(5),
      previewPhoto(0),
      previewPhoto(3),
      previewVideo("Video dokumentasi Inhouse Training"),
    ],
    partners: Array.from({ length: 6 }, (_, index) => ({
      id: -(index + 100),
      name: "Logo partner",
      logoUrl: null,
    })),
  },
  testimonials: [
    {
      id: -1,
      quote: "Kutipan peserta Public Speaking Series akan tampil di sini setelah disetujui.",
      attribution: "Peserta Public Speaking Series",
      roleLabel: "Contoh testimoni",
    },
    {
      id: -2,
      quote: "Kutipan peserta Public Speaking for Speakers akan tampil di sini setelah disetujui.",
      attribution: "Peserta Public Speaking for Speakers",
      roleLabel: "Contoh testimoni",
    },
    {
      id: -3,
      quote: "Kutipan peserta Sertifikasi Pembicara Profesional akan tampil di sini setelah disetujui.",
      attribution: "Peserta Sertifikasi Pembicara Profesional",
      roleLabel: "Contoh testimoni",
    },
  ],
  moments: UNSPLASH_PHOTOS.map((_, index) => unsplashPhoto(index)),
};
