"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "@/components/admin/ui/form/FormDialog";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { AdminInput } from "@/components/admin/ui/form/controls";
import { createClient } from "@/lib/supabase/client";

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <AdminInput
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute top-1/2 right-2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-admin-text-secondary transition-colors hover:bg-admin-surface-muted hover:text-admin-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-ink"
      >
        {visible ? <EyeOff aria-hidden="true" size={16} strokeWidth={1.5} /> : <Eye aria-hidden="true" size={16} strokeWidth={1.5} />}
      </button>
    </div>
  );
}

export function PersonalInfoClient({
  username,
  roleLabel,
}: {
  username: string;
  roleLabel: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function openDialog() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setDialogOpen(true);
  }

  function handleOpenChange(open: boolean) {
    if (pending) return;
    setDialogOpen(open);
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError("Password saat ini wajib diisi.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Verifikasi password baru tidak cocok.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("Password baru harus berbeda dari password saat ini.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error || "Password belum bisa diperbarui. Coba lagi.");
        setPending(false);
        return;
      }

      // Pastikan sesi di browser juga bersih sebelum mengarahkan ke halaman login.
      await createClient().auth.signOut().catch(() => {});
      setDialogOpen(false);
      toast.success("Password berhasil diperbarui. Silakan masuk kembali.");
      window.location.replace("/login?passwordChanged=1");
    } catch {
      setError("Gagal terhubung ke server. Coba lagi.");
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-6 rounded-2xl border border-admin-line-strong bg-admin-canvas p-6 sm:p-8">
        <FieldGrid columns={1}>
          <Field label="Username" htmlFor="personal-username">
            <AdminInput
              id="personal-username"
              value={username}
              readOnly
              className="cursor-default bg-admin-surface-muted/70 text-admin-text-secondary hover:border-admin-line focus-visible:bg-admin-surface-muted/70"
            />
          </Field>

          <Field label="Role" htmlFor="personal-role">
            <AdminInput
              id="personal-role"
              value={roleLabel}
              readOnly
              className="cursor-default bg-admin-surface-muted/70 text-admin-text-secondary hover:border-admin-line focus-visible:bg-admin-surface-muted/70"
            />
          </Field>

          <Field
            label="Password"
            htmlFor="personal-change-password"
            hint="Gunakan password yang kuat dan jangan bagikan ke orang lain."
          >
            <div className="pt-0.5">
              <button
                id="personal-change-password"
                type="button"
                onClick={openDialog}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-admin-danger px-5 text-[14px] font-medium text-white shadow-xs transition-colors hover:bg-admin-danger/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-admin-danger"
              >
                <KeyRound aria-hidden="true" size={16} strokeWidth={1.75} />
                <span>Ganti Password</span>
              </button>
            </div>
          </Field>
        </FieldGrid>
      </div>

      <FormDialog
        open={dialogOpen}
        onOpenChange={handleOpenChange}
        icon={<KeyRound aria-hidden="true" size={20} strokeWidth={1.5} />}
        title="Ganti Password"
        description="Masukkan password saat ini lalu buat password baru."
        size="sm"
        submitLabel="Simpan Password"
        pending={pending}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-[16px] bg-admin-rose-soft px-4 py-2.5 text-[13px] text-admin-danger"
            >
              {error}
            </p>
          )}

          <FieldGrid columns={1}>
            <Field label="Password saat ini" htmlFor="current-password" required>
              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
                placeholder="Masukkan password saat ini"
              />
            </Field>

            <Field
              label="Password baru"
              htmlFor="new-password"
              required
              hint="Minimal 8 karakter."
            >
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
                placeholder="Masukkan password baru"
              />
            </Field>

            <Field label="Verifikasi password baru" htmlFor="confirm-password" required>
              <PasswordInput
                id="confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                placeholder="Ulangi password baru"
              />
            </Field>
          </FieldGrid>
        </div>
      </FormDialog>
    </div>
  );
}
