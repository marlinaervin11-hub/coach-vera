import React from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface FieldWrapperProps {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  id,
  label,
  hint,
  required = true,
  error,
  children,
}) => {
  return (
    <div id={`field-${id}`} className="scroll-mt-24">
      <div className="mb-2.5">
        <label
          htmlFor={id}
          className="block text-[15px] font-semibold leading-snug text-slate-900"
        >
          {label}
          {required && (
            <span className="ml-1 text-teal-700" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {hint && (
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
            {hint}
          </p>
        )}
      </div>

      {children}

      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-[13px] font-medium text-rose-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'tel';
  placeholder?: string;
  hint?: string;
  error?: string;
  isValidBadge?: string;
  autoComplete?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  hint,
  error,
  isValidBadge,
  autoComplete,
}) => {
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-h-[46px] w-full rounded-xl border bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
            error
              ? 'border-rose-400 bg-rose-50/30 focus-visible:ring-rose-500'
              : 'border-slate-200 hover:border-slate-300 focus-visible:border-teal-600 focus-visible:ring-teal-600/30'
          }`}
        />
        {isValidBadge && !error && value.trim().length > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-teal-700">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{isValidBadge}</span>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
};

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  unit?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  unit,
  placeholder,
  hint,
  error,
  min = 0,
  max,
  step = '1',
}) => {
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-h-[46px] w-full rounded-xl border bg-white px-4 py-2.5 font-mono text-[15px] tabular-nums text-slate-900 placeholder:font-sans placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
            unit ? 'pr-24' : ''
          } ${
            error
              ? 'border-rose-400 bg-rose-50/30 focus-visible:ring-rose-500'
              : 'border-slate-200 hover:border-slate-300 focus-visible:border-teal-600 focus-visible:ring-teal-600/30'
          }`}
        />
        {unit && (
          <span className="pointer-events-none absolute right-4 text-[13px] font-medium text-slate-500">
            {unit}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
};

interface TextareaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  rows?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
  error,
  required = true,
  rows = 3,
}) => {
  return (
    <FieldWrapper
      id={id}
      label={label}
      hint={hint}
      required={required}
      error={error}
    >
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
          error
            ? 'border-rose-400 bg-rose-50/30 focus-visible:ring-rose-500'
            : 'border-slate-200 hover:border-slate-300 focus-visible:border-teal-600 focus-visible:ring-teal-600/30'
        }`}
      />
    </FieldWrapper>
  );
};

export interface RadioOption {
  value: string;
  label: string;
  desc?: string;
}

interface RadioGroupFieldProps {
  id: string;
  label: string;
  value: string;
  options: (string | RadioOption)[];
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  columns?: 1 | 2 | 3;
}

export const RadioGroupField: React.FC<RadioGroupFieldProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  hint,
  error,
  columns = 1,
}) => {
  const normalized: RadioOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const gridClass =
    columns === 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : columns === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-1';

  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error}>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className={`grid gap-2.5 ${gridClass}`}
      >
        {normalized.map((option) => {
          const checked = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(option.value)}
              className={`group flex min-h-[48px] w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 ${
                checked
                  ? 'border-teal-700 bg-teal-50/60 text-slate-900'
                  : error
                  ? 'border-rose-200 bg-white hover:border-slate-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  checked
                    ? 'border-teal-700 bg-teal-700'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}
              >
                {checked && (
                  <span className="h-2 w-2 rounded-full bg-white" />
                )}
              </span>
              <span className="flex-1">
                <span className="block text-[14px] font-medium leading-snug text-slate-900">
                  {option.label}
                </span>
                {option.desc && (
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-slate-500">
                    {option.desc}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </FieldWrapper>
  );
};

interface CheckboxGroupFieldProps {
  id: string;
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
  otherPlaceholder?: string;
  hint?: string;
  error?: string;
}

export const CheckboxGroupField: React.FC<CheckboxGroupFieldProps> = ({
  id,
  label,
  values,
  options,
  onChange,
  otherValue,
  onOtherChange,
  otherPlaceholder = 'Tulis jawaban lainnya di sini...',
  hint,
  error,
}) => {
  const toggleOption = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  };

  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error}>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = values.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggleOption(opt)}
              className={`group flex min-h-[48px] w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 ${
                checked
                  ? 'border-teal-700 bg-teal-50/60 text-slate-900'
                  : error
                  ? 'border-rose-200 bg-white hover:border-slate-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                  checked
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}
              >
                {checked && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
              </span>
              <span className="text-[14px] font-medium leading-snug text-slate-900">
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {onOtherChange !== undefined && (
        <div className="mt-3">
          <input
            type="text"
            value={otherValue ?? ''}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder={otherPlaceholder}
            aria-label={`${label} - lainnya`}
            className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2 text-[14px] text-slate-900 placeholder:text-slate-400 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/30"
          />
        </div>
      )}
    </FieldWrapper>
  );
};

interface LinearScaleFieldProps {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  hint?: string;
  error?: string;
}

export const LinearScaleField: React.FC<LinearScaleFieldProps> = ({
  id,
  label,
  value,
  onChange,
  minLabel,
  maxLabel,
  hint,
  error,
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error}>
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div
          role="radiogroup"
          aria-labelledby={id}
          className="grid grid-cols-5 gap-2 sm:grid-cols-10"
        >
          {numbers.map((num) => {
            const active = value === num;
            return (
              <button
                key={num}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`Skala ${num} dari 10`}
                onClick={() => onChange(num)}
                className={`flex min-h-[46px] items-center justify-center rounded-lg border font-mono text-[15px] font-semibold tabular-nums transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 ${
                  active
                    ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-4 text-[12px] text-slate-500">
          <span>1 = {minLabel}</span>
          <span className="text-right">10 = {maxLabel}</span>
        </div>
      </div>
    </FieldWrapper>
  );
};
