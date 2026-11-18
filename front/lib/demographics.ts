// Pilihan baku untuk formulir pendaftaran dan dashboard demografi.
// Rancangan: docs/albana-docs/plans/2026-11-18-dashboard-analytics-implementation-plan.md §2.5

// 38 provinsi, 416 kabupaten + 98 kota (Kemendagri, 2022). Format "Kabupaten X" / "Kota X".
const PROVINCES: [kabupaten: string, kota: string][] = [
  ["Aceh Barat|Aceh Barat Daya|Aceh Besar|Aceh Jaya|Aceh Selatan|Aceh Singkil|Aceh Tamiang|Aceh Tengah|Aceh Tenggara|Aceh Timur|Aceh Utara|Bener Meriah|Bireuen|Gayo Lues|Nagan Raya|Pidie|Pidie Jaya|Simeulue", "Banda Aceh|Langsa|Lhokseumawe|Sabang|Subulussalam"],
  ["Asahan|Batu Bara|Dairi|Deli Serdang|Humbang Hasundutan|Karo|Labuhanbatu|Labuhanbatu Selatan|Labuhanbatu Utara|Langkat|Mandailing Natal|Nias|Nias Barat|Nias Selatan|Nias Utara|Padang Lawas|Padang Lawas Utara|Pakpak Bharat|Samosir|Serdang Bedagai|Simalungun|Tapanuli Selatan|Tapanuli Tengah|Tapanuli Utara|Toba", "Binjai|Gunungsitoli|Medan|Padangsidimpuan|Pematangsiantar|Sibolga|Tanjungbalai|Tebing Tinggi"],
  ["Agam|Dharmasraya|Kepulauan Mentawai|Lima Puluh Kota|Padang Pariaman|Pasaman|Pasaman Barat|Pesisir Selatan|Sijunjung|Solok|Solok Selatan|Tanah Datar", "Bukittinggi|Padang|Padang Panjang|Pariaman|Payakumbuh|Sawahlunto|Solok"],
  ["Bengkalis|Indragiri Hilir|Indragiri Hulu|Kampar|Kepulauan Meranti|Kuantan Singingi|Pelalawan|Rokan Hilir|Rokan Hulu|Siak", "Dumai|Pekanbaru"],
  ["Batanghari|Bungo|Kerinci|Merangin|Muaro Jambi|Sarolangun|Tanjung Jabung Barat|Tanjung Jabung Timur|Tebo", "Jambi|Sungai Penuh"],
  ["Banyuasin|Empat Lawang|Lahat|Muara Enim|Musi Banyuasin|Musi Rawas|Musi Rawas Utara|Ogan Ilir|Ogan Komering Ilir|Ogan Komering Ulu|Ogan Komering Ulu Selatan|Ogan Komering Ulu Timur|Penukal Abab Lematang Ilir", "Lubuklinggau|Pagar Alam|Palembang|Prabumulih"],
  ["Bengkulu Selatan|Bengkulu Tengah|Bengkulu Utara|Kaur|Kepahiang|Lebong|Mukomuko|Rejang Lebong|Seluma", "Bengkulu"],
  ["Lampung Barat|Lampung Selatan|Lampung Tengah|Lampung Timur|Lampung Utara|Mesuji|Pesawaran|Pesisir Barat|Pringsewu|Tanggamus|Tulang Bawang|Tulang Bawang Barat|Way Kanan", "Bandar Lampung|Metro"],
  ["Bangka|Bangka Barat|Bangka Selatan|Bangka Tengah|Belitung|Belitung Timur", "Pangkalpinang"],
  ["Bintan|Karimun|Kepulauan Anambas|Lingga|Natuna", "Batam|Tanjungpinang"],
  ["Kepulauan Seribu", "Jakarta Barat|Jakarta Pusat|Jakarta Selatan|Jakarta Timur|Jakarta Utara"],
  ["Bandung|Bandung Barat|Bekasi|Bogor|Ciamis|Cianjur|Cirebon|Garut|Indramayu|Karawang|Kuningan|Majalengka|Pangandaran|Purwakarta|Subang|Sukabumi|Sumedang|Tasikmalaya", "Bandung|Banjar|Bekasi|Bogor|Cimahi|Cirebon|Depok|Sukabumi|Tasikmalaya"],
  ["Banjarnegara|Banyumas|Batang|Blora|Boyolali|Brebes|Cilacap|Demak|Grobogan|Jepara|Karanganyar|Kebumen|Kendal|Klaten|Kudus|Magelang|Pati|Pekalongan|Pemalang|Purbalingga|Purworejo|Rembang|Semarang|Sragen|Sukoharjo|Tegal|Temanggung|Wonogiri|Wonosobo", "Magelang|Pekalongan|Salatiga|Semarang|Surakarta|Tegal"],
  ["Bantul|Gunungkidul|Kulon Progo|Sleman", "Yogyakarta"],
  ["Bangkalan|Banyuwangi|Blitar|Bojonegoro|Bondowoso|Gresik|Jember|Jombang|Kediri|Lamongan|Lumajang|Madiun|Magetan|Malang|Mojokerto|Nganjuk|Ngawi|Pacitan|Pamekasan|Pasuruan|Ponorogo|Probolinggo|Sampang|Sidoarjo|Situbondo|Sumenep|Trenggalek|Tuban|Tulungagung", "Batu|Blitar|Kediri|Madiun|Malang|Mojokerto|Pasuruan|Probolinggo|Surabaya"],
  ["Lebak|Pandeglang|Serang|Tangerang", "Cilegon|Serang|Tangerang|Tangerang Selatan"],
  ["Badung|Bangli|Buleleng|Gianyar|Jembrana|Karangasem|Klungkung|Tabanan", "Denpasar"],
  ["Bima|Dompu|Lombok Barat|Lombok Tengah|Lombok Timur|Lombok Utara|Sumbawa|Sumbawa Barat", "Bima|Mataram"],
  ["Alor|Belu|Ende|Flores Timur|Kupang|Lembata|Malaka|Manggarai|Manggarai Barat|Manggarai Timur|Nagekeo|Ngada|Rote Ndao|Sabu Raijua|Sikka|Sumba Barat|Sumba Barat Daya|Sumba Tengah|Sumba Timur|Timor Tengah Selatan|Timor Tengah Utara", "Kupang"],
  ["Bengkayang|Kapuas Hulu|Kayong Utara|Ketapang|Kubu Raya|Landak|Melawi|Mempawah|Sambas|Sanggau|Sekadau|Sintang", "Pontianak|Singkawang"],
  ["Barito Selatan|Barito Timur|Barito Utara|Gunung Mas|Kapuas|Katingan|Kotawaringin Barat|Kotawaringin Timur|Lamandau|Murung Raya|Pulang Pisau|Seruyan|Sukamara", "Palangka Raya"],
  ["Balangan|Banjar|Barito Kuala|Hulu Sungai Selatan|Hulu Sungai Tengah|Hulu Sungai Utara|Kotabaru|Tabalong|Tanah Bumbu|Tanah Laut|Tapin", "Banjarbaru|Banjarmasin"],
  ["Berau|Kutai Barat|Kutai Kartanegara|Kutai Timur|Mahakam Ulu|Paser|Penajam Paser Utara", "Balikpapan|Bontang|Samarinda"],
  ["Bulungan|Malinau|Nunukan|Tana Tidung", "Tarakan"],
  ["Bolaang Mongondow|Bolaang Mongondow Selatan|Bolaang Mongondow Timur|Bolaang Mongondow Utara|Kepulauan Sangihe|Kepulauan Siau Tagulandang Biaro|Kepulauan Talaud|Minahasa|Minahasa Selatan|Minahasa Tenggara|Minahasa Utara", "Bitung|Kotamobagu|Manado|Tomohon"],
  ["Boalemo|Bone Bolango|Gorontalo|Gorontalo Utara|Pohuwato", "Gorontalo"],
  ["Banggai|Banggai Kepulauan|Banggai Laut|Buol|Donggala|Morowali|Morowali Utara|Parigi Moutong|Poso|Sigi|Tojo Una-Una|Tolitoli", "Palu"],
  ["Majene|Mamasa|Mamuju|Mamuju Tengah|Pasangkayu|Polewali Mandar", ""],
  ["Bantaeng|Barru|Bone|Bulukumba|Enrekang|Gowa|Jeneponto|Kepulauan Selayar|Luwu|Luwu Timur|Luwu Utara|Maros|Pangkajene dan Kepulauan|Pinrang|Sidenreng Rappang|Sinjai|Soppeng|Takalar|Tana Toraja|Toraja Utara|Wajo", "Makassar|Palopo|Parepare"],
  ["Bombana|Buton|Buton Selatan|Buton Tengah|Buton Utara|Kolaka|Kolaka Timur|Kolaka Utara|Konawe|Konawe Kepulauan|Konawe Selatan|Konawe Utara|Muna|Muna Barat|Wakatobi", "Baubau|Kendari"],
  ["Buru|Buru Selatan|Kepulauan Aru|Kepulauan Tanimbar|Maluku Barat Daya|Maluku Tengah|Maluku Tenggara|Seram Bagian Barat|Seram Bagian Timur", "Ambon|Tual"],
  ["Halmahera Barat|Halmahera Selatan|Halmahera Tengah|Halmahera Timur|Halmahera Utara|Kepulauan Sula|Pulau Morotai|Pulau Taliabu", "Ternate|Tidore Kepulauan"],
  ["Biak Numfor|Jayapura|Keerom|Kepulauan Yapen|Mamberamo Raya|Sarmi|Supiori|Waropen", "Jayapura"],
  ["Fakfak|Kaimana|Manokwari|Manokwari Selatan|Pegunungan Arfak|Teluk Bintuni|Teluk Wondama", ""],
  ["Maybrat|Raja Ampat|Sorong|Sorong Selatan|Tambrauw", "Sorong"],
  ["Asmat|Boven Digoel|Mappi|Merauke", ""],
  ["Deiyai|Dogiyai|Intan Jaya|Mimika|Nabire|Paniai|Puncak|Puncak Jaya", ""],
  ["Jayawijaya|Lanny Jaya|Mamberamo Tengah|Nduga|Pegunungan Bintang|Tolikara|Yahukimo|Yalimo", ""],
];

