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
  // https://unsplash.com/photos/a-group-of-people-in-a-room-with-a-projector-screen-1-aA2Fadydc
  { id: "1524178232363-1fb2b075b655", alt: "Sekelompok orang di ruangan dengan layar proyektor" },
  // https://unsplash.com/photos/man-standing-in-front-of-people-sitting-beside-table-with-laptop-computers-gMsnXqILjp4
  { id: "1542744173-8e7e53415bb0", alt: "Pria memandu peserta yang duduk dengan laptop" },
  // https://unsplash.com/photos/woman-speaking-at-brick-walled-conference-wn7dOzUh3Rs
  { id: "1576085898323-218337e3e43c", alt: "Perempuan berbicara di podium ruangan berdinding bata" },
  // https://unsplash.com/photos/a-group-of-people-sitting-in-chairs-in-a-room-7hxOWrk-8RI
  { id: "1638957835514-224c57ffe617", alt: "Sekelompok orang duduk di kursi dalam ruangan" },
  // https://unsplash.com/photos/man-standing-in-stage-beside-blue-curtain-lVTtqIY6pL0
  { id: "1560439513-74b037a25d84", alt: "Pria berdiri di panggung dekat tirai biru" },
  // https://unsplash.com/photos/man-presenting-charts-to-colleagues-in-a-meeting-rOvpex8XDeU
  { id: "1758691736490-03d39c292d7a", alt: "Pria memaparkan grafik kepada rekan dalam rapat" },
  // https://unsplash.com/photos/person-standing-in-front-of-brown-lectern-gYf49RB7bvE
  { id: "1515603403036-f3d35f75ca52", alt: "Orang berdiri di depan mimbar cokelat" },
  // https://unsplash.com/photos/a-man-standing-in-front-of-a-group-of-people-3kc_75Rdgyk
  { id: "1646579886135-068c73800308", alt: "Pria berdiri di depan sekelompok orang" },
  // https://unsplash.com/photos/a-large-group-of-people-sitting-in-a-room-uS96C8JD17c
  { id: "1733222764895-9bf3a19162fe", alt: "Kelompok besar orang duduk dalam ruangan" },
  // https://unsplash.com/photos/man-presenting-to-colleagues-in-a-modern-office-setting-SvYifX5HkeQ
  { id: "1758691736548-073bc97cdff4", alt: "Pria presentasi kepada rekan di kantor modern" },
  // https://unsplash.com/photos/people-in-conference-with-projector-screen-in-front-xeEukPZjZi0
  { id: "1560439514-0fc9d2cd5e1b", alt: "Peserta konferensi dengan layar proyektor di depan" },
  // https://unsplash.com/photos/a-woman-explaining-something-to-a-group-of-people-XH8chLuj02g
  { id: "1664382953481-141e97ad9825", alt: "Perempuan menjelaskan sesuatu kepada sekelompok orang" },
  // https://unsplash.com/photos/young-man-giving-a-presentation-in-a-classroom-setting-nqyDjSTwCTo
  { id: "1781722526001-d3197c7a8088", alt: "Pemuda presentasi di ruang kelas" },
  // https://unsplash.com/photos/people-listening-to-presenter-in-classroom-b-k28YDVJxU
  { id: "1792783221454-304e20182d00", alt: "Peserta kelas menyimak presenter di dekat layar" },
  // https://unsplash.com/photos/teacher-lecturing-students-in-a-classroom-setting-14jNrPntbgk
  { id: "1758270704925-fa59d93119c1", alt: "Pengajar menerangkan materi di ruang kelas" },
  // https://unsplash.com/photos/teacher-asking-a-question-to-students-in-a-classroom-BBetMyb5ePA
  { id: "1758270704021-361c165d68fd", alt: "Pengajar mengajukan pertanyaan kepada kelas" },
  // https://unsplash.com/photos/business-people-in-a-modern-conference-room-during-a-presentation-l0E0Y1TdzxE
  { id: "1758691736067-b309ee3ef7b9", alt: "Presentasi di ruang konferensi modern" },
  // https://unsplash.com/photos/woman-presenting-to-audience-in-a-modern-office-meeting-room--Lzdk59aldE
  { id: "1758691736664-0b83e4f1215e", alt: "Perempuan presentasi di ruang rapat modern" },
] as const;

const SAMPLE_SUFFIX = " — contoh visual, bukan dokumentasi kelas Albana";

let nextId = -1;
function previewPhoto(index: number): HomeMedia {
  const item = PREVIEW_IMAGES[index];
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

function previewVideo(title: string, posterIndex: number): HomeMedia {
  return {
    id: nextId--,
    kind: "video",
    src: "",
    poster: PREVIEW_IMAGES[posterIndex].src,
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
        unsplashPhoto(0),
        unsplashPhoto(1),
        unsplashPhoto(2),
        unsplashPhoto(3),
        unsplashPhoto(4),
        unsplashPhoto(5),
        previewVideo("Video kegiatan Public Speaking Series", 1),
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
        unsplashPhoto(6),
        unsplashPhoto(7),
        unsplashPhoto(8),
        unsplashPhoto(9),
        unsplashPhoto(10),
        previewVideo("Video kegiatan Public Speaking for Speakers", 2),
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
        unsplashPhoto(11),
        unsplashPhoto(12),
        unsplashPhoto(13),
        unsplashPhoto(14),
        previewVideo("Video kegiatan Sertifikasi Pembicara Profesional", 3),
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
      previewPhoto(5),
      unsplashPhoto(15),
      unsplashPhoto(16),
      unsplashPhoto(17),
      unsplashPhoto(18),
      unsplashPhoto(19),
      previewVideo("Video dokumentasi Inhouse Training", 4),
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
  moments: Array.from({ length: UNSPLASH_PHOTOS.length - 20 }, (_, index) => unsplashPhoto(index + 20)),
};
