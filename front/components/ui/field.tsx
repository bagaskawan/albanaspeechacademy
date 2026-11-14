"use client";

import type { ReactNode } from "react";

export type FieldOption = { value: string; label: string };

const controlClass =
  "w-full min-h-11 rounded-control border-0 border-b border-control bg-transparent py-2 text-base text-ink placeholder:text-muted focus:border-accent aria-invalid:border-danger";

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids: string[] = [];
  if (hint) ids.push(`${id}-hint`);
  if (error) ids.push(`${id}-error`);
  return ids.length ? ids.join(" ") : undefined;
}

function FieldMessages({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-sm font-semibold text-danger">
          {error}
        </p>
      ) : null}
    </>
  );
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="eyebrow block">
      {children}
      {required ? <><span aria-hidden="true"> *</span><span className="sr-only"> (wajib)</span></> : null}
    </label>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  type?: "text" | "email" | "tel" | "number";
  inputMode?: "text" | "numeric" | "tel" | "email";
  autoComplete?: string;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  error?: string;
};

export function TextField({
  id, label, value, onChange, name = id, type = "text", inputMode, autoComplete,
  maxLength, required, hint, placeholder, error,
}: TextFieldProps) {
  return (
    <div>
      <Label htmlFor={id} required={required}>{label}</Label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`mt-1.5 ${controlClass}`}
      />
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

type TextAreaProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function TextArea({
  id, label, value, onChange, name = id, rows = 4, maxLength, required, hint, error,
}: TextAreaProps) {
  return (
    <div>
      <Label htmlFor={id} required={required}>{label}</Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`mt-1.5 resize-y ${controlClass}`}
      />
      {maxLength ? (
        <p aria-hidden="true" className="mt-1 text-right text-xs text-muted tabular-nums">
          {value.length}/{maxLength}
        </p>
      ) : null}
      <FieldMessages id={id} hint={hint} error={error} />
    </div>
  );
}

type RadioGroupProps = {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly FieldOption[];
  required?: boolean;
  hint?: string;
  error?: string;
};

export function RadioGroup({
  id, label, name, value, onChange, options, required, hint, error,
}: RadioGroupProps) {
  return (
    <fieldset id={id} tabIndex={-1} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)}>
      <legend className="eyebrow">{label}{required ? <><span aria-hidden="true"> *</span><span className="sr-only"> (wajib)</span></> : null}</legend>
      <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1">
        {options.map((option) => (
          <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-accent"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </fieldset>
  );
}

type CheckboxGroupProps = {
  id: string;
  label: string;
  name: string;
  values: string[];
  onToggle: (value: string) => void;
  options: readonly FieldOption[];
  hint?: string;
  error?: string;
};

export function CheckboxGroup({
  id, label, name, values, onToggle, options, hint, error,
}: CheckboxGroupProps) {
  return (
    <fieldset id={id} tabIndex={-1} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)}>
      <legend className="eyebrow">{label}</legend>
      <div className="mt-1.5 grid gap-x-6 gap-y-1 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option.value} className="flex min-h-11 cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={() => onToggle(option.value)}
              className="size-4 accent-accent"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </fieldset>
  );
}