const split = (names: string) => (names ? names.split("|") : []);

export const OUTSIDE_INDONESIA = "Luar Indonesia";

/** Kota lebih dulu (lebih sering dicari), lalu kabupaten, keduanya urut abjad. */
export const REGIONS: readonly string[] = [
  ...PROVINCES.flatMap(([, kota]) => split(kota).map((name) => `Kota ${name}`)).sort((a, b) => a.localeCompare(b, "id")),
  ...PROVINCES.flatMap(([kab]) => split(kab).map((name) => `Kabupaten ${name}`)).sort((a, b) => a.localeCompare(b, "id")),
  OUTSIDE_INDONESIA,
];

const byKey = new Map(REGIONS.map((name) => [name.toLowerCase(), name]));

/** Nama baku dari daftar, tanpa membedakan huruf besar dan spasi berlebih; `null` bila tidak ada di daftar. */
export function canonicalRegion(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return byKey.get(value.trim().replace(/\s+/g, " ").toLowerCase()) ?? null;
}

export const professionOptions = [
  { value: "pelajar_mahasiswa", label: "Pelajar atau mahasiswa" },
  { value: "karyawan_swasta", label: "Karyawan swasta" },
  { value: "asn_bumn", label: "ASN, TNI/Polri, atau BUMN" },
  { value: "wirausaha", label: "Wirausaha" },
  { value: "pengajar", label: "Guru, dosen, atau pengajar" },
  { value: "profesional", label: "Profesional mandiri (MC, trainer, konsultan)" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export type ProfessionCategory = (typeof professionOptions)[number]["value"];

export const isProfessionCategory = (value: unknown): value is ProfessionCategory =>
  professionOptions.some((option) => option.value === value);

export const professionLabel = (value: ProfessionCategory) =>
  professionOptions.find((option) => option.value === value)!.label;
