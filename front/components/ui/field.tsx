"use client";

import type { ReactNode } from "react";

export type FieldOption = { value: string; label: string };

const controlClass =
  "w-full h-12 rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] px-3 text-base text-[var(--tone-ink)] placeholder:text-[var(--tone-muted)] focus:border-2 focus:outline-none aria-invalid:border-danger";

const areaClass =
  "w-full rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-3 text-base text-[var(--tone-ink)] placeholder:text-[var(--tone-muted)] focus:border-2 focus:outline-none aria-invalid:border-danger";

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
        <p id={`${id}-hint`} className="eyebrow mt-2 normal-case text-[var(--tone-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="eyebrow mt-2 normal-case text-danger">
          {error}
        </p>
      ) : null}
    </>
  );
}

function Label({ htmlFor, children, required }: { htmlFor: string; children: ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-xs block font-medium text-[var(--tone-ink)]">
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
  /** id `<datalist>` saran isian. */
  list?: string;
};

export function TextField({
  id, label, value, onChange, name = id, type = "text", inputMode, autoComplete,
  maxLength, required, hint, placeholder, error, list,
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
        list={list}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`mt-2 ${controlClass}`}
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
        className={`mt-2 resize-y ${areaClass}`}
      />
      {maxLength ? (
        <p aria-hidden="true" className="eyebrow mt-1 text-right normal-case text-[var(--tone-muted)] tabular-nums">
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
      <legend className="type-small font-medium text-[var(--tone-ink)]">
        {label}
        {required ? <><span aria-hidden="true"> *</span><span className="sr-only"> (wajib)</span></> : null}
      </legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xs px-4 py-2 ${
                selected
                  ? "border-2 border-[var(--tone-accent)] bg-[var(--tone-tile)]"
                  : "border border-[var(--tone-rule)] bg-[var(--tone-bg)]"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="size-4 accent-[var(--tone-accent)]"
              />
              <span className="type-small font-medium">{option.label}</span>
            </label>
          );
        })}
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
      <legend className="type-small font-medium text-[var(--tone-ink)]">{label}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <label
              key={option.value}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xs px-4 py-2 ${
                checked
                  ? "border-2 border-[var(--tone-accent)] bg-[var(--tone-tile)]"
                  : "border border-[var(--tone-rule)] bg-[var(--tone-bg)]"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onToggle(option.value)}
                className="size-4 accent-[var(--tone-accent)]"
              />
              <span className="type-small font-medium">{option.label}</span>
            </label>
          );
        })}
      </div>
      <FieldMessages id={id} hint={hint} error={error} />
    </fieldset>
  );
}
