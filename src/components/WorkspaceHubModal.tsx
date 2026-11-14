import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FolderOpen,
  HardDrive,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { AssessmentData } from '../types/assessment';
import { formatSummaryText } from '../utils/validation';
import {
  createVitalokaGoogleForm,
  deleteDriveFile,
  DriveFileSummary,
  getGoogleForm,
  GmailMessageSummary,
  GoogleFormInfo,
  GoogleFormResponseRecord,
  listGoogleFormResponses,
  listGoogleFormsInDrive,
  listRecentEmails,
  listSavedAssessmentsInDrive,
  loadAssessmentFromDrive,
  mapFormResponseToAssessment,
  saveAssessmentToDrive,
  sendEmailViaGmail,
  WorkspaceApiError,
} from '../services/googleWorkspace';
import { GoogleSignInButton } from './GoogleSignInButton';

export type WorkspaceTab = 'forms' | 'drive' | 'gmail';

interface PendingConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void>;
}

interface WorkspaceHubModalProps {
  isOpen: boolean;
  initialTab: WorkspaceTab;
  onClose: () => void;
  user: User | null;
  accessToken: string | null;
  isLoggingIn: boolean;
  onSignIn: () => Promise<void>;
  onAuthExpired: () => void;
  data: AssessmentData;
  onLoadAssessment: (loaded: AssessmentData, openSummary?: boolean) => void;
}

