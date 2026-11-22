import assert from "node:assert/strict";
import test from "node:test";
import { buildMoments, nextBatchOf, pickBreakPhotos, pickHeroPhoto, toHomeMedia } from "./home-derive.ts";

function img(id, src = `/api/media/${id}`) {
  return { id, kind: "image", src, poster: null, alt: `Foto ${id}` };
}

function vid(id) {
  return { id, kind: "video", src: "https://www.youtube-nocookie.com/embed/abc", poster: "https://i.ytimg.com/vi/abc/hqdefault.jpg", alt: `Video ${id}` };
}

function prog(slug, media) {
  return {
    card: {
      slug,
      title: slug,
      summary: "Ringkasan",
      topics: [],
      statusLabel: "Jadwal menyusul",
      registrationUrl: null,
      batch: null,
    },
    media,
  };
}

test("toHomeMedia memetakan video YouTube dan foto storage", () => {
  const video = toHomeMedia({
    id: 10,
    kind: "video",
    provider: "youtube",
    src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    alt: "Video kelas",
    youtubeId: "dQw4w9WgXcQ",
  });
  assert.equal(video.poster, "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  assert.equal(video.kind, "video");

  const photo = toHomeMedia({
    id: 11,
    kind: "image",
    provider: "supabase_storage",
    src: "/api/media/11",
    alt: "Foto kelas",
    youtubeId: null,
  });
  assert.equal(photo.poster, null);
  assert.equal(photo.src, "/api/media/11");
});

test("pickHeroPhoto memilih foto pertama dari series, lalu speakers, sertifikasi, inhouse", () => {
  const seriesPhoto = img(1);
  const speakersPhoto = img(2);
  const inhousePhoto = img(3);

  assert.equal(
    pickHeroPhoto([prog("public-speaking-series", [vid(9), seriesPhoto]), prog("public-speaking-for-speakers", [speakersPhoto])], [inhousePhoto])?.id,
    1,
  );
  assert.equal(
    pickHeroPhoto([prog("public-speaking-series", [vid(9)]), prog("public-speaking-for-speakers", [speakersPhoto])], [inhousePhoto])?.id,
    2,
  );
  assert.equal(
    pickHeroPhoto([prog("public-speaking-series", []), prog("public-speaking-for-speakers", [])], [inhousePhoto])?.id,
    3,
  );
  assert.equal(pickHeroPhoto([], []), null);
});

test("buildMoments mengecualikan id exclude, menghapus src ganda, dan menyaring video", () => {
  const programs = [
    prog("public-speaking-series", [img(1), img(2), vid(99)]),
    prog("public-speaking-for-speakers", [img(3), img(4, "/api/media/2")]),
  ];
  const inhouse = [img(5)];
  const moments = buildMoments(programs, inhouse, [1]);

  assert.deepEqual(
    moments.map((m) => m.id),
    [3, 5, 2],
  );
  assert.equal(moments.some((m) => m.kind === "video"), false);
});

test("nextBatchOf memilih tanggal paling awal di antara kartu yang dibuka", () => {
  const cards = [
    {
      slug: "public-speaking-series",
      title: "Public Speaking Series",
      summary: "Ringkasan",
      topics: [],
      statusLabel: "Pendaftaran dibuka",
      registrationUrl: "/register/public-speaking-series",
      batch: {
        name: "Batch 2",
        dateLabels: ["Sabtu, 19 Desember 2026"],
        timeLabel: "09.00–16.00 WIB",
        formatLabel: "2 pertemuan",
        venueLabel: "Bandung",
        priceIdr: 1000000,
        normalPriceIdr: null,
        dpPercent: null,
      },
    },
    {
      slug: "public-speaking-for-speakers",
      title: "Public Speaking for Speakers",
      summary: "Ringkasan",
      topics: [],
      statusLabel: "Pendaftaran dibuka",
      registrationUrl: "/register/public-speaking-for-speakers",
      batch: {
        name: "Batch 1",
        dateLabels: ["Minggu, 7 Desember 2026"],
        timeLabel: "09.00–16.00 WIB",
        formatLabel: "1 pertemuan",
        venueLabel: "Bandung",
        priceIdr: 1000000,
        normalPriceIdr: null,
        dpPercent: null,
      },
    },
    {
      slug: "sertifikasi-pembicara-profesional",
      title: "Sertifikasi",
      summary: "Ringkasan",
      topics: [],
      statusLabel: "Pendaftaran ditutup",
      registrationUrl: null,
      batch: {
        name: "Batch 0",
        dateLabels: ["Minggu, 1 November 2026"],
        timeLabel: "09.00–16.00 WIB",
        formatLabel: "1 pertemuan",
        venueLabel: "Bandung",
        priceIdr: 1000000,
        normalPriceIdr: null,
        dpPercent: null,
      },
    },
  ];

  assert.deepEqual(nextBatchOf(cards), {
    programTitle: "Public Speaking for Speakers",
    batchName: "Batch 1",
    firstDateLabel: "Minggu, 7 Desember 2026",
    formatLabel: "1 pertemuan",
    statusLabel: "Pendaftaran dibuka",
  });

  assert.equal(
    nextBatchOf(cards.map((c) => ({ ...c, registrationUrl: null }))),
    null,
  );
});

test("pickBreakPhotos mengikuti urutan slot, bukan urutan galeri", () => {
  const gallery = [img(25), img(24), img(23), img(22), img(21)];
  const picked = pickBreakPhotos(gallery, [[25], [24, 23], [22]]);
  assert.deepEqual(picked.map((slot) => slot.map((m) => m.id)), [[25], [24, 23], [22]]);
  assert.deepEqual(pickBreakPhotos(gallery, [[23, 24]])[0].map((m) => m.id), [23, 24]);
});

test("pickBreakPhotos membuang ID yang hilang dari galeri", () => {
  const gallery = [img(25), img(23), img(22)];
  assert.deepEqual(
    pickBreakPhotos(gallery, [[25], [24, 23], [22]]).map((slot) => slot.map((m) => m.id)),
    [[25], [23], [22]],
  );
  assert.deepEqual(pickBreakPhotos([], [[25], [24]]), [[], []]);
});

test("buildMoments mengecualikan ID pemisah dan hero", () => {
  const gallery = [33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22].map((id) => img(id));
  const moments = buildMoments([], gallery, [26, 25, 24, 23, 22]);
  assert.deepEqual(moments.map((m) => m.id), [33, 32, 31, 30, 29, 28, 27]);
});
