"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Tile } from "@/components/home/ui/tile";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { RegisterBrandBar } from "@/components/register/register-brand-bar";
import type { ProgramCard } from "@/lib/server/program-showcase";

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function ProgramSelectorView({
  programs,
  status,
}: {
  programs: ProgramCard[];
  status: "ready" | "loading" | "failed";
}) {
  const [open, setOpen] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      setDragY(0);
      setDragging(false);
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setSheetVisible(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }

    setSheetVisible(false);
    const timer = window.setTimeout(() => {
      if (dialog.open) {
        dialog.close();
      }
      setDragY(0);
      setDragging(false);
    }, 240);
    return () => window.clearTimeout(timer);
  }, [open]);

  function handleCancel(event: React.SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    setOpen(false);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDialogElement>) {
    const dialog = dialogRef.current;
    if (!dialog || dialog.scrollTop > 0) return;
    touchStartY.current = event.touches[0]?.clientY ?? null;
    touchStartTime.current = Date.now();
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDialogElement>) {
    if (touchStartY.current === null) return;
    const currentY = event.touches[0]?.clientY ?? touchStartY.current;
    const delta = currentY - touchStartY.current;
    if (delta > 0) {
      setDragging(true);
      setDragY(delta);
    }
  }

  function handleTouchEnd() {
    if (touchStartY.current === null) return;
    const elapsed = Math.max(1, Date.now() - touchStartTime.current);
    const velocity = dragY / elapsed;
    touchStartY.current = null;
    setDragging(false);
    if (dragY > 80 || (dragY > 24 && velocity > 0.45)) {
      setOpen(false);
    } else {
      setDragY(0);
    }
  }

  return (
    <main id="main-content" className="tone-mist min-h-screen py-8 lg:py-16">
      <div className="home-container">
        <h1 className="sr-only">Pilih program pendaftaran Public Training</h1>
        <Tile tone="plain" className="tone-canvas p-6 lg:p-10">
          <RegisterBrandBar />
          <section className="mt-8">
            <p className="eyebrow text-[var(--tone-muted)]">Public Training</p>
            <h2 className="type-title mt-2">Pilih program pendaftaran</h2>
            <p className="type-small mt-3 max-w-[52ch] text-[var(--tone-muted)]">
              Pilih salah satu jalur kelas Public Training untuk melanjutkan ke formulir pendaftaran.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="button-primary cursor-pointer"
              >
                Pilih Program
              </button>
              <Link className="button-secondary" href="/">
                Kembali ke beranda
              </Link>
            </div>
          </section>
        </Tile>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={handleCancel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
        style={dragY > 0 ? { transform: `translateY(${dragY}px)` } : undefined}
        className={`mt-auto mb-0 mx-0 w-full max-w-full max-h-[88dvh] overflow-y-auto rounded-none border-t border-x-0 border-b-0 border-[var(--tone-rule)] bg-[var(--tone-bg)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-[var(--tone-ink)] shadow-xl backdrop:transition-opacity backdrop:duration-200 sm:m-auto sm:w-[min(38rem,calc(100vw-2rem))] sm:max-h-[90dvh] sm:border sm:p-8 ${
          dragging ? "transition-none" : "transition-all duration-200 ease-out"
        } ${
          sheetVisible
            ? "translate-y-0 opacity-100 backdrop:bg-black/55"
            : "translate-y-full opacity-0 backdrop:bg-black/0 sm:translate-y-3"
        }`}
      >
        <div
          aria-hidden="true"
          className="mx-auto mb-3 h-1 w-10 bg-[var(--tone-rule)] sm:hidden"
        />
        <div className="flex items-start justify-between gap-4 border-b border-[var(--tone-rule)] pb-4">
          <div>
            <p className="eyebrow text-[var(--tone-muted)]">Public Training</p>
            <h2 id={titleId} className="type-title mt-1.5 text-xl font-bold sm:text-2xl">
              Pilih Program Pendaftaran
            </h2>
            <p className="type-small mt-1.5 text-[var(--tone-muted)]">
              Pilih program kelas yang ingin kamu ikuti untuk membuka formulir pendaftaran.
            </p>
          </div>
        </div>

        {status === "loading" ? (
          <div className="mt-5 flex flex-col gap-3">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className="h-24 animate-pulse rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)]"
              />
            ))}
          </div>
        ) : status === "failed" ? (
          <div className="mt-5 rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-5">
            <p className="type-body font-medium">Daftar program belum bisa dimuat.</p>
            <p className="type-small mt-1 text-[var(--tone-muted)]">
              Muat ulang halaman atau lihat daftar program di beranda.
            </p>
          </div>
        ) : programs.length === 0 ? (
          <div className="mt-5 rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-5">
            <p className="type-body font-medium">Belum ada program Public Training yang tersedia.</p>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {programs.map((program) => {
              const targetHref = program.registrationUrl ?? `/program/${encodeURIComponent(program.slug)}`;
              const isOpen = Boolean(program.registrationUrl);
              return (
                <li key={program.slug}>
                  <Link
                    href={targetHref}
                    className={`group flex items-center justify-between gap-4 rounded-xs border p-4 transition-colors ${
                      isOpen
                        ? "border-[var(--tone-rule)] bg-[var(--tone-tile)] hover:border-[var(--tone-accent)] hover:bg-[var(--tone-bg)]"
                        : "border-[var(--tone-rule)] bg-[var(--tone-tile)]/60 opacity-85 hover:border-[var(--tone-muted)]"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="type-body font-semibold text-[var(--tone-ink)]">
                          {program.title}
                        </span>
                        <span
                          className={`eyebrow rounded-xs px-2 py-0.5 ${
                            isOpen
                              ? "bg-[var(--tone-accent)] text-white"
                              : "border border-[var(--tone-rule)] text-[var(--tone-muted)]"
                          }`}
                        >
                          {program.statusLabel}
                        </span>
                      </div>

                      {program.batch ? (
                        <p className="type-small mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[var(--tone-muted)]">
                          <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                          <span>{program.batch.name}</span>
                          {program.batch.dateLabels[0] ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{program.batch.dateLabels[0]}</span>
                            </>
                          ) : null}
                          {program.batch.priceIdr ? (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold tabular-nums text-[var(--tone-ink)]">
                                {rupiah(program.batch.priceIdr)}
                              </span>
                            </>
                          ) : null}
                        </p>
                      ) : (
                        <p className="type-small mt-1 text-[var(--tone-muted)]">
                          {program.summary}
                        </p>
                      )}
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider ${
                        isOpen
                          ? "text-[var(--tone-accent)] group-hover:translate-x-0.5 transition-transform"
                          : "text-[var(--tone-muted)]"
                      }`}
                    >
                      <span>{isOpen ? "Daftar" : "Detail"}</span>
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--tone-rule)] pt-4">
          <Link
            href="/"
            className="type-small text-[var(--tone-muted)] underline-offset-4 transition-colors hover:text-[var(--tone-ink)] hover:underline"
          >
            Kembali ke beranda
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="type-small inline-flex min-h-10 cursor-pointer items-center rounded-xs border border-[var(--tone-rule)] px-4 py-2 font-display font-semibold text-[var(--tone-ink)] transition-colors hover:bg-[var(--tone-tile)]"
          >
            Tutup
          </button>
        </div>
      </dialog>

      <ThemeToggle className="fixed right-5 bottom-5 z-50 inline-flex size-12 aspect-square items-center justify-center rounded-full border border-[var(--tone-rule)] bg-[var(--tone-tile)] text-[var(--tone-ink)] shadow-lg transition-transform hover:scale-105 hover:bg-[var(--tone-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] sm:right-6 sm:bottom-6" />
    </main>
  );
}
