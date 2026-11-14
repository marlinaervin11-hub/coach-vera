export type SectionId = 1 | 2 | 3 | 4 | 5 | 6;

export interface AssessmentData {
  // Section 1: Data Diri (Identitas)
  namaLengkap: string;
  email: string;
  whatsapp: string;
  usia: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan' | '';
  tinggiBadan: string;
  beratBadan: string;

  // Section 2: Goal & Riwayat
  goalUtama: string[];
  goalLainnya: string;
  kapanMulai: string;
  pernahDicoba: string[];
  pernahDicobaLainnya: string;

  // Section 3: Pola Makan (Nutrisi)
  makanDiLuarPerMinggu: string;
  jenisMakanDiLuar: string;
  frekuensiProtein: 'Selalu' | 'Sering' | 'Jarang' | '';
  minumanManisPerHari: string;
  frekuensiNgemil: string;
  responTelatMakan: string;
  responTelatMakanDetail: string;

  // Section 4: Aktivitas Fisik & Energi
  energiSore: string;
  kafeinPerHari: string;
  rasaBangunPagi: string;
  stamina5Tahun: 'Lebih baik' | 'Sama' | 'Buruk' | '';
  fokusKerja: string;
  langkahHarian: string;
  latihanBebanPerMinggu: string;
  jamDudukPerHari: string;
  naikTangga3Lantai: string;

  // Section 5: Tidur & Stres
  jamTidurRataRata: string;
  waktuSampaiTertidur: string;
  cekHpMenjelangTidur: string;
  levelStresKerja: number | null;
  frekuensiKebangunMalam: string;

  // Section 6: Refleksi & Keyakinan
  trenBeratBadan3Tahun: 'Naik' | 'Turun' | 'Stabil' | '';
  lingkarPerutUkuranCelana: string;
  siklusDietYoyo: string;
  ukurKomposisiTubuh: string;
  keyakinanPahamTubuh: number | null;
}

export interface SectionMeta {
  id: SectionId;
  shortTitle: string;
  title: string;
  subtitle: string;
  estimatedMinutes: string;
  requiredFields: (keyof AssessmentData)[];
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 1,
    shortTitle: 'Data Diri',
    title: '01. Data Diri (Identitas)',
    subtitle: 'Informasi dasar untuk menghitung profil fisiologis dan menghubungi kamu.',
    estimatedMinutes: '1 menit',
    requiredFields: [
      'namaLengkap',
      'email',
      'whatsapp',
      'usia',
      'jenisKelamin',
      'tinggiBadan',
      'beratBadan',
    ],
  },
  {
    id: 2,
    shortTitle: 'Goal & Riwayat',
    title: '02. Goal & Riwayat',
    subtitle: 'Tujuan utama yang ingin kamu capai serta pengalaman program sebelumnya.',
    estimatedMinutes: '1 menit',
    requiredFields: ['goalUtama', 'kapanMulai', 'pernahDicoba'],
  },
  {
    id: 3,
    shortTitle: 'Pola Makan',
    title: '03. Pola Makan (Nutrisi)',
    subtitle: 'Kebiasaan makan harian, asupan protein, minuman manis, dan respons saat sibuk.',
    estimatedMinutes: '2 menit',
    requiredFields: [
      'makanDiLuarPerMinggu',
      'jenisMakanDiLuar',
      'frekuensiProtein',
      'minumanManisPerHari',
      'frekuensiNgemil',
      'responTelatMakan',
    ],
  },
  {
    id: 4,
    shortTitle: 'Aktivitas & Energi',
    title: '04. Aktivitas Fisik & Energi',
    subtitle: 'Ritme energi sepanjang hari, fokus kerja, kebiasaan gerak, dan kapasitas fisik.',
    estimatedMinutes: '3 menit',
    requiredFields: [
      'energiSore',
      'kafeinPerHari',
      'rasaBangunPagi',
      'stamina5Tahun',
      'fokusKerja',
      'langkahHarian',
      'latihanBebanPerMinggu',
      'jamDudukPerHari',
      'naikTangga3Lantai',
    ],
  },
  {
    id: 5,
    shortTitle: 'Tidur & Stres',
    title: '05. Tidur & Stres',
    subtitle: 'Kualitas pemulihan malam hari, paparan layar, dan beban stres kerja saat ini.',
    estimatedMinutes: '2 menit',
    requiredFields: [
      'jamTidurRataRata',
      'waktuSampaiTertidur',
      'cekHpMenjelangTidur',
      'levelStresKerja',
      'frekuensiKebangunMalam',
    ],
  },
  {
    id: 6,
    shortTitle: 'Refleksi',
    title: '06. Refleksi & Keyakinan',
    subtitle: 'Tren perubahan tubuh dalam 3 tahun terakhir dan pemahamanmu terhadap kondisi saat ini.',
    estimatedMinutes: '2 menit',
    requiredFields: [
      'trenBeratBadan3Tahun',
      'lingkarPerutUkuranCelana',
      'siklusDietYoyo',
      'ukurKomposisiTubuh',
      'keyakinanPahamTubuh',
    ],
  },
];

