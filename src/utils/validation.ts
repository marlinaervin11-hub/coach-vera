import { AssessmentData, SECTIONS, SectionId } from '../types/assessment';

export type FormErrors = Partial<Record<keyof AssessmentData, string>>;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || trimmed.includes('..')) return false;
  if (!EMAIL_REGEX.test(trimmed)) return false;
  const domainParts = trimmed.split('@')[1]?.split('.') ?? [];
  const tld = domainParts[domainParts.length - 1] ?? '';
  return tld.length >= 2;
}

export function isValidWhatsApp(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  if (!/^\+?\d+$/.test(cleaned)) return false;
  const digits = cleaned.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

export function validateField(
  field: keyof AssessmentData,
  data: AssessmentData
): string | undefined {
  const val = data[field];

  switch (field) {
    case 'namaLengkap':
      if (!String(val).trim()) return 'Nama lengkap wajib diisi.';
      if (String(val).trim().length < 2) return 'Nama lengkap minimal 2 karakter.';
      return undefined;

    case 'email': {
      const trimmed = String(val).trim();
      if (!trimmed) return 'Alamat email wajib diisi.';
      if (!isValidEmail(trimmed)) {
        return 'Format email belum valid (contoh: nama@domain.com).';
      }
      return undefined;
    }

    case 'whatsapp': {
      const trimmed = String(val).trim();
      if (!trimmed) return 'Nomor WhatsApp wajib diisi.';
      if (!isValidWhatsApp(trimmed)) {
        return 'Masukkan nomor WhatsApp yang valid (9–15 digit, mis. 08123456789).';
      }
      return undefined;
    }

    case 'usia': {
      if (String(val).trim() === '') return 'Usia wajib diisi.';
      const num = Number(val);
      if (Number.isNaN(num) || num < 10 || num > 110) {
        return 'Masukkan usia yang wajar (10–110 tahun).';
      }
      return undefined;
    }

    case 'jenisKelamin':
      if (!val) return 'Pilih jenis kelamin.';
      return undefined;

    case 'tinggiBadan': {
      if (String(val).trim() === '') return 'Tinggi badan wajib diisi.';
      const num = Number(val);
      if (Number.isNaN(num) || num < 80 || num > 250) {
        return 'Masukkan tinggi badan dalam cm (80–250 cm).';
      }
      return undefined;
    }

    case 'beratBadan': {
      if (String(val).trim() === '') return 'Berat badan wajib diisi.';
      const num = Number(val);
      if (Number.isNaN(num) || num < 25 || num > 300) {
        return 'Masukkan berat badan dalam kg (25–300 kg).';
      }
      return undefined;
    }

    case 'goalUtama':
      if (!Array.isArray(val) || val.length === 0) {
        return 'Pilih minimal 1 goal utama kamu.';
      }
      return undefined;

    case 'kapanMulai':
      if (!val) return 'Pilih kapan kamu berencana mulai.';
      return undefined;

    case 'pernahDicoba':
      if (!Array.isArray(val) || val.length === 0) {
        return 'Pilih minimal 1 opsi pengalaman yang pernah kamu coba.';
      }
      return undefined;

    case 'makanDiLuarPerMinggu': {
      if (String(val).trim() === '') return 'Jumlah makan di luar per minggu wajib diisi.';
      const num = Number(val);
      if (Number.isNaN(num) || num < 0 || num > 35) {
        return 'Masukkan angka antara 0 hingga 35 kali.';
      }
      return undefined;
    }

    case 'jenisMakanDiLuar':
      if (!val) return 'Pilih kebiasaan yang paling sering terjadi.';
      return undefined;

    case 'frekuensiProtein':
      if (!val) return 'Pilih seberapa sering protein ada di piring kamu.';
      return undefined;

    case 'minumanManisPerHari': {
      if (String(val).trim() === '') return 'Jumlah minuman manis per hari wajib diisi (isi 0 jika tidak ada).';
      const num = Number(val);
      if (Number.isNaN(num) || num < 0 || num > 20) {
        return 'Masukkan angka yang wajar (0–20 gelas).';
      }
      return undefined;
    }

    case 'frekuensiNgemil':
      if (!val) return 'Pilih frekuensi ngemil kamu.';
      return undefined;

    case 'responTelatMakan':
      if (!val) return 'Pilih kebiasaanmu saat telat makan.';
      return undefined;

    case 'energiSore':
      if (!String(val).trim()) return 'Ceritakan kondisi energimu di jam 2–4 sore.';
      return undefined;

    case 'kafeinPerHari': {
      if (String(val).trim() === '') return 'Jumlah gelas kopi/kafein wajib diisi (isi 0 jika tidak minum).';
      const num = Number(val);
      if (Number.isNaN(num) || num < 0 || num > 15) {
        return 'Masukkan angka yang wajar (0–15 gelas).';
      }
      return undefined;
    }

    case 'rasaBangunPagi':
      if (!String(val).trim()) return 'Ceritakan apa yang kamu rasakan saat bangun pagi.';
      return undefined;

    case 'stamina5Tahun':
      if (!val) return 'Pilih perbandingan staminamu dengan 5 tahun lalu.';
      return undefined;

    case 'fokusKerja':
      if (!String(val).trim()) return 'Jelaskan kondisi fokus dan kejernihan pikiranmu saat bekerja.';
      return undefined;

    case 'langkahHarian':
      if (!val) return 'Pilih perkiraan jumlah langkah kaki harianmu.';
      return undefined;

    case 'latihanBebanPerMinggu': {
      if (String(val).trim() === '') return 'Frekuensi latihan beban wajib diisi (isi 0 jika belum).';
      const num = Number(val);
      if (Number.isNaN(num) || num < 0 || num > 14) {
        return 'Masukkan angka antara 0 hingga 14 kali per minggu.';
      }
      return undefined;
    }

    case 'jamDudukPerHari': {
      if (String(val).trim() === '') return 'Total jam duduk per hari wajib diisi.';
      const num = Number(val);
      if (Number.isNaN(num) || num < 0 || num > 24) {
        return 'Masukkan angka antara 0 hingga 24 jam.';
      }
      return undefined;
    }

    case 'naikTangga3Lantai':
      if (!String(val).trim()) return 'Ceritakan rasanya saat kamu naik tangga 3 lantai.';
      return undefined;

    case 'jamTidurRataRata': {
      if (String(val).trim() === '') return 'Rata-rata jam tidur wajib diisi.';
      const num = Number(val);
      if (Number.isNaN(num) || num < 1 || num > 20) {
        return 'Masukkan rata-rata jam tidur antara 1 hingga 20 jam.';
      }
      return undefined;
    }

    case 'waktuSampaiTertidur':
      if (!String(val).trim()) return 'Jelaskan berapa lama waktu yang kamu butuhkan untuk tertidur.';
      return undefined;

    case 'cekHpMenjelangTidur':
      if (!val) return 'Pilih kebiasaanmu memeriksa HP/email sebelum tidur.';
      return undefined;

    case 'levelStresKerja':
      if (val === null || val === undefined) return 'Pilih skala level stres kerja (1–10).';
      return undefined;

    case 'frekuensiKebangunMalam':
      if (!val) return 'Pilih seberapa sering kamu terbangun di tengah malam.';
      return undefined;

    case 'trenBeratBadan3Tahun':
      if (!val) return 'Pilih tren berat badanmu dalam 3 tahun terakhir.';
      return undefined;

    case 'lingkarPerutUkuranCelana':
      if (!String(val).trim()) return 'Ceritakan perubahan lingkar perut atau ukuran celanamu.';
      return undefined;

    case 'siklusDietYoyo':
      if (!val) return 'Pilih riwayat siklus dietmu.';
      return undefined;

    case 'ukurKomposisiTubuh':
      if (!val) return 'Pilih apakah kamu pernah mengukur komposisi tubuh.';
      return undefined;

    case 'keyakinanPahamTubuh':
      if (val === null || val === undefined) return 'Pilih skala keyakinanmu (1–10).';
      return undefined;

    default:
      return undefined;
  }
}

export function validateSection(
  sectionId: SectionId,
  data: AssessmentData
): FormErrors {
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return {};

  const errors: FormErrors = {};
  for (const field of section.requiredFields) {
    const err = validateField(field, data);
    if (err) {
      errors[field] = err;
    }
  }
  return errors;
}

export function validateAllSections(data: AssessmentData): {
  errors: FormErrors;
  firstInvalidSection: SectionId | null;
} {
  let combinedErrors: FormErrors = {};
  let firstInvalidSection: SectionId | null = null;

  for (const section of SECTIONS) {
    const secErrors = validateSection(section.id, data);
    if (Object.keys(secErrors).length > 0 && firstInvalidSection === null) {
      firstInvalidSection = section.id;
    }
    combinedErrors = { ...combinedErrors, ...secErrors };
  }

  return { errors: combinedErrors, firstInvalidSection };
}

export function getSectionCompletion(
  sectionId: SectionId,
  data: AssessmentData
): { answered: number; total: number; isComplete: boolean } {
  const section = SECTIONS.find((s) => s.id === sectionId);
  if (!section) return { answered: 0, total: 0, isComplete: false };

  let answered = 0;
  for (const field of section.requiredFields) {
    const err = validateField(field, data);
    if (!err) {
      answered += 1;
    }
  }
  const total = section.requiredFields.length;
  return { answered, total, isComplete: answered === total };
}

export function calculateBMI(tinggiCm: string, beratKg: string): {
  bmi: string;
  category: string;
} | null {
  const h = Number(tinggiCm);
  const w = Number(beratKg);
  if (!h || !w || h <= 0 || w <= 0) return null;
  const meters = h / 100;
  const bmiVal = w / (meters * meters);
  const bmi = bmiVal.toFixed(1);

  let category = 'Normal';
  if (bmiVal < 18.5) category = 'Berat badan kurang';
  else if (bmiVal < 23) category = 'Normal (Asia-Pasifik)';
  else if (bmiVal < 25) category = 'Berlebih (Overweight)';
  else category = 'Obesitas';

  return { bmi, category };
}

export function formatSummaryText(data: AssessmentData): string {
  const bmiInfo = calculateBMI(data.tinggiBadan, data.beratBadan);
  const goals = [
    ...data.goalUtama,
    ...(data.goalLainnya.trim() ? [`Lainnya: ${data.goalLainnya.trim()}`] : []),
  ].join(', ');
  const tried = [
    ...data.pernahDicoba,
    ...(data.pernahDicobaLainnya.trim() ? [`Lainnya: ${data.pernahDicobaLainnya.trim()}`] : []),
  ].join(', ');

  return [
    'RINGKASAN EVALUASI KESEHATAN & GAYA HIDUP — transformwithST',
    '===========================================================',
    '',
    '[01. DATA DIRI]',
    `- Nama Lengkap: ${data.namaLengkap}`,
    `- Email: ${data.email}`,
    `- WhatsApp: ${data.whatsapp}`,
    `- Usia: ${data.usia} tahun`,
    `- Jenis Kelamin: ${data.jenisKelamin}`,
    `- Tinggi / Berat Badan: ${data.tinggiBadan} cm / ${data.beratBadan} kg${bmiInfo ? ` (IMT: ${bmiInfo.bmi} - ${bmiInfo.category})` : ''}`,
    '',
    '[02. GOAL & RIWAYAT]',
    `- Goal Utama: ${goals}`,
    `- Rencana Mulai: ${data.kapanMulai}`,
    `- Pernah Dicoba: ${tried}`,
    '',
    '[03. POLA MAKAN (NUTRISI)]',
    `- Frekuensi Makan di Luar / Pesan Online: ${data.makanDiLuarPerMinggu} kali/minggu (${data.jenisMakanDiLuar})`,
    `- Protein di Piring: ${data.frekuensiProtein}`,
    `- Minuman Manis: ${data.minumanManisPerHari} gelas/hari`,
    `- Frekuensi Ngemil: ${data.frekuensiNgemil}`,
    `- Respons Telat Makan: ${data.responTelatMakan}${data.responTelatMakanDetail.trim() ? ` — Catatan: ${data.responTelatMakanDetail.trim()}` : ''}`,
    '',
    '[04. AKTIVITAS FISIK & ENERGI]',
    `- Energi Jam 2–4 Sore: ${data.energiSore}`,
    `- Kopi / Kafein: ${data.kafeinPerHari} gelas/hari`,
    `- Rasa Saat Bangun Pagi: ${data.rasaBangunPagi}`,
    `- Stamina vs 5 Tahun Lalu: ${data.stamina5Tahun}`,
    `- Fokus & Kejernihan Pikiran Kerja: ${data.fokusKerja}`,
    `- Langkah Harian: ${data.langkahHarian}`,
    `- Latihan Beban: ${data.latihanBebanPerMinggu} kali/minggu`,
    `- Total Jam Duduk: ${data.jamDudukPerHari} jam/hari`,
    `- Naik Tangga 3 Lantai: ${data.naikTangga3Lantai}`,
    '',
    '[05. TIDUR & STRES]',
    `- Rata-rata Tidur: ${data.jamTidurRataRata} jam/malam`,
    `- Durasi Sampai Tertidur: ${data.waktuSampaiTertidur}`,
    `- Cek HP/Email Menjelang Tidur: ${data.cekHpMenjelangTidur}`,
    `- Level Stres Kerja (1–10): ${data.levelStresKerja}/10`,
    `- Kebangun Tengah Malam: ${data.frekuensiKebangunMalam}`,
    '',
    '[06. REFLEKSI & KEYAKINAN]',
    `- Tren Berat Badan 3 Tahun Terakhir: ${data.trenBeratBadan3Tahun}`,
    `- Lingkar Perut / Ukuran Celana: ${data.lingkarPerutUkuranCelana}`,
    `- Riwayat Diet Yoyo: ${data.siklusDietYoyo}`,
    `- Pengukuran Komposisi Tubuh: ${data.ukurKomposisiTubuh}`,
    `- Keyakinan Memahami Kondisi Tubuh (1–10): ${data.keyakinanPahamTubuh}/10`,
  ].join('\n');
}
