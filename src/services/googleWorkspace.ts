import {
  AssessmentData,
  CEK_HP_OPTIONS,
  DIET_YOYO_OPTIONS,
  GOAL_OPTIONS,
  INITIAL_DATA,
  JENIS_MAKAN_DI_LUAR_OPTIONS,
  KAPAN_MULAI_OPTIONS,
  KEBANGUN_MALAM_OPTIONS,
  KOMPOSISI_TUBUH_OPTIONS,
  LANGKAH_OPTIONS,
  NGEMIL_OPTIONS,
  PERNAH_DICOBA_OPTIONS,
  PROTEIN_OPTIONS,
  RESPON_TELAT_MAKAN_OPTIONS,
  STAMINA_OPTIONS,
  TREN_BB_OPTIONS,
} from '../types/assessment';

export class WorkspaceApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'WorkspaceApiError';
    this.status = status;
  }
}

async function parseGoogleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = null;
  }

  if (!res.ok) {
    const apiMessage =
      json?.error?.message ||
      json?.error_description ||
      `Permintaan Google API gagal (HTTP ${res.status}).`;
    if (res.status === 401) {
      throw new WorkspaceApiError(
        'Sesi Google Anda telah berakhir. Silakan masuk ulang dengan Google.',
        401
      );
    }
    throw new WorkspaceApiError(apiMessage, res.status);
  }

  return (json ?? {}) as T;
}

/* ============================================================================
 * GOOGLE DRIVE API
 * ============================================================================ */

export interface DriveFileSummary {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  size?: string;
}

