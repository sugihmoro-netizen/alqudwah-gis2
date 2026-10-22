import React, { useState } from 'react';
import { LogOut, ShieldAlert, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: (clearLocalData: boolean) => void;
}

export const LogoutModal: React.FC<Props> = ({ isOpen, onClose, onConfirmLogout }) => {
  const [clearLocalData, setClearLocalData] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Keluar dari Akun (Logout)</h3>
            <p className="text-xs text-slate-500">
              Kebijakan keamanan perangkat bersama sekolah
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Apakah Anda yakin ingin keluar? Pastikan data absensi telah tersinkron sebelum meninggalkan perangkat bersama di ruang guru atau laboratorium.
        </p>

        <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={clearLocalData}
            onChange={(e) => setClearLocalData(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="text-xs">
            <span className="font-semibold text-amber-900 block">
              Bersihkan antrean lokal & cache sesi (Direkomendasikan di perangkat bersama)
            </span>
            <span className="text-amber-700 mt-0.5 block">
              Mencegah pengguna lain mengakses draf absensi lokal di perangkat ini.
            </span>
          </div>
        </label>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirmLogout(clearLocalData)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-xs transition"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
