"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { caretFromDigits, formatPhone, formatThousands, percentDigits, rupiahDigits } from "@/lib/input-format";

export const adminFieldClass =
  "h-12 w-full rounded-full border border-admin-line bg-admin-surface px-[18px] text-base md:text-sm text-admin-ink placeholder:text-admin-text-faint shadow-none transition-[border-color,box-shadow,background-color] duration-150 hover:border-admin-line-strong outline-none focus-visible:border-admin-ink focus-visible:bg-admin-canvas focus-visible:ring-2 focus-visible:ring-admin-ink/8 aria-invalid:border-admin-danger aria-invalid:bg-admin-rose-soft aria-invalid:focus-visible:ring-admin-danger/15 disabled:cursor-not-allowed disabled:border-admin-line disabled:bg-admin-canvas disabled:text-admin-text-faint dark:bg-admin-surface dark:focus-visible:bg-admin-canvas";

export function AdminInput({ className, ...props }: React.ComponentProps<"input">) {
  return <Input className={cn(adminFieldClass, className)} {...props} />;
}

export function AdminTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      className={cn(
        adminFieldClass,
        "h-auto min-h-[104px] rounded-[20px] py-[14px] leading-[1.6] resize-y",
        className
      )}
      {...props}
    />
  );
}

export function AdminSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "Pilih…",
  required,
  disabled,
  "aria-invalid": ariaInvalid,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled} required={required}>
      <SelectTrigger
        id={id}
        aria-required={required ? "true" : undefined}
        aria-invalid={ariaInvalid}
        className={cn(adminFieldClass, "min-w-0 justify-between overflow-hidden [&>span]:min-w-0 [&>span]:truncate")}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-w-[var(--radix-select-trigger-width)] rounded-[20px]">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="min-h-10 text-sm">
            <span className="block truncate">{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function restoreCaret(input: HTMLInputElement | null, formatted: string, digitsBefore: number) {
  if (!input) return;
  const pos = caretFromDigits(formatted, digitsBefore);
  requestAnimationFrame(() => {
    input.setSelectionRange(pos, pos);
  });
}

function countDigitsBefore(text: string, caret: number | null): number {
  if (caret === null || caret <= 0) return 0;
  return text.slice(0, caret).replace(/\D/g, "").length;
}

function handleSeparatorBackspace(
  e: React.KeyboardEvent<HTMLInputElement>,
  separator: string,
  formatFromRaw: (raw: string) => string,
  apply: (raw: string) => void
) {
  if (e.key !== "Backspace") return;
  const el = e.currentTarget;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  if (start === null || end === null || start !== end || start <= 0) return;
  if (el.value[start - 1] !== separator) return;

  e.preventDefault();
  const digitsLeft = countDigitsBefore(el.value, start);
  const rawChars = el.value.split("");
  let digitIdx = start - 2;
  while (digitIdx >= 0 && !/\d/.test(rawChars[digitIdx])) digitIdx -= 1;
  if (digitIdx < 0) return;
  rawChars.splice(digitIdx, 1);
  const nextRaw = rawChars.join("");
  apply(nextRaw);
  restoreCaret(el, formatFromRaw(nextRaw), Math.max(0, digitsLeft - 1));
}

export function PriceInput({
  value,
  onValueChange,
  className,
  name,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (digits: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const formatted = formatThousands(value);

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-sm font-medium text-admin-text-secondary"
      >
        Rp.
      </span>
      {name && <input type="hidden" name={name} value={value} />}
      <AdminInput
        {...props}
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatted}
        className={cn("pl-[50px] tabular-nums", className)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          handleSeparatorBackspace(
            e,
            ".",
            (raw) => formatThousands(rupiahDigits(raw)),
            (raw) => onValueChange(rupiahDigits(raw))
          );
        }}
        onChange={(e) => {
          const el = e.currentTarget;
          const digitsBefore = countDigitsBefore(el.value, el.selectionStart);
          const nextDigits = rupiahDigits(el.value);
          onValueChange(nextDigits);
          restoreCaret(el, formatThousands(nextDigits), digitsBefore);
        }}
      />
    </div>
  );
}

export function PercentInput({
  value,
  onValueChange,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (digits: string) => void;
}) {
  return (
    <div className="relative">
      <AdminInput
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        className={cn("pr-[40px] tabular-nums", className)}
        onChange={(e) => onValueChange(percentDigits(e.currentTarget.value))}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-sm font-medium text-admin-text-secondary"
      >
        %
      </span>
    </div>
  );
}

export function PhoneInput({
  value,
  onValueChange,
  className,
  name,
  placeholder = "0812-3456-7890",
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (formatted: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <AdminInput
        {...props}
        ref={inputRef}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={placeholder}
        value={value}
        className={className}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          handleSeparatorBackspace(e, "-", formatPhone, (raw) => onValueChange(formatPhone(raw)));
        }}
        onChange={(e) => {
          const el = e.currentTarget;
          const digitsBefore = countDigitsBefore(el.value, el.selectionStart);
          const next = formatPhone(el.value);
          onValueChange(next);
          restoreCaret(el, next, digitsBefore);
        }}
      />
    </>
  );
}

const checkboxTones = {
  neutral: {
    base: "border-admin-line bg-admin-canvas text-admin-ink",
    checked: "border-admin-ink",
    desc: "text-admin-text-secondary",
  },
  mint: {
    base: "border-admin-line bg-admin-canvas text-admin-ink",
    checked: "border-admin-mint-dot/40 bg-admin-mint-soft text-admin-mint-ink",
    desc: "text-admin-text-secondary",
  },
  peach: {
    base: "border-admin-line bg-admin-canvas text-admin-ink",
    checked: "border-admin-peach-dot/40 bg-admin-peach-soft text-admin-peach-ink",
    desc: "text-admin-text-secondary",
  },
} as const;

export function CheckboxCard({
  id,
  checked,
  onCheckedChange,
  title,
  description,
  tone = "neutral",
  disabled,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  title: string;
  description?: string;
  tone?: "neutral" | "mint" | "peach";
  disabled?: boolean;
}) {
  const t = checkboxTones[tone];
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-14 cursor-pointer items-center gap-3 rounded-[20px] border px-5 py-3 transition-colors",
        t.base,
        checked && t.checked,
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => onCheckedChange(next === true)}
        className="size-[18px] shrink-0 data-[state=checked]:border-admin-ink data-[state=checked]:bg-admin-ink data-[state=checked]:text-admin-on-ink focus-visible:ring-2 focus-visible:ring-admin-ink/8"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-snug">{title}</span>
        {description && (
          <span className={cn("mt-0.5 block text-[12px] leading-snug", checked && tone !== "neutral" ? "opacity-85" : t.desc)}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
