import React from 'react';
import { getAuditLogs } from '../../services/storage';
import { History, ShieldAlert, User, Calendar } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const logs = getAuditLogs();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-purple-600" />
            Audit Jejak Perubahan Presensi (Audit Trail)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekam jejak setiap pengeditan status kehadiran beserta alasan wajib perubahan (FR-10, FR-16)
          </p>
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          Total Log Tercatat: <strong>{logs.length} Perubahan</strong>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Waktu Edit</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Sesi / Mapel</th>
                <th className="py-3 px-4 text-center">Perubahan Status</th>
                <th className="py-3 px-4">Diubah Oleh</th>
                <th className="py-3 px-4">Alasan Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Belum ada riwayat audit perubahan data presensi.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                      <div>{new Date(log.changedAt).toLocaleDateString('id-ID')}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.changedAt).toLocaleTimeString('id-ID')} WIB
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{log.studentName}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{log.scheduleName}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {log.previousStatus}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                          {log.newStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {log.changedBy}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <div className="bg-amber-50/80 p-2 rounded-lg border border-amber-200/80 italic text-amber-900">
                        "{log.reason}"
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
