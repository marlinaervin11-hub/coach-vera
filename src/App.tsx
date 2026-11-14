import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cloud,
  LogOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { SectionForms } from './components/SectionForms';
import { SectionSidebar } from './components/SectionSidebar';
import { SummaryView } from './components/SummaryView';
import {
  WorkspaceHubModal,
  WorkspaceTab,
} from './components/WorkspaceHubModal';
import {
  clearAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from './services/googleAuth';
import {
  AssessmentData,
  DEMO_DATA,
  INITIAL_DATA,
  SECTIONS,
  SectionId,
} from './types/assessment';
import {
  FormErrors,
  validateAllSections,
  validateField,
  validateSection,
} from './utils/validation';

const STORAGE_KEY = 'vitaloka_assessment_v1';

export default function App() {
  const [data, setData] = useState<AssessmentData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...INITIAL_DATA, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore corrupted localStorage
    }
    return INITIAL_DATA;
  });

  const [currentSection, setCurrentSection] = useState<SectionId>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [sectionErrorBanner, setSectionErrorBanner] = useState<string | null>(
    null
  );

  // Google Workspace Auth & Modal state (access token kept in memory only)
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('forms');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      (user) => {
        setGoogleUser(user);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota errors
    }
  }, [data]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Gagal masuk dengan Google. Silakan coba lagi.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
  };

  const handleOpenWorkspace = (tab: WorkspaceTab) => {
    setWorkspaceTab(tab);
    setWorkspaceOpen(true);
  };

  const handleLoadAssessment = (
    loaded: AssessmentData,
    openSummary = false
  ) => {
    setData(loaded);
    setErrors({});
    setSectionErrorBanner(null);
    setIsSubmitted(openSummary);
    setCurrentSection(1);
    setWorkspaceOpen(false);
    scrollToTop();
  };

  const activeSectionMeta = SECTIONS[currentSection - 1];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToFirstError = (errObj: FormErrors) => {
    const firstKey = Object.keys(errObj)[0];
    if (!firstKey) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`field-${firstKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  const handleFieldChange = <K extends keyof AssessmentData>(
    field: K,
    value: AssessmentData[K]
  ) => {
    const nextData = { ...data, [field]: value };
    setData(nextData);

    // Clear or live-update error if field already had an error or is email
    if (errors[field] || field === 'email') {
      if (field === 'email' && String(value).trim() === '' && !errors.email) {
        return;
      }
      const fieldError = validateField(field, nextData);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldError) {
          next[field] = fieldError;
        } else {
          delete next[field];
        }
        return next;
      });
    }
    if (sectionErrorBanner) {
      setSectionErrorBanner(null);
    }
  };

  const handleBlurField = (field: keyof AssessmentData) => {
    const val = data[field];
    const hasValue = Array.isArray(val)
      ? val.length > 0
      : val !== null && String(val).trim() !== '';

    // Always validate email on blur if typed, or any field that already shows an error
    if (field === 'email' || hasValue || errors[field]) {
      const err = validateField(field, data);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) next[field] = err;
        else delete next[field];
        return next;
      });
    }
  };

  const handleJumpSection = (targetId: SectionId) => {
    setIsSubmitted(false);
    setSectionErrorBanner(null);
    setCurrentSection(targetId);
    scrollToTop();
  };

  const handleNext = () => {
    const sectionErrors = validateSection(currentSection, data);
    if (Object.keys(sectionErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...sectionErrors }));
      const count = Object.keys(sectionErrors).length;
      setSectionErrorBanner(
        `Masih ada ${count} pertanyaan pada bagian ini yang perlu dilengkapi atau diperbaiki.`
      );
      scrollToFirstError(sectionErrors);
      return;
    }

    setSectionErrorBanner(null);
    if (currentSection < 6) {
      setCurrentSection((prev) => (prev + 1) as SectionId);
      scrollToTop();
    }
  };

  const handlePrevious = () => {
    setSectionErrorBanner(null);
    if (currentSection > 1) {
      setCurrentSection((prev) => (prev - 1) as SectionId);
      scrollToTop();
    }
  };

  const handleSubmit = () => {
    const { errors: allErrors, firstInvalidSection } =
      validateAllSections(data);

    if (firstInvalidSection !== null) {
      setErrors(allErrors);
      const totalMissing = Object.keys(allErrors).length;
      setCurrentSection(firstInvalidSection);
      setSectionErrorBanner(
        `Terdapat ${totalMissing} pertanyaan di formulir yang belum lengkap atau belum valid. Kamu diarahkan ke Bagian ${firstInvalidSection}.`
      );
      const firstSectionErrors = validateSection(firstInvalidSection, data);
      setTimeout(() => scrollToFirstError(firstSectionErrors), 120);
      return;
    }

    setErrors({});
    setSectionErrorBanner(null);
    setIsSubmitted(true);
    scrollToTop();
  };

  const handleFillDemo = () => {
    setData(DEMO_DATA);
    setErrors({});
    setSectionErrorBanner(null);
    setIsSubmitted(false);
  };

  const confirmReset = () => {
    setData(INITIAL_DATA);
    setErrors({});
    setSectionErrorBanner(null);
    setCurrentSection(1);
    setIsSubmitted(false);
    setShowResetConfirm(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    scrollToTop();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 3-Zone Top Bar */}
      <header className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleJumpSection(1);
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Vitaloka
          </a>

          <nav
            aria-label="Bagian utama"
            className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
          >
            <button
              type="button"
              onClick={() => handleJumpSection(1)}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Identitas
            </button>
            <button
              type="button"
              onClick={() => handleJumpSection(3)}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Nutrisi
            </button>
            <button
              type="button"
              onClick={() => handleJumpSection(4)}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Energi
            </button>
            <button
              type="button"
              onClick={() => handleJumpSection(6)}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-slate-900"
            >
              Refleksi
            </button>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenWorkspace('forms')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50/70 px-3.5 py-2 text-[13px] font-semibold text-teal-900 whitespace-nowrap shrink-0 transition-colors hover:bg-teal-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
            >
              <Cloud className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              <span>Google Workspace</span>
            </button>

            {needsAuth ? (
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                compact
                label={isLoggingIn ? 'Masuk...' : 'Sign in with Google'}
              />
            ) : (
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] text-slate-700">
                <span className="max-w-[140px] truncate font-medium">
                  {googleUser?.displayName || googleUser?.email || 'Terhubung'}
                </span>
                <button
                  type="button"
                  onClick={handleGoogleLogout}
                  aria-label="Keluar dari Google"
                  title="Keluar dari Google"
                  className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset Form</span>
            </button>
          </div>
        </div>
        {authError && (
          <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-[13px] text-rose-800">
              <span>{authError}</span>
              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="text-[12px] font-semibold underline"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="top" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {!isSubmitted ? (
          <>
            {/* Concise Editorial Intro */}
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-slate-500">
                  <span className="font-semibold text-teal-800">transformwithST</span>
                  <span aria-hidden="true">·</span>
                  <span>6 Bagian</span>
                  <span aria-hidden="true">·</span>
                  <span>Estimasi 10 menit</span>
                  <span aria-hidden="true">·</span>
                  <span>Tersimpan otomatis</span>
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 [text-wrap:balance] sm:text-4xl">
                  Evaluasi Kesehatan, Nutrisi &amp; Gaya Hidup — transformwithST
                </h1>
                <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">
                  Isi setiap bagian dengan jujur sesuai kondisi harian kamu saat
                  ini agar evaluasi dan rekomendasi program transformwithST dapat
                  disesuaikan secara akurat.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-semibold text-slate-700 whitespace-nowrap transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                  <span>Isi Contoh Data</span>
                </button>
              </div>
            </div>

            {/* Responsive 2-Column Workspace */}
            <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
              <SectionSidebar
                currentSection={currentSection}
                onSelectSection={handleJumpSection}
                data={data}
              />

              <div className="lg:col-span-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
                  {/* Section Title */}
                  <div className="border-b border-slate-100 pb-6">
                    <p className="font-mono text-[12px] font-medium text-teal-800">
                      Bagian {currentSection} dari 6
                    </p>
                    <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                      {activeSectionMeta.title}
                    </h2>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600">
                      {activeSectionMeta.subtitle}
                    </p>
                  </div>

                  {/* Validation Alert Banner */}
                  {sectionErrorBanner && (
                    <div
                      role="alert"
                      className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-[14px] text-rose-800"
                    >
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-rose-600"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-semibold">Periksa kembali isian kamu</p>
                        <p className="mt-0.5 text-[13px] text-rose-700">
                          {sectionErrorBanner}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Active Section Fields */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSection}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-7"
                    >
                      <SectionForms
                        sectionId={currentSection}
                        data={data}
                        errors={errors}
                        onChange={handleFieldChange}
                        onBlurField={handleBlurField}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Footer Action Bar */}
                  <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {currentSection > 1 && (
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700 whitespace-nowrap transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 sm:w-auto"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          <span>Sebelumnya</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {currentSection < 6 ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-[14px] font-semibold text-white whitespace-nowrap transition-colors hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 sm:w-auto"
                        >
                          <span>
                            Lanjut ke {SECTIONS[currentSection].shortTitle}
                          </span>
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-[14px] font-semibold text-white whitespace-nowrap transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40 sm:w-auto"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          <span>Selesaikan &amp; Lihat Ringkasan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <SummaryView
            data={data}
            onEditSection={(secId) => handleJumpSection(secId)}
            onResetAll={() => setShowResetConfirm(true)}
            onOpenWorkspace={handleOpenWorkspace}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="no-print mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 text-[13px] text-slate-500 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <span className="font-display font-semibold text-slate-700">
            Vitaloka
          </span>
          <span>
            Data evaluasi disimpan secara lokal di perangkat kamu dan tidak
            dibagikan tanpa persetujuan.
          </span>
        </div>
      </footer>

      {/* Reset Confirmation Modal (in-app, never window.confirm) */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2
              id="reset-dialog-title"
              className="text-lg font-bold text-slate-900"
            >
              Reset seluruh jawaban?
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
              Semua data yang sudah kamu isi pada Bagian 1 hingga Bagian 6 akan
              dihapus dan formulir kembali kosong.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-[14px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="min-h-[42px] rounded-xl bg-rose-600 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-rose-700"
              >
                Ya, Hapus &amp; Reset
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Google Workspace Hub Modal */}
      <WorkspaceHubModal
        isOpen={workspaceOpen}
        initialTab={workspaceTab}
        onClose={() => setWorkspaceOpen(false)}
        user={googleUser}
        accessToken={accessToken}
        isLoggingIn={isLoggingIn}
        onSignIn={handleGoogleLogin}
        onAuthExpired={() => {
          clearAccessToken();
          setAccessToken(null);
          setNeedsAuth(true);
        }}
        data={data}
        onLoadAssessment={handleLoadAssessment}
      />
    </div>
  );
}