export const INITIAL_DATA: AssessmentData = {
  namaLengkap: '',
  email: '',
  whatsapp: '',
  usia: '',
  jenisKelamin: '',
  tinggiBadan: '',
  beratBadan: '',

  goalUtama: [],
  goalLainnya: '',
  kapanMulai: '',
  pernahDicoba: [],
  pernahDicobaLainnya: '',

  makanDiLuarPerMinggu: '',
  jenisMakanDiLuar: '',
  frekuensiProtein: '',
  minumanManisPerHari: '',
  frekuensiNgemil: '',
  responTelatMakan: '',
  responTelatMakanDetail: '',

  energiSore: '',
  kafeinPerHari: '',
  rasaBangunPagi: '',
  stamina5Tahun: '',
  fokusKerja: '',
  langkahHarian: '',
  latihanBebanPerMinggu: '',
  jamDudukPerHari: '',
  naikTangga3Lantai: '',

  jamTidurRataRata: '',
  waktuSampaiTertidur: '',
  cekHpMenjelangTidur: '',
  levelStresKerja: null,
  frekuensiKebangunMalam: '',

  trenBeratBadan3Tahun: '',
  lingkarPerutUkuranCelana: '',
  siklusDietYoyo: '',
  ukurKomposisiTubuh: '',
  keyakinanPahamTubuh: null,
};

export const GOAL_OPTIONS = [
  'Menurunkan berat badan & lemak tubuh',
  'Membentuk massa otot & kekuatan fisik',
  'Meningkatkan energi & fokus saat bekerja',
  'Memperbaiki pola makan & kesehatan pencernaan',
  'Mengelola stres & memperbaiki kualitas tidur',
  'Menjaga kebugaran serta kesehatan jangka panjang',
];

export const KAPAN_MULAI_OPTIONS = [
  'Secepatnya (minggu ini)',
  'Awal bulan depan',
  'Dalam 1–3 bulan ke depan',
  'Masih melihat-lihat dan mencari informasi dulu',
];

export const PERNAH_DICOBA_OPTIONS = [
  'Diet defisit kalori / diet ketat sendiri',
  'Keto / Low-carb / Intermittent Fasting',
  'Gym / latihan beban mandiri',
  'Lari, bersepeda, atau kelas kardio',
  'Minuman pelangsing atau suplemen pembakar lemak',
  'Konsultasi ahli gizi / Personal Trainer',
  'Belum pernah mencoba program terstruktur',
];

export const JENIS_MAKAN_DI_LUAR_OPTIONS = [
  'Pesan makanan online (GoFood / GrabFood / ShopeeFood)',
  'Dinner atau makan siang bersama klien / rekan kerja',
  'Keduanya sama seringnya terjadi dalam seminggu',
  'Jarang keduanya — lebih sering masak atau bawa bekal',
];

export const PROTEIN_OPTIONS: { value: 'Selalu' | 'Sering' | 'Jarang'; desc: string }[] = [
  { value: 'Selalu', desc: 'Ada di hampir setiap waktu makan (pagi, siang, malam)' },
  { value: 'Sering', desc: 'Ada di sebagian besar makan utama, kadang terlewat' },
  { value: 'Jarang', desc: 'Lebih dominan karbohidrat, lauk protein hanya sesekali' },
];

export const NGEMIL_OPTIONS = [
  'Hampir tidak pernah',
  '1–2 kali sehari (terkontrol)',
  '3 kali atau lebih per hari',
  'Sering ngemil saat stres, bosan, atau lembur',
];

export const RESPON_TELAT_MAKAN_OPTIONS = [
  'Makan porsi jauh lebih besar / kalap saat akhirnya makan',
  'Menggantinya dengan kopi, camilan manis, atau gorengan',
  'Perut terasa perih / maag kambuh dan badan lemas',
  'Tetap tenang dan makan dengan porsi normal seperti biasa',
];

export const STAMINA_OPTIONS: { value: 'Lebih baik' | 'Sama' | 'Buruk'; desc: string }[] = [
  { value: 'Lebih baik', desc: 'Terasa lebih bugar dan kuat dibanding 5 tahun lalu' },
  { value: 'Sama', desc: 'Relatif tidak ada perubahan berarti' },
  { value: 'Buruk', desc: 'Cepat lelah dan napas terasa lebih pendek dari dulu' },
];

