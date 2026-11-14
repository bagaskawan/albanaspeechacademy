"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RegistrationStepFields } from "@/components/register/registration-steps";
import type { RegistrationBatch } from "@/lib/registration";
import { registrationFailure, type RegistrationBanner } from "@/lib/registration-feedback";
import {
  REGISTRATION_STEPS,
  buildRegistrationPayload,
  emptyRegistrationValues,
  registrationFormCopy,
  validateRegistration,
  validateRegistrationStep,
  type RegistrationErrors,
  type RegistrationValues,
} from "@/lib/registration-form";

type SubmitState = "idle" | "submitting" | "success";

export function RegistrationForm({ batch, offer }: { batch: RegistrationBatch; offer?: { slug: string; secondaryBatchSlug: string } | null }) {
  const copy = registrationFormCopy(batch);
  const [values, setValues] = useState<RegistrationValues>(emptyRegistrationValues);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [banner, setBanner] = useState<RegistrationBanner | null>(null);
  const [step, setStep] = useState(0);
  const [isStale, setIsStale] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusFieldRef = useRef<keyof RegistrationValues | null>(null);
  const didMount = useRef(false);
  const submittingRef = useRef(false);
  const idempotencyKey = useRef<string | null>(null);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (focusFieldRef.current) {
      const field = document.getElementById(focusFieldRef.current);
      if (field) field.focus();
      else headingRef.current?.focus();
      focusFieldRef.current = null;
    } else {
      headingRef.current?.focus();
    }
  }, [step, errors]);

  const currentStep = REGISTRATION_STEPS[step];
  const isLastStep = step === REGISTRATION_STEPS.length - 1;
  const update = <K extends keyof RegistrationValues>(key: K, value: RegistrationValues[K]) => {
    idempotencyKey.current = null;
    setValues((previous) => ({ ...previous, [key]: value }));
  };

  function showErrors(nextErrors: RegistrationErrors, targetStep: number) {
    focusFieldRef.current = REGISTRATION_STEPS[targetStep].fields.find((field) => nextErrors[field]) ?? null;
    setErrors(nextErrors);
    setBanner({ message: "Periksa kembali bagian yang ditandai." });
    setStep(targetStep);
  }

  function goNext() {
    const nextErrors = validateRegistrationStep(values, batch, currentStep.id);
    if (Object.keys(nextErrors).length) {
      showErrors(nextErrors, step);
      return;
    }
    setErrors({});
    setBanner(null);
    setStep((current) => current + 1);
  }

  function goBack() {
    setErrors({});
    setBanner(null);
    setStep((current) => current - 1);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }
    if (submittingRef.current || isStale) return;

    const nextErrors = validateRegistration(values, batch);
    if (Object.keys(nextErrors).length) {
      const firstInvalidStep = REGISTRATION_STEPS.findIndex((item) =>
        item.fields.some((field) => nextErrors[field]),
      );
      showErrors(nextErrors, firstInvalidStep < 0 ? step : firstInvalidStep);
      return;
    }

    submittingRef.current = true;
    setSubmitState("submitting");
    setBanner(null);
    try {
      idempotencyKey.current ??= crypto.randomUUID();
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildRegistrationPayload(values, batch), idempotencyKey: idempotencyKey.current,
          offerSlug: offer?.slug ?? null, secondaryBatchSlug: offer?.secondaryBatchSlug ?? null }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const message = payload && typeof payload === "object" && "message" in payload &&
        typeof payload.message === "string" ? payload.message : undefined;
      if (response.ok) {
        if (!payload || typeof payload !== "object" || !("redirectUrl" in payload) ||
          typeof payload.redirectUrl !== "string" || !/^\/register\/konfirmasi\/[0-9]+\.[0-9]{10}\.[A-Za-z0-9_-]{43}$/.test(payload.redirectUrl)) {
          throw new Error("Respons konfirmasi tidak valid.");
        }
        setSubmitState("success");
        window.location.assign(payload.redirectUrl);
        return;
      }
      setSubmitState("idle");
      setIsStale(response.status === 409);
      if (response.status === 409) idempotencyKey.current = null;
      setBanner(registrationFailure(response.status, message));
    } catch {
      setSubmitState("idle");
      setBanner({ message: "Pendaftaran belum bisa diproses. Periksa koneksi lalu coba lagi." });
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form id="form-pendaftaran" className="mt-9" onSubmit={handleSubmit} noValidate aria-busy={submitState === "submitting"}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-ink">
          Bagian {step + 1}: {currentStep.title}
        </h2>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Langkah {step + 1} dari {REGISTRATION_STEPS.length}</p>
      </div>
      <div
        className="mt-3 h-1 bg-rule"
        role="progressbar"
        aria-label="Kemajuan pendaftaran"
        aria-valuemin={1}
        aria-valuemax={REGISTRATION_STEPS.length}
        aria-valuenow={step + 1}
        aria-valuetext={`Langkah ${step + 1} dari ${REGISTRATION_STEPS.length}: ${currentStep.title}`}
      >
        <div className="h-full bg-accent" style={{ width: `${((step + 1) / REGISTRATION_STEPS.length) * 100}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted">Pertanyaan bertanda * wajib diisi.</p>

      {banner ? (
        <div role="alert" className="mt-6 border-l-4 border-danger bg-surface px-4 py-3">
          <p className="font-medium">{banner.message}</p>
          {banner.showProgramLink ? (
            <Link className="mt-2 inline-block font-semibold text-accent underline" href="/#program-pilihan">
              Periksa pilihan program terbaru
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6">
        <RegistrationStepFields
          stepId={currentStep.id}
          values={values}
          errors={errors}
          copy={copy}
          priceIdr={batch.priceIdr}
          dpPercent={batch.dpPercent}
          onUpdate={update}
        />
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-6">
        {step > 0 ? (
          <button type="button" className="button-secondary cursor-pointer" onClick={goBack}>Kembali</button>
        ) : <span />}
        <button type="submit" className="button-primary ml-auto cursor-pointer disabled:cursor-not-allowed disabled:opacity-60" disabled={submitState === "submitting" || isStale}>
          {submitState === "submitting" ? "Mengirim…" : isLastStep ? "Kirim pendaftaran" : "Lanjut →"}
        </button>
      </div>
      <span className="sr-only" role="status">{submitState === "submitting" ? "Mengirim pendaftaran" : ""}</span>
    </form>
  );
}
