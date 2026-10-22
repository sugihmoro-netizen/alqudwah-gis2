import React from 'react';
import { User } from '../../types';
import { getStudents, getAllActiveRecords } from '../../services/storage';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const PortalSiswa: React.FC<Props> = ({ currentUser }) => {
  const allStudents = getStudents();
  const allRecords = getAllActiveRecords();

  const student =
    allStudents.find((s) => s.id === currentUser.relatedStudentId) ||
    allStudents[0];

  const studentRecords = allRecords
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSessions = studentRecords.length;
  const countHadir = studentRecords.filter((r) => r.status === 'HADIR').length;
  const countIzin = studentRecords.filter((r) => r.status === 'IZIN').length;
  const countSakit = studentRecords.filter((r) => r.status === 'SAKIT').length;
  const countAlpa = studentRecords.filter((r) => r.status === 'ALPA').length;

  const attendancePercent =
    totalSessions > 0 ? Math.round((countHadir / totalSessions) * 100) : 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'HADIR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IZIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SAKIT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ALPA':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-2xl font-bold border border-white/30">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
                  {student.className}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                NIS: {student.nis} • NISN: {student.nisn} • Wali Kelas: Drs. Bambang Suryono
              </p>
            </div>
          </div>

          {attendancePercent >= 90 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Predikat Kehadiran Sangat Baik (Teladan)</span>
            </div>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Persentase Hadir</span>
          <div className="text-3xl font-extrabold text-blue-600 mt-1">{attendancePercent}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${attendancePercent}%` }} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Hadir</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{countHadir}</div>
          <span className="text-[10px] text-slate-400">pertemuan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-blue-600">Izin</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{countIzin}</div>
          <span className="text-[10px] text-slate-400">pertemuan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-600">Sakit</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{countSakit}</div>
          <span className="text-[10px] text-slate-400">pertemuan</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-rose-600">Alpa</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{countAlpa}</div>
          <span className="text-[10px] text-slate-400">pertemuan</span>
        </div>
      </div>

      {/* Detailed History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Catatan Kehadiran Pribadi ({studentRecords.length} Catatan)
          </h3>
          <span className="text-xs text-slate-400">Tahun Ajaran 2024/2025</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">Guru</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Dicatat Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada riwayat absensi yang tercatat untuk akun Anda.
                  </td>
                </tr>
              ) : (
                studentRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{rec.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{rec.subjectName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{rec.recordedBy}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                          rec.status
                        )}`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 italic">
                      {rec.note || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                      {new Date(rec.recordedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