export const LANGKAH_OPTIONS = [
  '< 3.000 langkah (mayoritas di meja / kendaraan)',
  '3.000 – 5.000 langkah (aktivitas ringan harian)',
  '5.000 – 10.000 langkah (cukup aktif bergerak)',
  '> 10.000 langkah (sangat aktif sepanjang hari)',
];

export const CEK_HP_OPTIONS = [
  'Selalu — sampai tertidur masih memegang HP',
  'Sering — hampir setiap malam sebelum tidur',
  'Kadang-kadang — hanya jika ada pesan mendesak',
  'Tidak pernah — HP disimpan jauh sebelum jam tidur',
];

export const KEBANGUN_MALAM_OPTIONS = [
  'Tidak pernah, tidur nyenyak sampai pagi',
  'Jarang (1–2 kali seminggu)',
  'Sering (3–5 kali seminggu)',
  'Hampir setiap malam dan sulit tidur lagi',
];

export const TREN_BB_OPTIONS: { value: 'Naik' | 'Turun' | 'Stabil'; desc: string }[] = [
  { value: 'Naik', desc: 'Cenderung bertambah secara bertahap atau drastis' },
  { value: 'Turun', desc: 'Mengalami penurunan berat badan' },
  { value: 'Stabil', desc: 'Fluktuasi kecil di kisaran 1–2 kg saja' },
];

export const DIET_YOYO_OPTIONS = [
  'Belum pernah mencoba diet',
  '1–2 kali berat turun lalu naik kembali',
  '3–5 kali mengalami siklus turun-naik',
  'Lebih dari 5 kali (sering mengalami efek yoyo)',
];

export const KOMPOSISI_TUBUH_OPTIONS = [
  'Ya, rutin cek dengan InBody / DEXA / smart scale',
  'Pernah 1–2 kali saja',
  'Belum pernah sama sekali',
];

export const DEMO_DATA: AssessmentData = {
  namaLengkap: 'Raka Pratama Wijaya',
  email: 'raka.pratama@perusahaan.co.id',
  whatsapp: '081234567890',
  usia: '32',
  jenisKelamin: 'Laki-laki',
  tinggiBadan: '174',
  beratBadan: '84',

  goalUtama: [
    'Menurunkan berat badan & lemak tubuh',
    'Meningkatkan energi & fokus saat bekerja',
  ],
  goalLainnya: '',
  kapanMulai: 'Secepatnya (minggu ini)',
  pernahDicoba: [
    'Diet defisit kalori / diet ketat sendiri',
    'Keto / Low-carb / Intermittent Fasting',
    'Gym / latihan beban mandiri',
  ],
  pernahDicobaLainnya: '',

  makanDiLuarPerMinggu: '5',
  jenisMakanDiLuar: 'Keduanya sama seringnya terjadi dalam seminggu',
  frekuensiProtein: 'Sering',
  minumanManisPerHari: '2',
  frekuensiNgemil: 'Sering ngemil saat stres, bosan, atau lembur',
  responTelatMakan: 'Makan porsi jauh lebih besar / kalap saat akhirnya makan',
  responTelatMakanDetail: 'Biasanya kalau rapat sampai jam 2 siang, langsung pesan porsi dobel plus es kopi susu.',

  energiSore: 'Sering ngantuk berat sekitar jam 2–3 sore, susah konsentrasi dan butuh kopi kedua.',
  kafeinPerHari: '2',
  rasaBangunPagi: 'Masih terasa berat dan pegal di punggung bawah, butuh 30 menit sampai benar-benar sadar.',
  stamina5Tahun: 'Buruk',
  fokusKerja: 'Pagi hari cukup tajam, tapi setelah makan siang sering brain fog terutama kalau banyak meeting.',
  langkahHarian: '3.000 – 5.000 langkah (aktivitas ringan harian)',
  latihanBebanPerMinggu: '1',
  jamDudukPerHari: '9',
  naikTangga3Lantai: 'Napas mulai terengah-engah di lantai 2 dan paha terasa cukup berat.',

  jamTidurRataRata: '6',
  waktuSampaiTertidur: 'Sekitar 30–45 menit karena pikiran masih memutar pekerjaan besok.',
  cekHpMenjelangTidur: 'Sering — hampir setiap malam sebelum tidur',
  levelStresKerja: 7,
  frekuensiKebangunMalam: 'Jarang (1–2 kali seminggu)',

  trenBeratBadan3Tahun: 'Naik',
  lingkarPerutUkuranCelana: 'Celana naik dari ukuran 31 ke 34 dalam 3 tahun terakhir, lingkar perut terasa paling menumpuk.',
  siklusDietYoyo: '3–5 kali mengalami siklus turun-naik',
  ukurKomposisiTubuh: 'Pernah 1–2 kali saja',
  keyakinanPahamTubuh: 5,
};
