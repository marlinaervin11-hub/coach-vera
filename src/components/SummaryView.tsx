import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Edit3,
  FileJson,
  FileSpreadsheet,
  HardDrive,
  Mail,
  Printer,
  RotateCcw,
} from 'lucide-react';
import { AssessmentData, SectionId } from '../types/assessment';
import { calculateBMI, formatSummaryText } from '../utils/validation';
import { WorkspaceTab } from './WorkspaceHubModal';

interface SummaryViewProps {
  data: AssessmentData;
  onEditSection: (sectionId: SectionId) => void;
  onResetAll: () => void;
  onOpenWorkspace: (tab: WorkspaceTab) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  data,
  onEditSection,
  onResetAll,
  onOpenWorkspace,
}) => {
  const [copied, setCopied] = useState(false);

  const bmiInfo = calculateBMI(data.tinggiBadan, data.beratBadan);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatSummaryText(data));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback textarea copy
      const textarea = document.createElement('textarea');
      textarea.value = formatSummaryText(data);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadTxt = () => {
    const content = formatSummaryText(data);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (data.namaLengkap || 'peserta')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `evaluasi-${safeName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName =
      (data.namaLengkap || 'peserta')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'peserta';
    a.href = url;
    a.download = `evaluasi-${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const sectionsSummary: {
    id: SectionId;
    title: string;
    rows: { label: string; value: string }[];
  }[] = [
    {
      id: 1,
      title: '01. Data Diri (Identitas)',
      rows: [
        { label: 'Nama Lengkap', value: data.namaLengkap },
        { label: 'Email', value: data.email },
        { label: 'Nomor WhatsApp', value: data.whatsapp },
        { label: 'Usia', value: `${data.usia} tahun` },
        { label: 'Jenis Kelamin', value: data.jenisKelamin },
        {
          label: 'Tinggi / Berat Badan',
          value: `${data.tinggiBadan} cm / ${data.beratBadan} kg`,
        },
      ],
    },
    {
      id: 2,
      title: '02. Goal & Riwayat',
      rows: [
        {
          label: 'Goal Utama',
          value: [
            ...data.goalUtama,
            ...(data.goalLainnya.trim()
              ? [`Lainnya: ${data.goalLainnya.trim()}`]
              : []),
          ].join(' · '),
        },
        { label: 'Rencana Mulai', value: data.kapanMulai },
        {
          label: 'Hal yang Pernah Dicoba',
          value: [
            ...data.pernahDicoba,
            ...(data.pernahDicobaLainnya.trim()
              ? [`Lainnya: ${data.pernahDicobaLainnya.trim()}`]
              : []),
          ].join(' · '),
        },
      ],
    },
    {
      id: 3,
      title: '03. Pola Makan (Nutrisi)',
      rows: [
        {
          label: 'Makan di Luar / Pesan Online',
          value: `${data.makanDiLuarPerMinggu} kali/minggu`,
        },
        { label: 'Kebiasaan Paling Sering', value: data.jenisMakanDiLuar },
        { label: 'Protein di Piring', value: data.frekuensiProtein },
        {
          label: 'Minuman Manis',
          value: `${data.minumanManisPerHari} gelas/hari`,
        },
        { label: 'Frekuensi Ngemil', value: data.frekuensiNgemil },
        {
          label: 'Respons Saat Telat Makan',
          value: data.responTelatMakanDetail.trim()
            ? `${data.responTelatMakan} (${data.responTelatMakanDetail.trim()})`
            : data.responTelatMakan,
        },
      ],
    },
    {
      id: 4,
      title: '04. Aktivitas Fisik & Energi',
      rows: [
        { label: 'Energi Jam 2–4 Sore', value: data.energiSore },
        { label: 'Kopi / Kafein', value: `${data.kafeinPerHari} gelas/hari` },
        { label: 'Kondisi Saat Bangun Pagi', value: data.rasaBangunPagi },
        { label: 'Stamina vs 5 Tahun Lalu', value: data.stamina5Tahun },
        { label: 'Fokus & Kejernihan Pikiran', value: data.fokusKerja },
        { label: 'Langkah Kaki Harian', value: data.langkahHarian },
        {
          label: 'Latihan Beban',
          value: `${data.latihanBebanPerMinggu} kali/minggu`,
        },
        { label: 'Total Jam Duduk', value: `${data.jamDudukPerHari} jam/hari` },
        { label: 'Naik Tangga 3 Lantai', value: data.naikTangga3Lantai },
      ],
    },
    {
      id: 5,
      title: '05. Tidur & Stres',
      rows: [
        {
          label: 'Rata-rata Durasi Tidur',
          value: `${data.jamTidurRataRata} jam/malam`,
        },
        { label: 'Waktu Sampai Tertidur', value: data.waktuSampaiTertidur },
        {
          label: 'Cek HP/Email Sebelum Tidur',
          value: data.cekHpMenjelangTidur,
        },
        {
          label: 'Level Stres Kerja',
          value: `${data.levelStresKerja} / 10`,
        },
        {
          label: 'Kebangun Tengah Malam',
          value: data.frekuensiKebangunMalam,
        },
      ],
    },
    {
      id: 6,
      title: '06. Refleksi & Keyakinan',
      rows: [
        {
          label: 'Tren Berat Badan (3 Tahun)',
          value: data.trenBeratBadan3Tahun,
        },
        {
          label: 'Lingkar Perut / Ukuran Celana',
          value: data.lingkarPerutUkuranCelana,
        },
        { label: 'Riwayat Diet Yoyo', value: data.siklusDietYoyo },
        { label: 'Ukur Komposisi Tubuh', value: data.ukurKomposisiTubuh },
        {
          label: 'Keyakinan Memahami Kondisi Badan',
          value: `${data.keyakinanPahamTubuh} / 10`,
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Confirmation Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-teal-800">
              <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
              <span>Formulir Berhasil Dilengkapi</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Ringkasan Evaluasi transformwithST — {data.namaLengkap}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Seluruh 6 bagian telah terisi dan tervalidasi. Kamu dapat menyalin
              ringkasan untuk dikirim ke coach via WhatsApp, mengunduh arsip
              teks, atau mengubah jawaban jika ada yang perlu diperbaiki.
            </p>
          </div>
        </div>

        {/* Baseline Metrics Strip calculated strictly from user's real inputs */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-y border-slate-100 py-6 sm:grid-cols-4">
          <div>
            <p className="text-[12px] font-medium text-slate-500">
              Indeks Massa Tubuh
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
              {bmiInfo ? bmiInfo.bmi : '—'}
            </p>
            <p className="mt-0.5 text-[12px] text-slate-600">
              {bmiInfo ? bmiInfo.category : ''}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-slate-500">
              Rata-rata Tidur
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
              {data.jamTidurRataRata} <span className="text-sm font-normal">jam</span>
            </p>
            <p className="mt-0.5 text-[12px] text-slate-600">per malam</p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-slate-500">
              Level Stres Kerja
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
              {data.levelStresKerja}
              <span className="text-sm font-normal text-slate-500">/10</span>
            </p>
            <p className="mt-0.5 text-[12px] text-slate-600">seminggu terakhir</p>
          </div>

          <div>
            <p className="text-[12px] font-medium text-slate-500">
              Latihan Beban
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900">
              {data.latihanBebanPerMinggu}
              <span className="text-sm font-normal text-slate-500">x</span>
            </p>
            <p className="mt-0.5 text-[12px] text-slate-600">per minggu</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-[14px] font-semibold text-white whitespace-nowrap transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                <span>Tersalin ke Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Salin Ringkasan</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 whitespace-nowrap transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Unduh (.txt)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 whitespace-nowrap transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
          >
            <FileJson className="h-4 w-4" aria-hidden="true" />
            <span>Unduh Data</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[14px] font-semibold text-slate-700 whitespace-nowrap transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>Cetak / PDF</span>
          </button>

          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-500 whitespace-nowrap transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 sm:ml-auto"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Isi Formulir Baru</span>
          </button>
        </div>

        {/* Google Workspace Actions */}
        <div className="no-print mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[13px] font-bold text-slate-900">
                Integrasi Google Workspace
              </p>
              <p className="mt-0.5 text-[12px] text-slate-600">
                Simpan data ke Google Drive, kirim ringkasan via Gmail, atau
                publikasikan pertanyaan ke Google Forms.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenWorkspace('gmail')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 whitespace-nowrap transition-colors hover:border-teal-300 hover:bg-teal-50/60"
              >
                <Mail className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <span>Kirim via Gmail</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenWorkspace('drive')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 whitespace-nowrap transition-colors hover:border-teal-300 hover:bg-teal-50/60"
              >
                <HardDrive className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <span>Simpan ke Drive</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenWorkspace('forms')}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 whitespace-nowrap transition-colors hover:border-teal-300 hover:bg-teal-50/60"
              >
                <FileSpreadsheet
                  className="h-4 w-4 text-teal-700"
                  aria-hidden="true"
                />
                <span>Google Forms</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed 6-Section Review */}
      <div className="mt-6 space-y-5">
        {sectionsSummary.map((sec) => (
          <section
            key={sec.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h2 className="text-[18px] font-bold text-slate-900">
                {sec.title}
              </h2>
              <button
                type="button"
                onClick={() => onEditSection(sec.id)}
                className="no-print inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-teal-700 whitespace-nowrap transition-colors hover:bg-teal-50"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ubah</span>
              </button>
            </div>

            <dl className="mt-4 divide-y divide-slate-100">
              {sec.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-12 sm:gap-4"
                >
                  <dt className="text-[13px] font-medium text-slate-500 sm:col-span-4">
                    {row.label}
                  </dt>
                  <dd className="text-[14px] font-medium leading-relaxed text-slate-900 sm:col-span-8">
                    {row.value || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
};
