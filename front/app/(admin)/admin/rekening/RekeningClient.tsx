"use client";

import { useState, useTransition } from "react";
import { saveBankAccount, activateBankAccount, deleteBankAccount } from "./actions";

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

export default function RekeningClient({ accounts, isAdminSuper }: RekeningClientProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  // Delete confirm state
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus rekening ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await deleteBankAccount(id);
      if (!res.success) {
        setErrorMessage(res.error || "Gagal menghapus rekening.");
      } else {
        setSuccessMessage("Rekening berhasil dihapus.");
        setDeletingId(null);
      }
    });
  }

  const activeAccount = accounts.find((a) => a.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#10243F]">Rekening Pembayaran</h1>
          <p className="mt-1 text-sm text-[#566B84]">
            Kelola data rekening tujuan transfer pembayaran pendaftaran peserta Albana.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-[#26599A] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#163E70] transition-colors"
        >
          + Tambah Rekening
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {/* Notice on active account */}
      {!activeAccount ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <strong className="font-semibold">Peringatan:</strong> Belum ada rekening aktif! Setiap pendaftaran baru memerlukan satu rekening aktif untuk menerbitkan tagihan. Silakan aktifkan salah satu rekening di bawah.
        </div>
      ) : (
        <div className="rounded-xl border border-[#D8E4F0] bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Rekening Aktif Saat Ini
              </span>
              <h2 className="mt-2 text-xl font-bold text-[#10243F]">
                {activeAccount.bank} — {activeAccount.account_number}
              </h2>
              <p className="text-sm text-[#566B84]">a.n. {activeAccount.holder}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openEditModal(activeAccount)}
                className="rounded-lg border border-[#D8E4F0] px-3 py-1.5 text-sm font-medium text-[#10243F] hover:bg-[#F4F8FC]"
              >
                Ubah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table of all accounts */}
      <div className="overflow-hidden rounded-xl border border-[#D8E4F0] bg-white shadow-sm">
        <div className="border-b border-[#D8E4F0] px-5 py-4">
          <h2 className="font-semibold text-[#10243F]">Daftar Semua Rekening</h2>
          <p className="text-xs text-[#566B84]">
            Database secara ketat membatasi tepat satu rekening berstatus aktif.
          </p>
        </div>

        {accounts.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#566B84]">
            Belum ada data rekening. Klik <strong>+ Tambah Rekening</strong> untuk menambahkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#D8E4F0] bg-[#F8FAFC] text-xs uppercase tracking-wider text-[#566B84]">
                <tr>
                  <th className="px-5 py-3">Bank</th>
                  <th className="px-5 py-3">Nomor Rekening</th>
                  <th className="px-5 py-3">Atas Nama</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {accounts.map((acc) => (
                  <tr key={acc.id} className={acc.active ? "bg-emerald-50/30" : undefined}>
                    <td className="px-5 py-4 font-semibold text-[#10243F]">{acc.bank}</td>
                    <td className="px-5 py-4 font-mono text-sm text-[#10243F]">{acc.account_number}</td>
                    <td className="px-5 py-4 text-[#344B66]">{acc.holder}</td>
                    <td className="px-5 py-4">
                      {acc.active ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {!acc.active && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleActivate(acc.id)}
                            className="rounded-lg bg-[#26599A] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163E70] disabled:opacity-50"
                          >
                            Aktifkan
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(acc)}
                          className="rounded-lg border border-[#D8E4F0] px-2.5 py-1 text-xs font-medium text-[#10243F] hover:bg-[#F4F8FC]"
                        >
                          Ubah
                        </button>
                        {isAdminSuper && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDelete(acc.id)}
                            className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#10243F]">
              {editingAccount ? "Ubah Data Rekening" : "Tambah Rekening Baru"}
            </h2>
            <p className="mt-1 text-xs text-[#566B84]">
              Pastikan nama bank, nomor rekening, dan atas nama sesuai dengan rekening resmi Albana.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {editingAccount && <input type="hidden" name="id" value={editingAccount.id} />}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566B84]" htmlFor="bank">
                  Nama Bank
                </label>
                <input
                  id="bank"
                  name="bank"
                  type="text"
                  required
                  placeholder="Contoh: BCA, Mandiri, BSI"
                  defaultValue={editingAccount?.bank || ""}
                  className="mt-1 block w-full rounded-xl border border-[#D8E4F0] px-3 py-2 text-sm text-[#10243F] focus:border-[#26599A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566B84]" htmlFor="account_number">
                  Nomor Rekening
                </label>
                <input
                  id="account_number"
                  name="account_number"
                  type="text"
                  required
                  placeholder="Contoh: 4497062020"
                  defaultValue={editingAccount?.account_number || ""}
                  className="mt-1 block w-full rounded-xl border border-[#D8E4F0] px-3 py-2 text-sm font-mono text-[#10243F] focus:border-[#26599A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#566B84]" htmlFor="holder">
                  Atas Nama Pemilik
                </label>
                <input
                  id="holder"
                  name="holder"
                  type="text"
                  required
                  placeholder="Contoh: ASA Albana CV"
                  defaultValue={editingAccount?.holder || ""}
                  className="mt-1 block w-full rounded-xl border border-[#D8E4F0] px-3 py-2 text-sm text-[#10243F] focus:border-[#26599A] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  value="true"
                  defaultChecked={editingAccount ? editingAccount.active : accounts.length === 0}
                  className="h-4 w-4 rounded border-[#D8E4F0] text-[#26599A] focus:ring-[#26599A]"
                />
                <label htmlFor="active" className="text-sm text-[#344B66]">
                  Jadikan sebagai rekening aktif utama
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#D8E4F0] px-4 py-2 text-sm font-medium text-[#566B84] hover:bg-[#F4F8FC]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-[#26599A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163E70] disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan Rekening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