export async function listSavedAssessmentsInDrive(
  accessToken: string
): Promise<DriveFileSummary[]> {
  const q = encodeURIComponent(
    "mimeType='application/json' and trashed=false and name contains 'evaluasi-'"
  );
  const fields = encodeURIComponent(
    'files(id,name,mimeType,modifiedTime,webViewLink,size)'
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime%20desc&pageSize=20&fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await parseGoogleResponse<{ files?: DriveFileSummary[] }>(res);
  return data.files ?? [];
}

export async function listGoogleFormsInDrive(
  accessToken: string
): Promise<DriveFileSummary[]> {
  const q = encodeURIComponent(
    "mimeType='application/vnd.google-apps.form' and trashed=false"
  );
  const fields = encodeURIComponent(
    'files(id,name,mimeType,modifiedTime,webViewLink)'
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime%20desc&pageSize=20&fields=${fields}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await parseGoogleResponse<{ files?: DriveFileSummary[] }>(res);
  return data.files ?? [];
}

export async function saveAssessmentToDrive(
  accessToken: string,
  assessment: AssessmentData,
  fileName: string
): Promise<DriveFileSummary> {
  const metadata = {
    name: fileName.endsWith('.json') ? fileName : `${fileName}.json`,
    mimeType: 'application/json',
    description: `Evaluasi Kesehatan & Gaya Hidup Vitaloka - ${assessment.namaLengkap || 'Peserta'}`,
  };

  const boundary = `vitaloka_boundary_${Date.now()}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(assessment, null, 2),
    `--${boundary}--`,
  ].join('\r\n');

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  return parseGoogleResponse<DriveFileSummary>(res);
}

export async function loadAssessmentFromDrive(
  accessToken: string,
  fileId: string
): Promise<AssessmentData> {
  const safeId = encodeURIComponent(fileId.trim());
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${safeId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const parsed = await parseGoogleResponse<Partial<AssessmentData>>(res);
  return { ...INITIAL_DATA, ...parsed };
}

export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const safeId = encodeURIComponent(fileId.trim());
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${safeId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) {
    await parseGoogleResponse(res);
  }
}

/* ============================================================================
 * GOOGLE FORMS API
 * ============================================================================ */

export interface GoogleFormInfo {
  formId: string;
  info?: {
    title?: string;
    documentTitle?: string;
    description?: string;
  };
  responderUri?: string;
  items?: Array<{
    itemId?: string;
    title?: string;
    questionItem?: {
      question?: {
        questionId?: string;
      };
    };
  }>;
}

export interface GoogleFormResponseRecord {
  responseId: string;
  createTime?: string;
  lastSubmittedTime?: string;
  respondentEmail?: string;
  answers?: Record<
    string,
    {
      questionId?: string;
      textAnswers?: {
        answers?: Array<{ value?: string }>;
      };
    }
  >;
}

function buildVitalokaFormItems() {
  const items: Array<Record<string, any>> = [
    // Section 1 Intro Banner + Fields
    {
      title: '👤 Bagian 01 · Data Diri (Identitas)',
      description:
        'Informasi dasar ini digunakan untuk menghitung profil fisiologis (IMT) serta menghubungi kamu setelah evaluasi selesai.',
      textItem: {},
    },
    {
      title: 'Nama Lengkap',
      description: 'Tuliskan nama lengkap kamu (Contoh: Raka Pratama Wijaya).',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Alamat Email',
      description:
        'Pastikan format email benar agar ringkasan hasil evaluasi dapat dikirimkan.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Nomor WhatsApp',
      description:
        'Gunakan nomor aktif yang terhubung ke WhatsApp (Contoh: 081234567890).',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Usia (tahun)',
      description: 'Masukkan usia kamu saat ini dalam tahun.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Jenis Kelamin',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: [{ value: 'Laki-laki' }, { value: 'Perempuan' }],
          },
        },
      },
    },
    {
      title: 'Tinggi Badan (cm)',
      description: 'Masukkan tinggi badan dalam sentimeter (Contoh: 170).',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Berat Badan (kg)',
      description: 'Masukkan berat badan saat ini dalam kilogram (Contoh: 72).',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },

    // Section 2: Goal & Riwayat
    {
      title: '🎯 Bagian 02 · Goal & Riwayat',
      description:
        'Beri tahu kami target utama yang paling penting bagi kamu saat ini serta pengalaman program yang pernah dicoba.',
      pageBreakItem: {},
    },
    {
      title: 'Apa goal utama kamu?',
      description: 'Kamu boleh memilih lebih dari satu tujuan.',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'CHECKBOX',
            options: [
              ...GOAL_OPTIONS.map((v) => ({ value: v })),
              { isOther: true },
            ],
          },
        },
      },
    },
    {
      title: 'Kapan kamu berencana mulai?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: KAPAN_MULAI_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title: 'Apa saja yang pernah kamu coba sebelumnya?',
      description:
        'Pilih semua metode atau program yang pernah kamu jalani agar strategi baru lebih efektif.',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'CHECKBOX',
            options: [
              ...PERNAH_DICOBA_OPTIONS.map((v) => ({ value: v })),
              { isOther: true },
            ],
          },
        },
      },
    },

    // Section 3: Pola Makan
    {
      title: '🥗 Bagian 03 · Pola Makan (Nutrisi)',
      description:
        'Isi sesuai kebiasaan makan harian kamu yang sebenarnya—tidak ada jawaban benar atau salah.',
      pageBreakItem: {},
    },
    {
      title:
        'Seminggu berapa kali kamu makan di luar, dinner client, atau pesan online?',
      description:
        'Hitung total frekuensi makan yang bukan masakan rumah dalam 7 hari (isi angka 0–35).',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title:
        'Kebiasaan dinner client atau pesan online mana yang paling sering terjadi?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: JENIS_MAKAN_DI_LUAR_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title: 'Seberapa sering ada protein di piring kamu?',
      description:
        'Contoh sumber protein: telur, ayam, ikan, daging tanpa lemak, tahu, atau tempe.',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: PROTEIN_OPTIONS.map((o) => ({
              value: `${o.value} — ${o.desc}`,
            })),
          },
        },
      },
    },
    {
      title: 'Berapa gelas minuman manis per hari?',
      description:
        'Termasuk kopi susu gula aren, teh manis, boba, jus kemasan, atau soda (isi 0 jika tidak ada).',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Seberapa sering kamu ngemil?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: NGEMIL_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title: 'Kalau telat makan biasanya kamu gimana?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: RESPON_TELAT_MAKAN_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title: 'Ceritakan detail kebiasaan saat telat makan (opsional)',
      description:
        'Contoh: Kalau meeting panjang, makan siang baru jam 3 sore lalu pesan porsi besar.',
      questionItem: {
        question: { required: false, textQuestion: { paragraph: true } },
      },
    },

    // Section 4: Aktivitas Fisik & Energi
    {
      title: '⚡ Bagian 04 · Aktivitas Fisik & Energi',
      description:
        'Gambaran ritme energi sepanjang hari, fokus kerja, dan kapasitas fisik kamu.',
      pageBreakItem: {},
    },
    {
      title: 'Jam 2–4 sore energi kamu gimana?',
      description:
        'Apakah terasa stabil, mengantuk berat (food coma), butuh kafein tambahan, atau mudah lelah?',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: true } },
      },
    },
    {
      title: 'Berapa gelas kopi / kafein per hari?',
      description: 'Isi 0 jika tidak mengonsumsi kopi atau minuman berkafein.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Waktu bangun pagi rasanya gimana?',
      description:
        'Misalnya langsung segar, masih berat/lemas, badan pegal, atau sering menunda alarm.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: true } },
      },
    },
    {
      title: 'Stamina dibanding 5 tahun lalu?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: STAMINA_OPTIONS.map((o) => ({
              value: `${o.value} — ${o.desc}`,
            })),
          },
        },
      },
    },
    {
      title: 'Fokus dan kejernihan pikiran pas kerja bagaimana?',
      description:
        'Contoh: Pagi hari masih tajam, tetapi setelah siang sering mengalami brain fog.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: true } },
      },
    },
    {
      title: 'Kira-kira berapa langkah kaki kamu per hari?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: LANGKAH_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title: 'Berapa kali seminggu kamu latihan beban?',
      description: 'Isi 0 jika belum rutin melakukan latihan beban.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Total berapa jam kamu duduk per hari?',
      description:
        'Termasuk duduk saat bekerja, rapat, dan berkendara (isi angka 0–24).',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Naik tangga 3 lantai, rasanya gimana?',
      description:
        'Contoh: Napas mulai terengah-engah di lantai 2 dan kaki terasa berat.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: true } },
      },
    },

    // Section 5: Tidur & Stres
    {
      title: '🌙 Bagian 05 · Tidur & Stres',
      description:
        'Kualitas tidur malam, paparan layar sebelum tidur, dan tingkat stres kerja saat ini.',
      pageBreakItem: {},
    },
    {
      title: 'Rata-rata kamu tidur berapa jam per malam?',
      description: 'Contoh: 6.5 atau 7 jam.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: false } },
      },
    },
    {
      title: 'Biasanya berapa lama sampai kamu tertidur?',
      description:
        'Ceritakan apakah langsung terlelap < 15 menit atau butuh waktu lama karena pikiran masih aktif.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: true } },
      },
    },
    {
      title: 'Menjelang tidur kamu masih cek HP / email?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: CEK_HP_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title: 'Level stres kerja seminggu terakhir (1–10)?',
      questionItem: {
        question: {
          required: true,
          scaleQuestion: {
            low: 1,
            high: 10,
            lowLabel: 'Sangat tenang',
            highLabel: 'Sangat tertekan',
          },
        },
      },
    },
    {
      title: 'Seberapa sering kamu kebangun tengah malam?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: KEBANGUN_MALAM_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },

    // Section 6: Refleksi & Keyakinan
    {
      title: '🔍 Bagian 06 · Refleksi & Keyakinan',
      description:
        'Bagian terakhir! Melihat tren perubahan tubuh 3 tahun terakhir dan pemahamanmu terhadap kondisi tubuh saat ini.',
      pageBreakItem: {},
    },
    {
      title: 'Berat badan kamu dalam 3 tahun terakhir?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: TREN_BB_OPTIONS.map((o) => ({
              value: `${o.value} — ${o.desc}`,
            })),
          },
        },
      },
    },
    {
      title: 'Gimana lingkar perut atau ukuran celana kamu?',
      description:
        'Ceritakan perubahan ukuran celana atau bagian tubuh yang terasa paling berubah belakangan ini.',
      questionItem: {
        question: { required: true, textQuestion: { paragraph: true } },
      },
    },
    {
      title: 'Berapa kali kamu diet, lalu beratnya balik lagi?',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: DIET_YOYO_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title: 'Pernah ukur komposisi tubuh?',
      description:
        'Seperti persentase lemak tubuh & massa otot melalui InBody, DEXA scan, atau smart scale.',
      questionItem: {
        question: {
          required: true,
          choiceQuestion: {
            type: 'RADIO',
            options: KOMPOSISI_TUBUH_OPTIONS.map((v) => ({ value: v })),
          },
        },
      },
    },
    {
      title:
        'Seberapa yakin kamu tahu kondisi badan kamu kayak sekarang (1–10)?',
      description:
        'Menilai seberapa paham kamu terhadap kebutuhan nutrisi, metabolisme, dan respons tubuhmu sendiri.',
      questionItem: {
        question: {
          required: true,
          scaleQuestion: {
            low: 1,
            high: 10,
            lowLabel: 'Sangat ragu / bingung',
            highLabel: 'Sangat yakin & paham',
          },
        },
      },
    },
    {
      title: '✨ Selesai! Terima kasih sudah mengisi evaluasi ini',
      description:
        'Klik tombol Kirim (Submit) di bawah. Tim coach transformwithST akan meninjau profil kesehatan kamu dan menghubungi via WhatsApp atau Email.',
      textItem: {},
    },
  ];

  return items;
}

export async function createVitalokaGoogleForm(
  accessToken: string,
  title: string
): Promise<GoogleFormInfo> {
  const cleanTitle =
    title.trim() || 'Evaluasi Kesehatan, Nutrisi & Gaya Hidup — transformwithST';

  // Step 1: Create empty form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: cleanTitle,
        documentTitle: cleanTitle,
      },
    }),
  });

  const created = await parseGoogleResponse<GoogleFormInfo>(createRes);
  const safeFormId = encodeURIComponent(created.formId);

  // Step 2: Populate rich welcome description + all 6 structured sections via batchUpdate
  const items = buildVitalokaFormItems();
  const requests = [
    {
      updateFormInfo: {
        info: {
          description: [
            'Selamat datang di Evaluasi Kesehatan, Nutrisi & Gaya Hidup transformwithST.',
            '',
            '⏱️ Estimasi pengisian: 5–8 menit (6 bagian singkat)',
            '🔒 Privasi terjaga: Seluruh jawaban hanya digunakan untuk menyusun rekomendasi program personal kamu.',
            '',
            'Isi setiap pertanyaan dengan jujur sesuai kondisi harian kamu saat ini.',
          ].join('\n'),
        },
        updateMask: 'description',
      },
    },
    ...items.map((item, idx) => ({
      createItem: {
        item,
        location: { index: idx },
      },
    })),
  ];

  const batchRes = await fetch(
    `https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        includeFormInResponse: true,
        requests,
      }),
    }
  );

  const batchResult = await parseGoogleResponse<{ form?: GoogleFormInfo }>(
    batchRes
  );
  return batchResult.form ?? created;
}

