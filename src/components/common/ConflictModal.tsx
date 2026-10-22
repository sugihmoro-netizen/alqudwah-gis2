import React from 'react';
import { SyncConflict } from '../../types';
import { resolveConflict } from '../../services/storage';
import { AlertTriangle, Server, Smartphone, Check, ArrowRight } from 'lucide-react';

interface Props {
  conflicts: SyncConflict[];
  onResolved: () => void;
  onClose: () => void;
}

export const ConflictModal: React.FC<Props> = ({ conflicts, onResolved, onClose }) => {
  if (conflicts.length === 0) return null;

  const currentConflict = conflicts[0];

  const handleResolve = (choice: 'keep_local' | 'keep_server') => {
    resolveConflict(currentConflict, choice);
    onResolved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3 text-amber-600 mb-3">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Konflik Sinkronisasi Terdeteksi</h3>
            <p className="text-xs text-slate-500">
              Data di server telah diperbarui oleh pengguna lain saat Anda offline ({conflicts.length} konflik tersisa)
            </p>
          </div>
        </div>

        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Nama Siswa:</span>
            <span className="font-semibold text-slate-800">{currentConflict.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Mata Pelajaran:</span>
            <span className="font-medium text-slate-800">{currentConflict.subjectName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal:</span>
            <span className="font-medium text-slate-800">{currentConflict.date}</span>
          </div>
        </div>

        {/* Comparison grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Local Device Version */}
          <div className="p-3.5 rounded-xl border-2 border-blue-200 bg-blue-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-blue-700 font-semibold text-xs mb-2">
                <Smartphone className="w-4 h-4" />
                <span>Versi di Perangkat Ini</span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-slate-500">Status Absen:</span>
                <p className="text-base font-bold text-blue-900 mt-0.5">
                  {currentConflict.localRecord.status}
                </p>
              </div>
              {currentConflict.localRecord.note && (
                <p className="text-xs text-slate-600 italic mt-1">"{currentConflict.localRecord.note}"</p>
              )}
              <p className="text-[11px] text-slate-500 mt-2">
                Oleh: {currentConflict.localRecord.recordedBy}
              </p>
            </div>
            <button
              onClick={() => handleResolve('keep_local')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition"
            >
              Gunakan Data Lokal
            </button>
          </div>

          {/* Server Version */}
          <div className="p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs mb-2">
                <Server className="w-4 h-4" />
                <span>Versi di Server</span>
              </div>
              <div className="mt-1">
                <span className="text-xs text-slate-500">Status Absen:</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {currentConflict.serverRecord.status}
                </p>
              </div>
              {currentConflict.serverRecord.note && (
                <p className="text-xs text-slate-600 italic mt-1">"{currentConflict.serverRecord.note}"</p>
              )}
              <p className="text-[11px] text-slate-500 mt-2">
                Oleh: {currentConflict.serverRecord.recordedBy}
              </p>
            </div>
            <button
              onClick={() => handleResolve('keep_server')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-slate-700 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition"
            >
              Pertahankan Server
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Tinjau nanti
          </button>
        </div>
      </div>
    </div>
  );
};
