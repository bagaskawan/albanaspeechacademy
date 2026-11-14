import React, { forwardRef, useId } from "react";

export interface TextareaLineProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  label: string;
  hint?: string;
  rows?: number;
  error?: string;
  className?: string;
}

export const TextareaLine = forwardRef<HTMLTextAreaElement, TextareaLineProps>(
  ({ id, label, hint, rows = 3, error, className = "", required, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? `textarealine-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    const describedBy =
      [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full">
        <label
          htmlFor={fieldId}
          className="text-[11px] font-bold tracking-wider text-zinc-800 dark:text-zinc-400 uppercase block mb-1"
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>

        {hint && (
          <span id={hintId} className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">
            {hint}
          </span>
        )}

        <div
          className={`w-full border-b transition-colors ${error
            ? "border-destructive"
            : "border-zinc-300 dark:border-zinc-700 focus-within:border-[#2F5C86] dark:focus-within:border-[#D5E7FF]"
            }`}
        >
          <textarea
            ref={ref}
            id={fieldId}
            rows={rows}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`w-full bg-transparent py-1.5 text-xs leading-relaxed rounded-none resize-y focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive font-semibold animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextareaLine.displayName = "TextareaLine";