export async function getGoogleForm(
  accessToken: string,
  formId: string
): Promise<GoogleFormInfo> {
  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseGoogleResponse<GoogleFormInfo>(res);
}

export async function listGoogleFormResponses(
  accessToken: string,
  formId: string
): Promise<GoogleFormResponseRecord[]> {
  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(
    `https://forms.googleapis.com/v1/forms/${safeFormId}/responses`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const data = await parseGoogleResponse<{
    responses?: GoogleFormResponseRecord[];
  }>(res);
  return data.responses ?? [];
}

function extractLeadingEnum<T extends string>(
  raw: string,
  allowed: readonly T[]
): T | '' {
  for (const opt of allowed) {
    if (raw === opt || raw.startsWith(`${opt} —`)) {
      return opt;
    }
  }
  return '';
}

export function mapFormResponseToAssessment(
  form: GoogleFormInfo,
  response: GoogleFormResponseRecord
): AssessmentData {
  const next: AssessmentData = { ...INITIAL_DATA };
  if (response.respondentEmail) {
    next.email = response.respondentEmail;
  }

  const questionTitleById = new Map<string, string>();
  for (const item of form.items ?? []) {
    const qId = item.questionItem?.question?.questionId;
    if (qId && item.title) {
      questionTitleById.set(qId, item.title);
    }
  }

  for (const [qId, ansObj] of Object.entries(response.answers ?? {})) {
    const title = questionTitleById.get(qId) ?? '';
    const values = (ansObj.textAnswers?.answers ?? [])
      .map((a) => a.value ?? '')
      .filter(Boolean);
    if (values.length === 0) continue;
    const first = values[0];

    switch (title) {
      case 'Nama Lengkap':
        next.namaLengkap = first;
        break;
      case 'Alamat Email':
        next.email = first;
        break;
      case 'Nomor WhatsApp':
        next.whatsapp = first;
        break;
      case 'Usia (tahun)':
        next.usia = first;
        break;
      case 'Jenis Kelamin':
        if (first === 'Laki-laki' || first === 'Perempuan') {
          next.jenisKelamin = first;
        }
        break;
      case 'Tinggi Badan (cm)':
        next.tinggiBadan = first;
        break;
      case 'Berat Badan (kg)':
        next.beratBadan = first;
        break;
      case 'Goal Utama':
      case 'Apa goal utama kamu?': {
        const standardGoals = values.filter((v) => GOAL_OPTIONS.includes(v));
        const otherGoals = values.filter((v) => !GOAL_OPTIONS.includes(v));
        next.goalUtama = standardGoals;
        if (otherGoals.length > 0) {
          next.goalLainnya = otherGoals.join(', ');
        }
        break;
      }
      case 'Goal Lainnya (opsional)':
        next.goalLainnya = first;
        break;
      case 'Kapan Berencana Mulai':
      case 'Kapan kamu berencana mulai?':
        next.kapanMulai = first;
        break;
      case 'Hal yang Pernah Dicoba':
      case 'Apa saja yang pernah kamu coba sebelumnya?': {
        const standardTried = values.filter((v) =>
          PERNAH_DICOBA_OPTIONS.includes(v)
        );
        const otherTried = values.filter(
          (v) => !PERNAH_DICOBA_OPTIONS.includes(v)
        );
        next.pernahDicoba = standardTried;
        if (otherTried.length > 0) {
          next.pernahDicobaLainnya = otherTried.join(', ');
        }
        break;
      }
      case 'Frekuensi Makan di Luar / Pesan Online (kali/minggu)':
      case 'Seminggu berapa kali kamu makan di luar, dinner client, atau pesan online?':
        next.makanDiLuarPerMinggu = first;
        break;
      case 'Kebiasaan Makan di Luar Paling Sering':
      case 'Kebiasaan dinner client atau pesan online mana yang paling sering terjadi?':
        next.jenisMakanDiLuar = first;
        break;
      case 'Seberapa Sering Protein Ada di Piring':
      case 'Seberapa sering ada protein di piring kamu?': {
        const parsed = extractLeadingEnum(first, [
          'Selalu',
          'Sering',
          'Jarang',
        ] as const);
        if (parsed) next.frekuensiProtein = parsed;
        break;
      }
      case 'Minuman Manis per Hari (gelas)':
      case 'Berapa gelas minuman manis per hari?':
        next.minumanManisPerHari = first;
        break;
      case 'Frekuensi Ngemil':
      case 'Seberapa sering kamu ngemil?':
        next.frekuensiNgemil = first;
        break;
      case 'Respons Saat Telat Makan':
      case 'Kalau telat makan biasanya kamu gimana?':
        next.responTelatMakan = first;
        break;
      case 'Ceritakan detail kebiasaan saat telat makan (opsional)':
        next.responTelatMakanDetail = first;
        break;
      case 'Kondisi Energi Jam 2–4 Sore':
      case 'Jam 2–4 sore energi kamu gimana?':
        next.energiSore = first;
        break;
      case 'Konsumsi Kopi / Kafein per Hari (gelas)':
      case 'Berapa gelas kopi / kafein per hari?':
        next.kafeinPerHari = first;
        break;
      case 'Rasa Saat Bangun Pagi':
      case 'Waktu bangun pagi rasanya gimana?':
        next.rasaBangunPagi = first;
        break;
      case 'Perbandingan Stamina vs 5 Tahun Lalu':
      case 'Stamina dibanding 5 tahun lalu?': {
        const parsed = extractLeadingEnum(first, [
          'Lebih baik',
          'Sama',
          'Buruk',
        ] as const);
        if (parsed) next.stamina5Tahun = parsed;
        break;
      }
      case 'Fokus & Kejernihan Pikiran Saat Bekerja':
      case 'Fokus dan kejernihan pikiran pas kerja bagaimana?':
        next.fokusKerja = first;
        break;
      case 'Perkiraan Langkah Harian':
      case 'Kira-kira berapa langkah kaki kamu per hari?':
        next.langkahHarian = first;
        break;
      case 'Latihan Beban per Minggu (kali)':
      case 'Berapa kali seminggu kamu latihan beban?':
        next.latihanBebanPerMinggu = first;
        break;
      case 'Total Jam Duduk per Hari (jam)':
      case 'Total berapa jam kamu duduk per hari?':
        next.jamDudukPerHari = first;
        break;
      case 'Rasanya Saat Naik Tangga 3 Lantai':
      case 'Naik tangga 3 lantai, rasanya gimana?':
        next.naikTangga3Lantai = first;
        break;
      case 'Rata-rata Jam Tidur per Malam':
      case 'Rata-rata kamu tidur berapa jam per malam?':
        next.jamTidurRataRata = first;
        break;
      case 'Waktu yang Dibutuhkan Sampai Tertidur':
      case 'Biasanya berapa lama sampai kamu tertidur?':
        next.waktuSampaiTertidur = first;
        break;
      case 'Kebiasaan Cek HP / Email Menjelang Tidur':
      case 'Menjelang tidur kamu masih cek HP / email?':
        next.cekHpMenjelangTidur = first;
        break;
      case 'Level Stres Kerja Seminggu Terakhir (1–10)':
      case 'Level stres kerja seminggu terakhir (1–10)?': {
        const n = Number(first);
        if (!Number.isNaN(n)) next.levelStresKerja = n;
        break;
      }
      case 'Frekuensi Terbangun Tengah Malam':
      case 'Seberapa sering kamu kebangun tengah malam?':
        next.frekuensiKebangunMalam = first;
        break;
      case 'Tren Berat Badan 3 Tahun Terakhir':
      case 'Berat badan kamu dalam 3 tahun terakhir?': {
        const parsed = extractLeadingEnum(first, [
          'Naik',
          'Turun',
          'Stabil',
        ] as const);
        if (parsed) next.trenBeratBadan3Tahun = parsed;
        break;
      }
      case 'Perubahan Lingkar Perut / Ukuran Celana':
      case 'Gimana lingkar perut atau ukuran celana kamu?':
        next.lingkarPerutUkuranCelana = first;
        break;
      case 'Riwayat Siklus Diet Yoyo':
      case 'Berapa kali kamu diet, lalu beratnya balik lagi?':
        next.siklusDietYoyo = first;
        break;
      case 'Pengukuran Komposisi Tubuh':
      case 'Pernah ukur komposisi tubuh?':
        next.ukurKomposisiTubuh = first;
        break;
      case 'Keyakinan Memahami Kondisi Tubuh Saat Ini (1–10)':
      case 'Seberapa yakin kamu tahu kondisi badan kamu kayak sekarang (1–10)?': {
        const n = Number(first);
        if (!Number.isNaN(n)) next.keyakinanPahamTubuh = n;
        break;
      }
      default:
        break;
    }
  }

  return next;
}

/* ============================================================================
 * GMAIL API
 * ============================================================================ */

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function utf8ToBase64Url(str: string): string {
  return utf8ToBase64(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function encodeMimeHeader(value: string): string {
  // Encode non-ASCII subject lines cleanly per RFC 2047
  if (/^[\x20-\x7E]*$/.test(value)) {
    return value;
  }
  return `=?UTF-8?B?${utf8ToBase64(value)}?=`;
}

export async function sendEmailViaGmail(
  accessToken: string,
  params: { to: string; subject: string; body: string }
): Promise<{ id: string; threadId?: string }> {
  const cleanTo = params.to.replace(/[\r\n]/g, '').trim();
  const cleanSubject = params.subject.replace(/[\r\n]/g, ' ').trim();

  const mime = [
    `To: ${cleanTo}`,
    `Subject: ${encodeMimeHeader(cleanSubject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    utf8ToBase64(params.body),
  ].join('\r\n');

  const raw = utf8ToBase64Url(mime);

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    }
  );

  return parseGoogleResponse<{ id: string; threadId?: string }>(res);
}

export interface GmailMessageSummary {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
}

export async function listRecentEmails(
  accessToken: string,
  query = 'Vitaloka OR Evaluasi'
): Promise<GmailMessageSummary[]> {
  const q = encodeURIComponent(query.trim());
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=6&q=${q}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const listData = await parseGoogleResponse<{
    messages?: Array<{ id: string }>;
  }>(listRes);

  const ids = listData.messages ?? [];
  if (ids.length === 0) return [];

  const details = await Promise.all(
    ids.map(async ({ id }) => {
      const safeId = encodeURIComponent(id);
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${safeId}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const msg = await parseGoogleResponse<any>(msgRes);
      const headers: Array<{ name: string; value: string }> =
        msg?.payload?.headers ?? [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())
          ?.value ?? '';

      return {
        id: msg.id,
        snippet: msg.snippet ?? '',
        subject: getHeader('Subject') || '(Tanpa Subjek)',
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
      };
    })
  );

  return details;
}
