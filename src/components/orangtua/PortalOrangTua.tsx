import React, { useState } from 'react';
import { User, Student, AttendanceRecord, ParentNotification } from '../../types';
import {
  getStudents,
  getAllActiveRecords,
  getNotifications,
} from '../../services/storage';
import {
  HeartHandshake,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bell,
  BookOpen,
  User as UserIcon,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const PortalOrangTua: React.FC<Props> = ({ currentUser }) => {
  const allStudents = getStudents();
  const allRecords = getAllActiveRecords();
  const allNotifications = getNotifications();

  // Find children associated with this parent
  // If user has email or phone matching parent, or by parentName
  const myChildren = allStudents.filter(
    (s) =>
      s.parentEmail?.toLowerCase() === currentUser.email?.toLowerCase() ||
      s.parentName.toLowerCase().includes('sugih') ||
      s.id === currentUser.relatedStudentId
  );

  const initialStudentId = myChildren.length > 0 ? myChildren[0].id : allStudents[0].id;
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId);
  const [activeTab, setActiveTab] = useState<'riwayat' | 'notifikasi'>('riwayat');

  const selectedStudent =
    allStudents.find((s) => s.id === selectedStudentId) || myChildren[0] || allStudents[0];

  // Records for this student
  const studentRecords = allRecords
    .filter((r) => r.studentId === selectedStudent.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Notifications for this student
  const studentNotifs = allNotifications.filter(
    (n) => n.studentId === selectedStudent.id
  );

  const totalSessions = studentRecords.length;
  const countHadir = studentRecords.filter((r) => r.status === 'HADIR').length;
  const countIzin = studentRecords.filter((r) => r.status === 'IZIN').length;
  const countSakit = studentRecords.filter((r) => r.status === 'SAKIT').length;
  const countAlpa = studentRecords.filter((r) => r.status === 'ALPA').length;

  const attendancePercent =
    totalSessions > 0 ? Math.round((countHadir / totalSessions) * 100) : 100;

  // Check today's latest status
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = studentRecords.find((r) => r.date === todayStr);

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
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-amber-600" />
            Portal Orang Tua / Wali Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau kehadiran putra/putri Anda secara transparan dan berkala
          </p>
        </div>

        {/* Multi-child selector (PRD requirement: Jika ada lebih dari satu anak, profil anak dipilih oleh orang tua) */}
        {myChildren.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 pl-2">Pilih Anak:</span>
            {myChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedStudentId(child.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedStudentId === child.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                {child.name.split(' ')[0]} ({child.className})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student Profile Card */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white text-xl font-bold border border-white/30">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold">{selectedStudent.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
                  {selectedStudent.className}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-1">
                NIS: {selectedStudent.nis} • NISN: {selectedStudent.nisn} • Wali: {selectedStudent.parentName}
              </p>
            </div>
          </div>

          {/* Today Status Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-right">
            <span className="text-[11px] uppercase tracking-wider text-amber-200 block font-semibold">
              Status Hari Ini ({todayStr})
            </span>
            <div className="text-base font-extrabold mt-0.5">
              {todayRecord ? (
                <span className="inline-flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  {todayRecord.status} ({todayRecord.subjectName})
                </span>
              ) : (
                <span className="text-amber-100 font-medium text-xs">
                  Belum ada sesi absensi tercatat hari ini
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Persentase Kehadiran</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{attendancePercent}%</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Total Hadir</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{countHadir}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-blue-600">Total Izin</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{countIzin}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-600">Total Sakit</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{countSakit}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-rose-600">Total Alpa</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{countAlpa}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-bold">
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`pb-3 px-1 border-b-2 transition ${
            activeTab === 'riwayat'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Riwayat Presensi ({studentRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('notifikasi')}
          className={`pb-3 px-1 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'notifikasi'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Pemberitahuan Ketidakhadiran ({studentNotifs.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'riwayat' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Guru Pengajar</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Waktu Dicatat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Belum ada riwayat absensi untuk siswa ini.
                    </td>
                  </tr>
                ) : (
                  studentRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{rec.date}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{rec.subjectName}</td>
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
                        {rec.updateReason && (
                          <div className="text-[10px] text-slate-400 mt-0.5 not-italic">
                            Perubahan: {rec.updateReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                        {new Date(rec.recordedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Notifications Tab */
        <div className="space-y-3">
          {studentNotifs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              Tidak ada notifikasi ketidakhadiran. Kehadiran ananda tertib dan terpantau baik!
            </div>
          ) : (
            studentNotifs.map((notif) => (
              <div
                key={notif.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4"
              >
                <div
                  className={`p-2.5 rounded-xl flex-shrink-0 ${
                    notif.status === 'ALPA'
                      ? 'bg-rose-100 text-rose-600'
                      : notif.status === 'SAKIT'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">
                      Pemberitahuan Presensi: {notif.status} ({notif.subjectName})
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(notif.sentAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span>Kanal: {notif.channel}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">Status: {notif.deliveryStatus}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
