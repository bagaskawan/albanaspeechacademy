"use client";

import React, { useId, useRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectLineOption {
  value: string;
  label: string;
}

export interface SelectLineProps {
  id?: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectLineOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

/**
 * Underline select built on Radix Select so keyboard navigation, typeahead,
 * escape, and focus return are handled by the primitive.
 */
export function SelectLine({
  id,
  label,
  hint,
  placeholder = "Pilih opsi…",
  value,
  onValueChange,
  options,
  error,
  disabled,
  required,
  className,
  triggerClassName,
  contentClassName,
}: SelectLineProps) {
  const generatedId = useId();
  const fieldId = id ?? `selectline-${generatedId}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={fieldId}
          onClick={() => triggerRef.current?.click()}
          className="text-[11px] font-bold tracking-wider text-zinc-800 dark:text-zinc-400 uppercase block mb-1"
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {hint && (
        <span id={hintId} className="text-[10px] text-zinc-500 dark:text-zinc-400 block mb-1">
          {hint}
        </span>
      )}

      <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          ref={triggerRef}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full flex items-center justify-between bg-transparent border-b py-1.5 text-left text-xs font-sans rounded-none transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-destructive"
              : "border-zinc-300 dark:border-zinc-700 focus:border-[#2F5C86] dark:focus:border-[#D5E7FF]",
            triggerClassName
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} className="truncate text-zinc-900 dark:text-white" />
          <SelectPrimitive.Icon className="shrink-0 ml-2 text-zinc-500">
            <ChevronDown size={14} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            className={cn(
              "z-[60] max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-y-auto rounded-xl border border-border-default bg-bg-card p-1 shadow-lg",
              contentClassName
            )}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-2 text-xs font-semibold text-text-secondary outline-none transition-colors data-[highlighted]:bg-bg-well data-[highlighted]:text-text-primary data-[state=checked]:text-text-primary"
                >
                  <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check className="h-3.5 w-3.5" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive font-semibold animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
