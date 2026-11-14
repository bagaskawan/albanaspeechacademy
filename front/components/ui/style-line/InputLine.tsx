import React, { forwardRef, useId } from "react";

export interface InputLineProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  prefixText?: string;
  focusClassName?: string;
}

export const InputLine = forwardRef<HTMLInputElement, InputLineProps>(
  ({ id, label, error, hint, prefixText, className = "", focusClassName, required, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? `inputline-${generatedId}`;
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
          className={`flex items-center w-full border-b transition-colors ${error
            ? "border-destructive"
            : `border-zinc-300 dark:border-zinc-700 ${focusClassName ||
            "focus-within:border-[#2F5C86] dark:focus-within:border-[#D5E7FF]"
            }`
            }`}
        >
          {prefixText && (
            <span className="text-zinc-400 dark:text-zinc-500 mr-1 select-none text-sm py-1.5">
              {prefixText}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={`w-full bg-transparent py-1.5 text-xs rounded-none focus:outline-none placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-white ${className}`}
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

InputLine.displayName = "InputLine";
