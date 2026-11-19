"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Maximize2 } from "lucide-react";
import type { HomeLegality } from "@/lib/home-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SkeletonImage } from "./skeleton-image";

export type LegalDocumentItem = {
  key: keyof HomeLegality;
  title: string;
  number: string;
  issuer: string;
};

type LegalityRegistryProps = {
  documents: readonly LegalDocumentItem[];
  legality: HomeLegality;
};

export function LegalityRegistry({ documents, legality }: LegalityRegistryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [npwpSide, setNpwpSide] = useState<"front" | "back">("front");
  const [cardNpwpSide, setCardNpwpSide] = useState<"front" | "back">("front");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeDoc = activeIndex !== null ? documents[activeIndex] : null;
  const activeFrontUrl = activeDoc ? legality[activeDoc.key] : null;
  const activeBackUrl =
    activeDoc?.key === "npwpFront" ? legality.npwpBack : null;
  const displayedUrl =
    activeDoc?.key === "npwpFront" && npwpSide === "back" && activeBackUrl
      ? activeBackUrl
      : activeFrontUrl;

  const inspectableIndices = documents
    .map((doc, idx) => (legality[doc.key] ? idx : -1))
    .filter((idx) => idx !== -1);

  const currentInspectPos =
    activeIndex !== null ? inspectableIndices.indexOf(activeIndex) : -1;

  function openDocument(index: number) {
    const doc = documents[index];
    setNpwpSide(doc?.key === "npwpFront" ? cardNpwpSide : "front");
    setActiveIndex(index);
  }

  function stepDocument(delta: number) {
    if (inspectableIndices.length <= 1 || currentInspectPos === -1) return;
    const nextPos =
      (currentInspectPos + delta + inspectableIndices.length) %
      inspectableIndices.length;
    setNpwpSide("front");
    setActiveIndex(inspectableIndices[nextPos]);
  }

  async function copyNumber(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current));
      }, 2000);
    } catch {
      /* Clipboard API unavailable in restricted contexts */
    }
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {documents.map((doc, index) => {
          const frontUrl = legality[doc.key];
          const backUrl = doc.key === "npwpFront" ? legality.npwpBack : null;
          const cardImageUrl =
            doc.key === "npwpFront" && cardNpwpSide === "back" && backUrl
              ? backUrl
              : frontUrl;
          const isCopied = copiedKey === doc.key;

          return (
            <li
              key={doc.key}
              data-motion="rise"
              className="flex h-full flex-col justify-between rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)] p-4"
            >
              <div className="flex flex-col gap-4">
                {cardImageUrl ? (
                  <button
                    type="button"
                    onClick={() => openDocument(index)}
                    aria-label={`Periksa ${doc.title}`}
                    className="group relative aspect-[3/4] w-full overflow-hidden rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-2.5 text-left transition-colors hover:border-[var(--tone-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] cursor-pointer"
                  >
                    <div className="relative h-full w-full">
                      <SkeletonImage
                        fill
                        src={cardImageUrl}
                        alt={
                          doc.key === "npwpFront" && cardNpwpSide === "back"
                            ? `${doc.title}, tampak belakang`
                            : doc.title
                        }
                        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                        className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-tile)]/95 px-2.5 py-1 text-xs font-medium text-[var(--tone-ink)] shadow-xs transition-colors group-hover:border-[var(--tone-accent)] group-hover:text-[var(--tone-accent)]">
                      <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Perbesar</span>
                    </span>
                  </button>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="type-small italic tabular-nums text-[var(--tone-accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {backUrl ? (
                      <div
                        role="group"
                        aria-label="Sisi NPWP"
                        className="inline-flex rounded-xs border border-[var(--tone-rule)] bg-[var(--tone-bg)] p-0.5"
                      >
                        <button
                          type="button"
                          onClick={() => setCardNpwpSide("front")}
                          aria-pressed={cardNpwpSide === "front"}
                          className={`rounded-xs px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                            cardNpwpSide === "front"
                              ? "bg-[var(--tone-accent)] text-[var(--tone-tile)]"
                              : "text-[var(--tone-muted)] hover:text-[var(--tone-ink)]"
                          }`}
                        >
                          Depan
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardNpwpSide("back")}
                          aria-pressed={cardNpwpSide === "back"}
                          className={`rounded-xs px-2 py-0.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                            cardNpwpSide === "back"
                              ? "bg-[var(--tone-accent)] text-[var(--tone-tile)]"
                              : "text-[var(--tone-muted)] hover:text-[var(--tone-ink)]"
                          }`}
                        >
                          Belakang
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-balance text-[var(--tone-ink)]">
                    {doc.title}
                  </h3>

                  <p className="type-small font-medium tabular-nums break-words text-[var(--tone-ink)]">
                    {doc.number}
                  </p>

                  <p className="type-small text-[var(--tone-muted)] text-pretty">
                    {doc.issuer}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--tone-rule)] pt-3">
                <button
                  type="button"
                  onClick={() => copyNumber(doc.key, doc.number)}
                  aria-label={`Salin nomor ${doc.title}`}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-xs border border-[var(--tone-rule)] px-2.5 py-1 text-xs font-medium text-[var(--tone-muted)] transition-colors hover:border-[var(--tone-accent)] hover:text-[var(--tone-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[var(--tone-accent)]" aria-hidden="true" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Salin nomor</span>
                    </>
                  )}
                </button>

                {frontUrl ? (
                  <button
                    type="button"
                    onClick={() => openDocument(index)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-xs px-2 py-1 text-xs font-semibold text-[var(--tone-accent)] transition-colors hover:bg-[var(--tone-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tone-accent)] cursor-pointer"
                  >
                    <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Periksa</span>
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={activeIndex !== null}
        onOpenChange={(open) => {
          if (!open) setActiveIndex(null);
        }}
      >
        <DialogContent className="max-w-3xl gap-0 rounded-xs border border-[var(--tone-rule)] bg-white p-0 text-[#15171b] sm:rounded-xs dark:border-zinc-800 dark:bg-[#0d1829] dark:text-[#f0f5fa]">
          {activeDoc ? (
            <>
              <DialogHeader className="border-b border-zinc-200 px-5 py-4 pr-12 dark:border-zinc-800 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#24486a] dark:text-[#9cc4ee]">
                    {String((activeIndex ?? 0) + 1).padStart(2, "0")} · Legalitas
                  </span>
                </div>
                <DialogTitle className="mt-1 font-sans text-lg font-semibold normal-case tracking-tight text-[#15171b] dark:text-[#f0f5fa]">
                  {activeDoc.title}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#4a5563] dark:text-[#a3b8d0]">
                  <span className="font-medium tabular-nums text-[#15171b] dark:text-[#f0f5fa]">
                    {activeDoc.number}
                  </span>{" "}
                  · {activeDoc.issuer}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 p-5 sm:p-6">
                {activeBackUrl ? (
                  <div
                    role="tablist"
                    aria-label="Sisi kartu NPWP"
                    className="inline-flex w-fit rounded-xs border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={npwpSide === "front"}
                      onClick={() => setNpwpSide("front")}
                      className={`min-h-9 rounded-xs px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        npwpSide === "front"
                          ? "bg-[#24486a] text-white dark:bg-[#9cc4ee] dark:text-[#0d1829]"
                          : "text-[#4a5563] hover:text-[#15171b] dark:text-[#a3b8d0] dark:hover:text-white"
                      }`}
                    >
                      Tampak Depan
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={npwpSide === "back"}
                      onClick={() => setNpwpSide("back")}
                      className={`min-h-9 rounded-xs px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        npwpSide === "back"
                          ? "bg-[#24486a] text-white dark:bg-[#9cc4ee] dark:text-[#0d1829]"
                          : "text-[#4a5563] hover:text-[#15171b] dark:text-[#a3b8d0] dark:hover:text-white"
                      }`}
                    >
                      Tampak Belakang
                    </button>
                  </div>
                ) : null}

                {displayedUrl ? (
                  <div className="relative flex h-[55vh] min-h-[280px] w-full items-center justify-center overflow-hidden rounded-xs border border-zinc-200 bg-[#f3f6f9] p-3 dark:border-zinc-800 dark:bg-[#132238]">
                    <SkeletonImage
                      fill
                      src={displayedUrl}
                      alt={
                        activeDoc.key === "npwpFront" && npwpSide === "back"
                          ? `${activeDoc.title}, tampak belakang`
                          : activeDoc.title
                      }
                      sizes="(min-width: 768px) 720px, 95vw"
                      className="object-contain p-2"
                    />
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => copyNumber(activeDoc.key, activeDoc.number)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xs border border-zinc-300 px-3.5 py-2 text-sm font-medium text-[#15171b] transition-colors hover:border-[#24486a] dark:border-zinc-700 dark:text-[#f0f5fa] dark:hover:border-[#9cc4ee] cursor-pointer"
                  >
                    {copiedKey === activeDoc.key ? (
                      <>
                        <Check className="h-4 w-4 text-[#24486a] dark:text-[#9cc4ee]" aria-hidden="true" />
                        <span>Nomor tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        <span>Salin nomor</span>
                      </>
                    )}
                  </button>

                  {inspectableIndices.length > 1 ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => stepDocument(-1)}
                        aria-label="Dokumen sebelumnya"
                        className="inline-flex min-h-10 items-center gap-1 rounded-xs border border-zinc-300 px-3 py-2 text-sm font-medium text-[#15171b] transition-colors hover:border-[#24486a] dark:border-zinc-700 dark:text-[#f0f5fa] cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        <span>Sebelumnya</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => stepDocument(1)}
                        aria-label="Dokumen berikutnya"
                        className="inline-flex min-h-10 items-center gap-1 rounded-xs border border-zinc-300 px-3 py-2 text-sm font-medium text-[#15171b] transition-colors hover:border-[#24486a] dark:border-zinc-700 dark:text-[#f0f5fa] cursor-pointer"
                      >
                        <span>Berikutnya</span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
