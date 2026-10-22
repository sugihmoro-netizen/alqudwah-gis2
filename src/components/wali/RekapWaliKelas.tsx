import React, { useState } from 'react';
import { User, Student, AttendanceRecord } from '../../types';
import {
  getClasses,
  getStudents,
  getAllActiveRecords,
} from '../../services/storage';
import {
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  FileText,
  Filter,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const RekapWaliKelas: React.FC<Props> = ({ currentUser }) => {
  const classes = getClasses();
  const allStudents = getStudents();
  const allRecords = getAllActiveRecords();

  // Find homeroom class for this user or default to cls-1
  const defaultClassId = currentUser.classId || 'cls-1';
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const studentsInClass = allStudents.filter((s) => s.classId === selectedClassId);
  const classRecords = allRecords.filter((r) => r.classId === selectedClassId);

  // Compute stats per student
  const studentStats = studentsInClass.map((student) => {
    const studentRecords = classRecords.filter((r) => r.studentId === student.id);
    const totalSessions = studentRecords.length;
    const hadir = studentRecords.filter((r) => r.status === 'HADIR').length;
    const izin = studentRecords.filter((r) => r.status === 'IZIN').length;
    const sakit = studentRecords.filter((r) => r.status === 'SAKIT').length;
    const alpa = studentRecords.filter((r) => r.status === 'ALPA').length;

    const rate = totalSessions > 0 ? Math.round((hadir / totalSessions) * 100) : 100;
    const needsIntervention = alpa >= 1 || sakit + izin >= 3 || rate < 85;

    return {
      student,
      totalSessions,
      hadir,
      izin,
      sakit,
      alpa,
      rate,
      needsIntervention,
      recentRecords: studentRecords.slice(-5),
    };
  });

  // Overall class stats
  const totalClassSessionsRecorded = classRecords.length;
  const totalClassHadir = classRecords.filter((r) => r.status === 'HADIR').length;
  const classAttendanceRate =
    totalClassSessionsRecorded > 0
      ? Math.round((totalClassHadir / totalClassSessionsRecorded) * 100)
      : 100;

  const atRiskStudents = studentStats.filter((s) => s.needsIntervention);

  const handleOpenWhatsApp = (phone: string, studentName: string, reason: string) => {
    const cleanPhone = phone.replace(/^0/, '62');
    const text = encodeURIComponent(
      `Selamat siang Bpk/Ibu wali dari ${studentName}. Saya wali kelas di Al-Qudwah GIS, ingin mengonfirmasi terkait presensi kehadiran ananda (${reason}). Mohon waktunya untuk koordinasi. Terima kasih.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            Rekap Kehadiran Wali Kelas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau kehadiran siswa perwalian, evaluasi disiplin, dan tindak lanjut siswa berisiko
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase">Pilih Kelas:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} (Wali: {cls.homeroomTeacherName.split(',')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Rata-rata Kehadiran Kelas
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{classAttendanceRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Target 95%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${classAttendanceRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Siswa Perwalian
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {studentsInClass.length} <span className="text-xs font-normal text-slate-400">siswa</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Wali Kelas: <strong>{selectedClass?.homeroomTeacherName}</strong>
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Siswa Perlu Tindak Lanjut
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{atRiskStudents.length}</span>
            <span className="text-xs text-amber-600 font-medium">memerlukan perhatian</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Terdapat catatan Alpa atau kehadiran &lt; 85%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Sesi Presensi Terdata
          </div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">
            {totalClassSessionsRecorded}
          </div>
          <p className="text-xs text-slate-500 mt-2">Tahun Ajaran 2024/2025</p>
        </div>
      </div>

      {/* At-risk student alert section (PRD: Memberikan data untuk mendukung tindak lanjut siswa yang sering absen) */}
      {atRiskStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold text-base mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Peringatan Tindak Lanjut Siswa ({atRiskStudents.length} Siswa)</span>
          </div>
          <p className="text-xs text-amber-800 mb-4">
            Siswa berikut memiliki catatan ketidakhadiran yang memerlukan pembinaan atau komunikasi langsung dengan orang tua:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {atRiskStudents.map(({ student, alpa, sakit, izin, rate }) => (
              <div
                key={student.id}
                className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{student.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">
                      Kehadiran: {rate}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Alpa: <strong className="text-rose-600">{alpa}x</strong> • Sakit: {sakit}x • Izin: {izin}x
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    Orang Tua: {student.parentName} ({student.parentPhone})
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleOpenWhatsApp(
                        student.parentPhone,
                        student.name,
                        `Tercatat Alpa ${alpa} kali dan kehadiran ${rate}%`
                      )
                    }
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hubungi Ortu (WhatsApp)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Student List Table for this class */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Rekapitulasi Presensi Kelas {selectedClass?.name}
          </h3>
          <span className="text-xs text-slate-400">
            Total {studentStats.length} Siswa Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4 text-center">Hadir</th>
                <th className="py-3 px-4 text-center">Izin</th>
                <th className="py-3 px-4 text-center">Sakit</th>
                <th className="py-3 px-4 text-center">Alpa</th>
                <th className="py-3 px-4 text-center">Tingkat Kehadiran</th>
                <th className="py-3 px-4 text-right">Kontak Orang Tua</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentStats.map((item, idx) => (
                <tr key={item.student.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 text-center text-xs text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{item.student.name}</div>
                    <div className="text-xs text-slate-400">NIS: {item.student.nis}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{item.hadir}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-blue-700">{item.izin}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-700">{item.sakit}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-rose-700">{item.alpa}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.rate >= 90
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.rate >= 80
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.rate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        handleOpenWhatsApp(
                          item.student.parentPhone,
                          item.student.name,
                          `Rekap kehadiran: Hadir ${item.hadir}, Izin ${item.izin}, Sakit ${item.sakit}, Alpa ${item.alpa}`
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      title="Kirim pesan WhatsApp ke orang tua"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>{item.student.parentName.split(' ')[0]}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
