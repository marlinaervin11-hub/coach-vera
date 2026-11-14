import React from 'react';
import { Check } from 'lucide-react';
import { AssessmentData, SECTIONS, SectionId } from '../types/assessment';
import { getSectionCompletion } from '../utils/validation';

interface SectionSidebarProps {
  currentSection: SectionId;
  onSelectSection: (id: SectionId) => void;
  data: AssessmentData;
}

export const SectionSidebar: React.FC<SectionSidebarProps> = ({
  currentSection,
  onSelectSection,
  data,
}) => {
  const totalRequired = SECTIONS.reduce(
    (sum, sec) => sum + sec.requiredFields.length,
    0
  );
  const totalAnswered = SECTIONS.reduce(
    (sum, sec) => sum + getSectionCompletion(sec.id, data).answered,
    0
  );
  const progressPercent = Math.round((totalAnswered / totalRequired) * 100);

  return (
    <>
      {/* Mobile / Tablet compact horizontal progress & step selector */}
      <div className="mb-6 lg:hidden">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium text-slate-500">
                Bagian <span className="font-mono tabular-nums">{currentSection}</span> dari 6
              </p>
              <h2 className="mt-0.5 text-[16px] font-bold text-slate-900">
                {SECTIONS[currentSection - 1].shortTitle}
              </h2>
            </div>
            <p className="font-mono text-[13px] font-semibold tabular-nums text-teal-800">
              {progressPercent}% selesai
            </p>
          </div>

          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progres pengisian formulir"
          >
            <div
              className="h-full rounded-full bg-teal-700 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
            {SECTIONS.map((sec) => {
              const { isComplete } = getSectionCompletion(sec.id, data);
              const isActive = currentSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectSection(sec.id)}
                  className={`flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : isComplete
                      ? 'bg-teal-50 text-teal-900 hover:bg-teal-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="font-mono tabular-nums">0{sec.id}</span>
                  <span>{sec.shortTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block lg:col-span-4">
        <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="border-b border-slate-100 pb-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-semibold text-slate-700">
                Progres Pengisian
              </span>
              <span className="font-mono text-[13px] font-semibold tabular-nums text-teal-800">
                {totalAnswered}/{totalRequired} terjawab
              </span>
            </div>
            <div
              className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progres pengisian formulir"
            >
              <div
                className="h-full rounded-full bg-teal-700 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] text-slate-500">
              Data tersimpan otomatis di browser kamu.
            </p>
          </div>

          <nav aria-label="Navigasi bagian formulir" className="mt-5 space-y-1.5">
            {SECTIONS.map((sec) => {
              const { answered, total, isComplete } = getSectionCompletion(sec.id, data);
              const isActive = currentSection === sec.id;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectSection(sec.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[12px] font-semibold tabular-nums ${
                        isActive
                          ? 'bg-teal-600 text-white'
                          : isComplete
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isComplete && !isActive ? (
                        <Check className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        `0${sec.id}`
                      )}
                    </span>
                    <div className="min-w-0">
                      <span
                        className={`block truncate text-[14px] font-semibold ${
                          isActive ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {sec.shortTitle}
                      </span>
                      <span
                        className={`block text-[12px] ${
                          isActive ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {sec.estimatedMinutes}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 font-mono text-[12px] tabular-nums ${
                      isActive
                        ? 'text-slate-300'
                        : isComplete
                        ? 'font-semibold text-teal-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {answered}/{total}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
