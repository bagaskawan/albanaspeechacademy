"use client";

import { useState, useTransition } from "react";
import { saveBankAccount, activateBankAccount, deleteBankAccount } from "./actions";
import { DataTable, StatusChip } from "@/components/admin/ui/data-table";
import { TableToolbar, matchesQuery } from "@/components/admin/ui/table-toolbar";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { useSearchParams } from "next/navigation";
import { RowActions, rowPillClass } from "@/components/admin/ui/row-actions";
import { FormDialog } from "@/components/admin/ui/form/FormDialog";
import { Field, FieldGrid } from "@/components/admin/ui/form/fields";
import { Landmark } from "lucide-react";

export type BankAccount = {
  id: number;
  bank: string;
  account_number: string;
  holder: string;
  active: boolean;
};

interface RekeningClientProps {
  accounts: BankAccount[];
  isAdminSuper: boolean;
}

// isAdminSuper stays in the props for the page; RowActions reads the role from the shell context.
export default function RekeningClient({ accounts }: RekeningClientProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  function openCreateModal() {
    setEditingAccount(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    setModalOpen(true);
  }

  function openEditModal(account: BankAccount) {
    setEditingAccount(account);
    setErrorMessage(null);
    setSuccessMessage(null);
    setModalOpen(true);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await saveBankAccount(formData);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal menyimpan rekening.");
      } else {
        setSuccessMessage("Rekening berhasil disimpan.");
        setModalOpen(false);
      }
    });
  }

  function handleActivate(id: number) {
    if (!confirm("Jadikan rekening ini sebagai rekening aktif utama? Rekening lain akan otomatis dinonaktifkan.")) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await activateBankAccount(id);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal mengaktifkan rekening.");
      } else {
        setSuccessMessage("Rekening aktif berhasil diperbarui.");
      }
    });
  }

  // RowActions confirms, toasts, and refreshes; this only maps the action result.
  async function handleDelete(id: number) {
    const res = await deleteBankAccount(id);
    return res.success ? {} : { error: res.error || "Gagal menghapus rekening." };
  }

  const activeAccount = accounts.find((a) => a.active);
  const query = useSearchParams().get("q") ?? "";
  const visibleAccounts = accounts.filter((acc) => matchesQuery(`${acc.bank} ${acc.account_number} ${acc.holder}`, query));

  return (
    <div className="space-y-6">
      <TableToolbar search={{ placeholder: "Cari bank, nomor, atau nama…" }} create={{ label: "Tambah rekening", onClick: openCreateModal }} />

      {/* Messages */}
      {errorMessage && (
        <div className="rounded-xl border border-admin-rose-dot/30 bg-admin-rose-soft p-4 text-sm text-admin-danger">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-admin-mint-dot/30 bg-admin-mint-soft p-4 text-sm text-admin-mint-ink">
          {successMessage}
        </div>
      )}

      {/* Notice on active account */}
      {!activeAccount ? (
        <div className="rounded-xl border border-admin-peach-dot/30 bg-admin-peach-soft p-4 text-sm text-admin-peach-ink">
          <strong className="font-semibold">Peringatan:</strong> Belum ada rekening aktif! Setiap pendaftaran baru memerlukan satu rekening aktif untuk menerbitkan tagihan. Silakan aktifkan salah satu rekening di bawah.
        </div>
      ) : (
        <div className="rounded-xl border border-admin-line bg-admin-surface p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-admin-mint-soft px-3 py-1 text-xs font-semibold text-admin-mint-ink">
                <span className="h-2 w-2 rounded-full bg-admin-mint-dot" /> Rekening Aktif Saat Ini
              </span>
              <h2 className="mt-2 text-xl font-bold text-admin-ink">
                {activeAccount.bank} — {activeAccount.account_number}
              </h2>
              <p className="text-sm text-admin-text-secondary">a.n. {activeAccount.holder}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(activeAccount)}
                className="rounded-lg border border-admin-line px-3 py-1.5 text-sm font-medium text-admin-ink hover:bg-admin-surface-muted"
              >
                Ubah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table of all accounts */}
      <div>

        {visibleAccounts.length === 0 ? (query
          ? <EmptyState searching title="Tidak ada rekening yang cocok" description="Coba bank, nomor, atau nama lain." />
          : <EmptyState title="Belum ada rekening" description="Tambahkan rekening tujuan transfer agar pendaftaran bisa menerbitkan tagihan." />
        ) : (
          <DataTable caption="Rekening pembayaran" stackOnMobile>
              <thead>
                <tr>
                  <th scope="col">Bank</th>
                  <th scope="col">Nomor rekening</th>
                  <th scope="col">Atas nama</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td data-label="Bank" className="font-medium">{acc.bank}</td>
                    <td data-label="Nomor rekening" className="font-mono tabular-nums">{acc.account_number}</td>
                    <td data-label="Atas nama" className="text-admin-text-secondary">{acc.holder}</td>
                    <td data-label="Status">
                      <StatusChip tone={acc.active ? "mint" : "neutral"}>{acc.active ? "Aktif" : "Nonaktif"}</StatusChip>
                    </td>
                    <td className="text-right">
                      <RowActions
                        itemName={`rekening ${acc.bank}`}
                        onEdit={() => openEditModal(acc)}
                        onDelete={() => handleDelete(acc.id)}
                        extra={!acc.active && <button type="button" disabled={isPending} onClick={() => handleActivate(acc.id)} className={rowPillClass}>Aktifkan</button>}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
          </DataTable>
        )}
      </div>

      {/* Modal Dialog */}
      <FormDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        icon={<Landmark aria-hidden="true" size={20} strokeWidth={1.5} />}
        title={editingAccount ? "Ubah rekening" : "Tambah rekening"}
        description="Pastikan nama bank, nomor, dan atas nama sesuai rekening resmi Albana."
        submitLabel="Simpan rekening"
        pending={isPending}
        onSubmit={handleFormSubmit}
      >
        {editingAccount && <input type="hidden" name="id" value={editingAccount.id} />}
        <FieldGrid columns={1}>
          <Field label="Nama bank" htmlFor="bank" required>
            <input id="bank" name="bank" type="text" required aria-required="true" placeholder="BCA, Mandiri, BSI" defaultValue={editingAccount?.bank || ""} />
          </Field>
          <Field label="Nomor rekening" htmlFor="account_number" required>
            <input id="account_number" name="account_number" type="text" inputMode="numeric" required aria-required="true" placeholder="4497062020" defaultValue={editingAccount?.account_number || ""} className="font-mono" />
          </Field>
          <Field label="Atas nama" htmlFor="holder" required>
            <input id="holder" name="holder" type="text" required aria-required="true" placeholder="ASA Albana CV" defaultValue={editingAccount?.holder || ""} />
          </Field>
          <label htmlFor="active" className="flex cursor-pointer items-center gap-3 rounded-[20px] border border-admin-line-strong p-4 text-[14px] text-admin-ink">
            <input id="active" name="active" type="checkbox" value="true" defaultChecked={editingAccount ? editingAccount.active : accounts.length === 0} className="size-5 accent-[var(--admin-ink)]" />
            <span>Jadikan rekening aktif utama<span className="block text-[13px] text-admin-text-secondary">Rekening aktif lain otomatis dinonaktifkan.</span></span>
          </label>
        </FieldGrid>
      </FormDialog>
    </div>
  );
}
