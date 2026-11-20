"use client";

import { useMemo, useRef, useState } from "react";
import { canonicalRegion, REGIONS } from "@/lib/demographics";
import { MAX_TEXT } from "@/lib/registration-form";

type DomicileFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const MAX_SUGGESTIONS = 60;

export function DomicileField({ value, onChange, error }: DomicileFieldProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return REGIONS.slice(0, MAX_SUGGESTIONS);
    const startsWith: string[] = [];
    const contains: string[] = [];
    for (const region of REGIONS) {
      const lower = region.toLowerCase();
      if (lower.startsWith(query)) startsWith.push(region);
      else if (lower.includes(query)) contains.push(region);
      if (startsWith.length + contains.length >= MAX_SUGGESTIONS) break;
    }
    return [...startsWith, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [value]);

  function selectRegion(region: string) {
    onChange(region);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (containerRef.current?.contains(event.relatedTarget as Node | null)) return;
    const canonical = canonicalRegion(value);
    if (canonical && canonical !== value) {
      onChange(canonical);
    }
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (suggestions.length ? (prev + 1) % suggestions.length : -1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        suggestions.length ? (prev <= 0 ? suggestions.length - 1 : prev - 1) : -1,
      );
    } else if (event.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      selectRegion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const listboxId = "domicile-listbox";
  const describedBy = [error ? "domicile-error" : "", "domicile-hint"].filter(Boolean).join(" ") || undefined;

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <label htmlFor="domicile" className="type-small block font-medium text-[var(--tone-ink)]">
        Domisili
        <span aria-hidden="true"> *</span>
        <span className="sr-only"> (wajib)</span>
      </label>
      <input
        id="domicile"
        name="domicile"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={
          open && activeIndex >= 0 ? `domicile-opt-${activeIndex}` : undefined
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        maxLength={MAX_TEXT}
        required
        placeholder="Ketik lalu pilih, mis. Kota Bandung"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActiveIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className="mt-2 min-h-11 w-full rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] px-3.5 py-2.5 text-base text-[var(--tone-ink)] placeholder:text-[var(--tone-muted)]/60 focus:border-[var(--tone-accent)] focus:outline-none"
      />
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Daftar kota dan kabupaten"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] py-1 shadow-lg"
        >
          {suggestions.length > 0 ? (
            suggestions.map((region, idx) => {
              const isSelected = region === value;
              const isActive = idx === activeIndex;
              return (
                <li
                  key={region}
                  id={`domicile-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectRegion(region);
                  }}
                  className={`cursor-pointer px-3.5 py-2.5 text-sm transition-colors ${
                    isActive || isSelected
                      ? "bg-[var(--tone-tile)] font-semibold text-[var(--tone-ink)]"
                      : "text-[var(--tone-ink)] hover:bg-[var(--tone-tile)]"
                  }`}
                >
                  {region}
                </li>
              );
            })
          ) : (
            <li className="px-3.5 py-2.5 text-sm text-[var(--tone-muted)]">
              Tidak ditemukan. Ketik nama kota/kabupaten lain.
            </li>
          )}
        </ul>
      ) : null}
      <p id="domicile-hint" className="eyebrow mt-1.5 normal-case text-[var(--tone-muted)]">
        Ketik nama kota/kabupaten lalu pilih dari daftar.
      </p>
      {error ? (
        <p id="domicile-error" role="alert" className="eyebrow mt-1.5 normal-case text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