export const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({
  isOpen,
  initialTab,
  onClose,
  user,
  accessToken,
  isLoggingIn,
  onSignIn,
  onAuthExpired,
  data,
  onLoadAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [pendingConfirm, setPendingConfirm] =
    useState<PendingConfirmation | null>(null);
  const [isConfirmExecuting, setIsConfirmExecuting] = useState(false);

  // Forms state
  const [formTitle, setFormTitle] = useState(
    'Evaluasi Kesehatan, Nutrisi & Gaya Hidup — Vitaloka'
  );
  const [createdForm, setCreatedForm] = useState<GoogleFormInfo | null>(null);
  const [copiedFormLink, setCopiedFormLink] = useState(false);
  const [driveForms, setDriveForms] = useState<DriveFileSummary[]>([]);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [inspectedForm, setInspectedForm] = useState<GoogleFormInfo | null>(
    null
  );
  const [formResponses, setFormResponses] = useState<
    GoogleFormResponseRecord[]
  >([]);
  const [isFormsLoading, setIsFormsLoading] = useState(false);

  // Drive state
  const [driveFileName, setDriveFileName] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveFileSummary[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);

  // Gmail state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [recentEmails, setRecentEmails] = useState<GmailMessageSummary[]>([]);
  const [isGmailLoading, setIsGmailLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStatusMessage(null);
      const safeName =
        (data.namaLengkap || 'peserta')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') || 'peserta';
      setDriveFileName(`evaluasi-${safeName}.json`);
      setEmailTo(data.email || user?.email || '');
      setEmailSubject(
        `Ringkasan Evaluasi Vitaloka — ${data.namaLengkap || 'Peserta'}`
      );
      setEmailBody(formatSummaryText(data));
    }
  }, [isOpen, initialTab, data, user?.email]);

  const handleApiError = (err: unknown) => {
    if (err instanceof WorkspaceApiError && err.status === 401) {
      onAuthExpired();
    }
    const msg =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat menghubungi Google Workspace.';
    setStatusMessage({ type: 'error', text: msg });
  };

  const refreshDriveFiles = async () => {
    if (!accessToken) return;
    setIsDriveLoading(true);
    try {
      const files = await listSavedAssessmentsInDrive(accessToken);
      setDriveFiles(files);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const refreshDriveForms = async () => {
    if (!accessToken) return;
    setIsFormsLoading(true);
    try {
      const forms = await listGoogleFormsInDrive(accessToken);
      setDriveForms(forms);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsFormsLoading(false);
    }
  };

  const refreshRecentEmails = async () => {
    if (!accessToken) return;
    setIsGmailLoading(true);
    try {
      const msgs = await listRecentEmails(accessToken);
      setRecentEmails(msgs);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsGmailLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !accessToken) return;
    if (activeTab === 'drive') {
      void refreshDriveFiles();
    } else if (activeTab === 'forms') {
      void refreshDriveForms();
    } else if (activeTab === 'gmail') {
      void refreshRecentEmails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, accessToken]);

  if (!isOpen) return null;

  /* --------------------------------------------------------------------------
   * Confirmed Actions (all mutating/sending operations require confirmation)
   * ------------------------------------------------------------------------ */

  const requestCreateGoogleForm = () => {
    if (!accessToken) return;
    const targetTitle =
      formTitle.trim() || 'Evaluasi Kesehatan, Nutrisi & Gaya Hidup — Vitaloka';
    setPendingConfirm({
      title: 'Publikasikan ke Google Forms?',
      description: `Aplikasi akan membuat Google Form baru berjudul "${targetTitle}" beserta seluruh 6 bagian pertanyaan Vitaloka di akun Google Anda.`,
      confirmLabel: 'Ya, Buat Google Form',
      onConfirm: async () => {
        const form = await createVitalokaGoogleForm(accessToken, targetTitle);
        setCreatedForm(form);
        setSelectedFormId(form.formId);
        setStatusMessage({
          type: 'success',
          text: 'Google Form berhasil dibuat dan siap dibagikan.',
        });
        await refreshDriveForms();
      },
    });
  };

  const requestSaveToDrive = () => {
    if (!accessToken) return;
    const finalName = driveFileName.trim() || 'evaluasi-vitaloka.json';
    setPendingConfirm({
      title: 'Simpan Evaluasi ke Google Drive?',
      description: `Data evaluasi saat ini akan diunggah ke Google Drive Anda sebagai file "${
        finalName.endsWith('.json') ? finalName : `${finalName}.json`
      }".`,
      confirmLabel: 'Ya, Simpan ke Drive',
      onConfirm: async () => {
        const saved = await saveAssessmentToDrive(
          accessToken,
          data,
          finalName
        );
        setStatusMessage({
          type: 'success',
          text: `Berhasil disimpan ke Google Drive (${saved.name}).`,
        });
        await refreshDriveFiles();
      },
    });
  };

  const requestDeleteDriveFile = (file: DriveFileSummary) => {
    if (!accessToken) return;
    setPendingConfirm({
      title: 'Hapus file dari Google Drive?',
      description: `File "${file.name}" akan dihapus permanen dari Google Drive Anda. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Ya, Hapus Permanen',
      destructive: true,
      onConfirm: async () => {
        await deleteDriveFile(accessToken, file.id);
        setStatusMessage({
          type: 'success',
          text: `File "${file.name}" telah dihapus dari Google Drive.`,
        });
        await refreshDriveFiles();
      },
    });
  };

  const requestSendGmail = () => {
    if (!accessToken) return;
    if (!emailTo.trim() || !emailTo.includes('@')) {
      setStatusMessage({
        type: 'error',
        text: 'Masukkan alamat email tujuan yang valid terlebih dahulu.',
      });
      return;
    }
    setPendingConfirm({
      title: 'Kirim Ringkasan via Gmail?',
      description: `Email berjudul "${emailSubject.trim()}" akan dikirim dari akun Gmail Anda ke ${emailTo.trim()}.`,
      confirmLabel: 'Ya, Kirim Email',
      onConfirm: async () => {
        await sendEmailViaGmail(accessToken, {
          to: emailTo.trim(),
          subject: emailSubject.trim(),
          body: emailBody,
        });
        setStatusMessage({
          type: 'success',
          text: `Email ringkasan berhasil dikirim ke ${emailTo.trim()}.`,
        });
        await refreshRecentEmails();
      },
    });
  };

  const handleLoadFromDrive = async (file: DriveFileSummary) => {
    if (!accessToken) return;
    setIsDriveLoading(true);
    setStatusMessage(null);
    try {
      const loaded = await loadAssessmentFromDrive(accessToken, file.id);
      onLoadAssessment(loaded, false);
      setStatusMessage({
        type: 'success',
        text: `Data dari "${file.name}" berhasil dimuat ke formulir.`,
      });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleInspectForm = async (formIdToLoad?: string) => {
    if (!accessToken) return;
    const id = (formIdToLoad ?? selectedFormId).trim();
    if (!id) {
      setStatusMessage({
        type: 'error',
        text: 'Pilih atau masukkan Form ID Google Form terlebih dahulu.',
      });
      return;
    }
    setSelectedFormId(id);
    setIsFormsLoading(true);
    setStatusMessage(null);
    try {
      const [formDetails, responses] = await Promise.all([
        getGoogleForm(accessToken, id),
        listGoogleFormResponses(accessToken, id),
      ]);
      setInspectedForm(formDetails);
      setFormResponses(responses);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsFormsLoading(false);
    }
  };

  const handleImportFormResponse = (response: GoogleFormResponseRecord) => {
    if (!inspectedForm) return;
    const mapped = mapFormResponseToAssessment(inspectedForm, response);
    onLoadAssessment(mapped, true);
    setStatusMessage({
      type: 'success',
      text: 'Respons Google Form berhasil dimuat ke tampilan ringkasan.',
    });
  };

  const handleCopyFormLink = async (uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      setCopiedFormLink(true);
      setTimeout(() => setCopiedFormLink(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirm) return;
    setIsConfirmExecuting(true);
    setStatusMessage(null);
    try {
      await pendingConfirm.onConfirm();
      setPendingConfirm(null);
    } catch (err) {
      setPendingConfirm(null);
      handleApiError(err);
    } finally {
      setIsConfirmExecuting(false);
    }
  };

  const tabs: { id: WorkspaceTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'forms',
      label: 'Google Forms',
      icon: <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'drive',
      label: 'Google Drive',
      icon: <HardDrive className="h-4 w-4" aria-hidden="true" />,
    },
    {
      id: 'gmail',
      label: 'Gmail',
      icon: <Mail className="h-4 w-4" aria-hidden="true" />,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="workspace-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-[2px] sm:p-6"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-800">
              Google Workspace
            </p>
            <h2
              id="workspace-modal-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              Integrasi Google Forms, Drive &amp; Gmail
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel Google Workspace"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatusMessage(null);
                }}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-semibold transition-colors ${
                  active
                    ? 'border-teal-700 text-teal-800'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {statusMessage && (
            <div
              role="status"
              className={`mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[13px] ${
                statusMessage.type === 'success'
                  ? 'border-teal-200 bg-teal-50 text-teal-900'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {!accessToken ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
              <h3 className="text-[17px] font-bold text-slate-900">
                Hubungkan Akun Google Anda
              </h3>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-slate-600">
                Masuk dengan Google untuk mempublikasikan formulir ke Google
                Forms, menyimpan atau memuat file evaluasi dari Google Drive, dan
                mengirim ringkasan melalui Gmail.
              </p>
              <div className="mt-6 flex justify-center">
                <GoogleSignInButton
                  onClick={onSignIn}
                  disabled={isLoggingIn}
                  label={
                    isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'
                  }
                />
              </div>
            </div>
          ) : (
            <>
              {/* GOOGLE FORMS TAB */}
              {activeTab === 'forms' && (
                <div className="space-y-6">
                  {/* Create & Publish Google Form */}
                  <section className="rounded-xl border border-slate-200 p-5">
                    <h3 className="text-[16px] font-bold text-slate-900">
                      Publikasikan ke Google Forms (Langsung Jadi)
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                      Otomatis membuat Google Form 6 halaman yang rapi dengan
                      deskripsi pembuka, panduan di setiap pertanyaan, skala
                      1–10, serta opsi &ldquo;Lainnya&rdquo; sehingga siap
                      dibagikan ke pelanggan tanpa perlu edit pertanyaan lagi.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Judul Google Form"
                        className="min-h-[44px] flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-[14px] text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      />
                      <button
                        type="button"
                        onClick={requestCreateGoogleForm}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-[14px] font-semibold text-white whitespace-nowrap transition-colors hover:bg-teal-800"
                      >
                        <UploadCloud className="h-4 w-4" aria-hidden="true" />
                        <span>Buat Google Form</span>
                      </button>
                    </div>

                    {createdForm?.responderUri && (
                      <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/70 p-4">
                        <p className="text-[12px] font-semibold text-teal-900">
                          Google Form Siap Dibagikan ke Pelanggan:
                        </p>
                        <p className="mt-1 break-all font-mono text-[12px] text-teal-800">
                          {createdForm.responderUri}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyFormLink(createdForm.responderUri!)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-teal-900 hover:bg-teal-50"
                          >
                            {copiedFormLink ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Salin Link Form</span>
                              </>
                            )}
                          </button>
                          <a
                            href={createdForm.responderUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-teal-800"
                          >
                            <span>Buka Form Pelanggan</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          {createdForm.formId && (
                            <a
                              href={`https://docs.google.com/forms/d/${encodeURIComponent(
                                createdForm.formId
                              )}/edit`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <span>Ganti Warna / Banner (Opsional)</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Inspect Existing Forms & Responses */}
                  <section className="rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[16px] font-bold text-slate-900">
                          Lihat &amp; Impor Respons Google Form
                        </h3>
                        <p className="mt-0.5 text-[13px] text-slate-600">
                          Pilih formulir dari Google Drive Anda atau masukkan Form
                          ID untuk melihat jawaban peserta.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={refreshDriveForms}
                        disabled={isFormsLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            isFormsLoading ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Muat Ulang</span>
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                      <input
                        type="text"
                        value={selectedFormId}
                        onChange={(e) => setSelectedFormId(e.target.value)}
                        placeholder="Masukkan Google Form ID..."
                        className="min-h-[42px] flex-1 rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-[13px] text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleInspectForm()}
                        disabled={isFormsLoading}
                        className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-[13px] font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        {isFormsLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FolderOpen className="h-4 w-4" />
                        )}
                        <span>Ambil Respons</span>
                      </button>
                    </div>

                    {driveForms.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[12px] font-semibold text-slate-500">
                          Google Forms di Drive Anda:
                        </p>
                        <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
                          {driveForms.map((f) => (
                            <div
                              key={f.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-semibold text-slate-900">
                                  {f.name}
                                </p>
                                <p className="truncate font-mono text-[11px] text-slate-500">
                                  {f.id}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleInspectForm(f.id)}
                                className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[12px] font-semibold text-teal-800 hover:bg-teal-50"
                              >
                                Buka Respons
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {inspectedForm && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-[14px] font-bold text-slate-900">
                              {inspectedForm.info?.title || 'Google Form'}
                            </p>
                            <p className="text-[12px] text-slate-500">
                              {formResponses.length} respons ditemukan
                            </p>
                          </div>
                          {inspectedForm.responderUri && (
                            <a
                              href={inspectedForm.responderUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[12px] font-semibold text-teal-700 hover:underline"
                            >
                              <span>Buka Link Form</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>

                        {formResponses.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {formResponses.map((resp) => (
                              <div
                                key={resp.responseId}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-[13px] font-semibold text-slate-900">
                                    {resp.respondentEmail ||
                                      `Respons ${resp.responseId.slice(0, 8)}`}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    {resp.lastSubmittedTime
                                      ? new Date(
                                          resp.lastSubmittedTime
                                        ).toLocaleString('id-ID')
                                      : 'Waktu tidak tercatat'}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleImportFormResponse(resp)}
                                  className="shrink-0 rounded-lg bg-teal-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-teal-800"
                                >
                                  Muat ke Ringkasan
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* GOOGLE DRIVE TAB */}
              {activeTab === 'drive' && (
                <div className="space-y-6">
                  <section className="rounded-xl border border-slate-200 p-5">
                    <h3 className="text-[16px] font-bold text-slate-900">
                      Simpan Evaluasi ke Google Drive
                    </h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                      Simpan seluruh jawaban formulir saat ini sebagai file JSON
                      di Google Drive Anda agar aman dan dapat dibuka kembali di
                      perangkat lain.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={driveFileName}
                        onChange={(e) => setDriveFileName(e.target.value)}
                        placeholder="evaluasi-peserta.json"
                        className="min-h-[44px] flex-1 rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-[13px] text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                      />
                      <button
                        type="button"
                        onClick={requestSaveToDrive}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-[14px] font-semibold text-white whitespace-nowrap transition-colors hover:bg-teal-800"
                      >
                        <UploadCloud className="h-4 w-4" aria-hidden="true" />
                        <span>Simpan ke Drive</span>
                      </button>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[16px] font-bold text-slate-900">
                          File Evaluasi di Google Drive
                        </h3>
                        <p className="mt-0.5 text-[13px] text-slate-600">
                          Muat ulang arsip JSON evaluasi dari Drive atau kelola
                          file tersimpan.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={refreshDriveFiles}
                        disabled={isDriveLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            isDriveLoading ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Segarkan</span>
                      </button>
                    </div>

                    {isDriveLoading ? (
                      <div className="flex items-center justify-center py-8 text-[13px] text-slate-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Memuat daftar file Google Drive...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <p className="mt-4 rounded-xl border border-dashed border-slate-200 py-6 text-center text-[13px] text-slate-500">
                        Belum ada file evaluasi (`evaluasi-*.json`) ditemukan di
                        Google Drive Anda.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {driveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-3.5 sm:flex-row sm:items-center"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-mono text-[13px] font-semibold text-slate-900">
                                {file.name}
                              </p>
                              <p className="mt-0.5 text-[12px] text-slate-500">
                                {file.modifiedTime
                                  ? `Diubah ${new Date(
                                      file.modifiedTime
                                    ).toLocaleString('id-ID')}`
                                  : 'Google Drive'}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleLoadFromDrive(file)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-teal-800 hover:bg-teal-50"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Muat</span>
                              </button>
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`Buka ${file.name} di Google Drive`}
                                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => requestDeleteDriveFile(file)}
                                aria-label={`Hapus ${file.name}`}
                                className="inline-flex items-center rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* GMAIL TAB */}
              {activeTab === 'gmail' && (
                <div className="space-y-6">
                  <section className="rounded-xl border border-slate-200 p-5">
                    <h3 className="text-[16px] font-bold text-slate-900">
                      Kirim Ringkasan Evaluasi via Gmail
                    </h3>
                    <p className="mt-1 text-[13px] text-slate-600">
                      Kirim salinan lengkap ringkasan evaluasi ke coach atau ke
                      email peserta langsung melalui akun Gmail Anda.
                    </p>

                    <div className="mt-4 space-y-3.5">
                      <div>
                        <label
                          htmlFor="gmail-to"
                          className="block text-[12px] font-semibold text-slate-700"
                        >
                          Email Tujuan
                        </label>
                        <input
                          id="gmail-to"
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="coach@domain.com"
                          className="mt-1 min-h-[42px] w-full rounded-xl border border-slate-300 px-3.5 py-2 text-[14px] text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="gmail-subject"
                          className="block text-[12px] font-semibold text-slate-700"
                        >
                          Subjek Email
                        </label>
                        <input
                          id="gmail-subject"
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="mt-1 min-h-[42px] w-full rounded-xl border border-slate-300 px-3.5 py-2 text-[14px] text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="gmail-body"
                          className="block text-[12px] font-semibold text-slate-700"
                        >
                          Isi Ringkasan
                        </label>
                        <textarea
                          id="gmail-body"
                          rows={6}
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 p-3 font-mono text-[12px] leading-relaxed text-slate-900 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={requestSendGmail}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-teal-800"
                        >
                          <Send className="h-4 w-4" aria-hidden="true" />
                          <span>Kirim via Gmail</span>
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-[16px] font-bold text-slate-900">
                          Email Terkait Evaluasi (Gmail)
                        </h3>
                        <p className="mt-0.5 text-[13px] text-slate-600">
                          Pesan terbaru di akun Gmail Anda dengan kata kunci
                          Vitaloka atau Evaluasi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={refreshRecentEmails}
                        disabled={isGmailLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            isGmailLoading ? 'animate-spin' : ''
                          }`}
                        />
                        <span>Segarkan</span>
                      </button>
                    </div>

                    {isGmailLoading ? (
                      <div className="flex items-center justify-center py-6 text-[13px] text-slate-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Memuat pesan Gmail...</span>
                      </div>
                    ) : recentEmails.length === 0 ? (
                      <p className="mt-4 rounded-xl border border-dashed border-slate-200 py-6 text-center text-[13px] text-slate-500">
                        Belum ada email evaluasi ditemukan.
                      </p>
                    ) : (
                      <div className="mt-4 space-y-2.5">
                        {recentEmails.map((msg) => (
                          <div
                            key={msg.id}
                            className="rounded-xl border border-slate-200 p-3.5"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="truncate text-[13px] font-bold text-slate-900">
                                {msg.subject}
                              </p>
                              <span className="shrink-0 text-[11px] text-slate-500">
                                {msg.date
                                  ? new Date(msg.date).toLocaleDateString(
                                      'id-ID'
                                    )
                                  : ''}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[12px] text-slate-600">
                              Dari: {msg.from || '—'} · Kepada: {msg.to || '—'}
                            </p>
                            {msg.snippet && (
                              <p className="mt-1.5 line-clamp-2 text-[12px] text-slate-500">
                                {msg.snippet}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </>
          )}
        </div>

        {/* Explicit User Confirmation Overlay for Mutating / Sending Actions */}
        {pendingConfirm && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-action-title"
            className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h3
                id="confirm-action-title"
                className="text-lg font-bold text-slate-900"
              >
                {pendingConfirm.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
                {pendingConfirm.description}
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isConfirmExecuting}
                  onClick={() => setPendingConfirm(null)}
                  className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isConfirmExecuting}
                  onClick={executeConfirmedAction}
                  className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-60 ${
                    pendingConfirm.destructive
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-teal-700 hover:bg-teal-800'
                  }`}
                >
                  {isConfirmExecuting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>{pendingConfirm.confirmLabel}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
