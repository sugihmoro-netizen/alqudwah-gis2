import React, { useState, useEffect } from 'react';
import {
  Schedule,
  Student,
  AttendanceStatus,
  AttendanceRecord,
  User,
} from '../../types';
import {
  getStudents,
  getSchedules,
  getAllActiveRecords,
  saveAttendanceBatch,
  SaveAttendancePayload,
} from '../../services/storage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Save,
  UserCheck,
  Search,
  MessageSquare,
  History,
  ShieldCheck,
  WifiOff,
  Sparkles,
} from 'lucide-react';

interface Props {
  currentUser: User;
  onSavedNotification?: (msg: string) => void;
}

export const InputAbsensi: React.FC<Props> = ({ currentUser, onSavedNotification }) => {
  const { isOnline } = useOnlineStatus();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [recordsMap, setRecordsMap] = useState<Map<string, AttendanceRecord>>(new Map());

  // Form working state: studentId -> { status, note }
  const [formValues, setFormValues] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Audit modal state for editing existing saved record
  const [auditModalStudent, setAuditModalStudent] = useState<{
    student: Student;
    newStatus: AttendanceStatus;
    previousStatus: AttendanceStatus;
  } | null>(null);
  const [auditReason, setAuditReason] = useState('');

  // Load schedules and filter based on teacher if role is guru
  useEffect(() => {
    const allSchedules = getSchedules();
    const filtered =
      currentUser.role === 'guru' && currentUser.relatedTeacherId
        ? allSchedules.filter((s) => s.teacherId === currentUser.relatedTeacherId)
        : allSchedules;

    setSchedules(filtered);
    if (filtered.length > 0 && !selectedScheduleId) {
      setSelectedScheduleId(filtered[0].id);
    }
  }, [currentUser]);

  // Load students and existing records when schedule or date changes
  useEffect(() => {
    if (!selectedScheduleId) return;

    const allSchedules = getSchedules();
    const currentSchedule = allSchedules.find((s) => s.id === selectedScheduleId);
    if (!currentSchedule) return;

    const allStudents = getStudents();
    const filteredStudents = allStudents.filter((s) => s.classId === currentSchedule.classId);
    setStudentsInClass(filteredStudents);

    // Existing records for this schedule and date
    const allRecords = getAllActiveRecords();
    const filteredRecords = allRecords.filter(
      (r) => r.scheduleId === selectedScheduleId && r.date === selectedDate
    );

    const map = new Map<string, AttendanceRecord>();
    const initialForms: Record<string, { status: AttendanceStatus; note: string }> = {};

    filteredStudents.forEach((student) => {
      const existing = filteredRecords.find((r) => r.studentId === student.id);
      if (existing) {
        map.set(student.id, existing);
        initialForms[student.id] = { status: existing.status, note: existing.note || '' };
      } else {
        // default to HADIR for convenience
        initialForms[student.id] = { status: 'HADIR', note: '' };
      }
    });

    setRecordsMap(map);
    setFormValues(initialForms);
  }, [selectedScheduleId, selectedDate]);

  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId);

  // Status Change Handler with audit modal requirement if already saved on server/local
  const handleStatusChange = (student: Student, newStatus: AttendanceStatus) => {
    const existing = recordsMap.get(student.id);

    // If already saved previously and status changed, prompt for audit reason
    if (existing && existing.status !== newStatus) {
      setAuditModalStudent({
        student,
        newStatus,
        previousStatus: existing.status,
      });
      setAuditReason('');
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      [student.id]: {
        ...(prev[student.id] || { note: '' }),
        status: newStatus,
      },
    }));
  };

  const handleConfirmAuditReason = () => {
    if (!auditModalStudent) return;
    if (!auditReason.trim()) {
      alert('Mohon cantumkan alasan perubahan status absensi untuk audit sistem (FR-10).');
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      [auditModalStudent.student.id]: {
        ...(prev[auditModalStudent.student.id] || { note: '' }),
        status: auditModalStudent.newStatus,
      },
    }));

    // Save reason temporarily
    setFormValues((prev) => ({
      ...prev,
      [`${auditModalStudent.student.id}_reason`]: {
        status: auditModalStudent.newStatus,
        note: auditReason,
      },
    }));

    setAuditModalStudent(null);
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setFormValues((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'HADIR' }),
        note,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    studentsInClass.forEach((st) => {
      updated[st.id] = { status: 'HADIR', note: formValues[st.id]?.note || '' };
    });
    setFormValues(updated);
  };

  const handleSaveAttendance = async () => {
    if (!currentSchedule) return;

    setIsSubmitting(true);
    try {
      const itemsToSave: SaveAttendancePayload[] = studentsInClass.map((st) => {
        const formVal = formValues[st.id] || { status: 'HADIR', note: '' };
        const reasonObj = formValues[`${st.id}_reason`];
        const existing = recordsMap.get(st.id);

        return {
          studentId: st.id,
          status: formVal.status,
          note: formVal.note,
          previousRecord: existing,
          updateReason: reasonObj?.note,
        };
      });

      const result = saveAttendanceBatch(
        currentSchedule,
        selectedDate,
        currentUser,
        itemsToSave,
        isOnline
      );

      // Reload local records
      const allRecords = getAllActiveRecords();
      const filteredRecords = allRecords.filter(
        (r) => r.scheduleId === selectedScheduleId && r.date === selectedDate
      );
      const newMap = new Map<string, AttendanceRecord>();
      filteredRecords.forEach((r) => newMap.set(r.studentId, r));
      setRecordsMap(newMap);

      const msg =
        result.mode === 'online'
          ? `Absensi kelas ${currentSchedule.className} (${itemsToSave.length} siswa) berhasil disimpan dan disinkronkan ke server!`
          : `Koneksi offline: Absensi kelas ${currentSchedule.className} disimpan di antrean lokal perangkat dan otomatis disinkronkan saat terhubung kembali.`;

      setSuccessBanner(msg);
      onSavedNotification?.(msg);
      setTimeout(() => setSuccessBanner(null), 6000);
    } catch (e) {
      alert('Terjadi kesalahan saat menyimpan data absensi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = studentsInClass.filter(
    (st) =>
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.nis.includes(searchTerm)
  );

  // Summary counts
  let countHadir = 0;
  let countIzin = 0;
  let countSakit = 0;
  let countAlpa = 0;
  let countUnrecorded = 0;

  studentsInClass.forEach((st) => {
    const val = formValues[st.id];
    if (!val) {
      countUnrecorded++;
    } else {
      if (val.status === 'HADIR') countHadir++;
      else if (val.status === 'IZIN') countIzin++;
      else if (val.status === 'SAKIT') countSakit++;
      else if (val.status === 'ALPA') countAlpa++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-600" />
            Input Absensi Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Catat kehadiran per sesi jadwal mata pelajaran secara langsung atau offline (FR-07)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
              <WifiOff className="w-4 h-4" />
              <span>Penyimpanan Offline Siap</span>
            </div>
          )}
          <button
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition active:scale-95"
            title="Isi status semua siswa dengan Hadir"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tandai Semua Hadir</span>
          </button>
        </div>
      </div>

      {/* Filter / Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        {/* Schedule Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Jadwal Mata Pelajaran & Kelas
          </label>
          <div className="relative">
            <select
              value={selectedScheduleId}
              onChange={(e) => setSelectedScheduleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {schedules.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.className} - {sch.subjectName} ({sch.day}, {sch.startTime}-{sch.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Tanggal Absensi
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Search Student */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Cari Siswa
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NIS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Schedule Info Banner & Quick Stats */}
      {currentSchedule && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-200 text-xs font-medium uppercase tracking-wider">
                <span>{currentSchedule.className}</span>
                <span>•</span>
                <span>{currentSchedule.room}</span>
                <span>•</span>
                <span>Pengajar: {currentSchedule.teacherName}</span>
              </div>
              <h2 className="text-xl font-bold mt-1">{currentSchedule.subjectName}</h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-blue-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {currentSchedule.day}, {selectedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentSchedule.startTime} - {currentSchedule.endTime} WIB
                </span>
              </div>
            </div>

            {/* Quick Badges Counter */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-3 py-2">
                <span className="block text-lg font-bold text-emerald-300">{countHadir}</span>
                <span className="text-[11px] text-emerald-200">Hadir</span>
              </div>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl px-3 py-2">
                <span className="block text-lg font-bold text-blue-300">{countIzin}</span>
                <span className="text-[11px] text-blue-200">Izin</span>
              </div>
              <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-3 py-2">
                <span className="block text-lg font-bold text-amber-300">{countSakit}</span>
                <span className="text-[11px] text-amber-200">Sakit</span>
              </div>
              <div className="bg-rose-500/20 border border-rose-400/30 rounded-xl px-3 py-2">
                <span className="block text-lg font-bold text-rose-300">{countAlpa}</span>
                <span className="text-[11px] text-rose-200">Alpa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 font-medium">{successBanner}</div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Attendance Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">
              Daftar Presensi Siswa ({filteredStudents.length} Siswa)
            </h3>
          </div>

          <div className="text-xs text-slate-500">
            {recordsMap.size > 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sudah pernah diabsen ({recordsMap.size} siswa)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Belum diabsen untuk sesi ini
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa & NIS</th>
                <th className="py-3 px-4 text-center">Status Kehadiran</th>
                <th className="py-3 px-4">Keterangan / Catatan</th>
                <th className="py-3 px-4 text-right">Riwayat / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ada siswa ditemukan di kelas ini.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const formVal = formValues[student.id] || { status: 'HADIR', note: '' };
                  const existingRecord = recordsMap.get(student.id);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition ${
                        formVal.status === 'ALPA'
                          ? 'bg-rose-50/40'
                          : formVal.status === 'SAKIT'
                          ? 'bg-amber-50/30'
                          : formVal.status === 'IZIN'
                          ? 'bg-blue-50/30'
                          : ''
                      }`}
                    >
                      {/* Number */}
                      <td className="py-3.5 px-4 text-center font-medium text-slate-400 text-xs">
                        {index + 1}
                      </td>

                      {/* Name & NIS */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{student.name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>NIS: {student.nis}</span>
                          <span>•</span>
                          <span>{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(['HADIR', 'IZIN', 'SAKIT', 'ALPA'] as AttendanceStatus[]).map((st) => {
                            const isSelected = formVal.status === st;
                            let style = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50';
                            if (isSelected) {
                              if (st === 'HADIR') style = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                              if (st === 'IZIN') style = 'bg-blue-600 text-white border-blue-600 shadow-xs';
                              if (st === 'SAKIT') style = 'bg-amber-600 text-white border-amber-600 shadow-xs';
                              if (st === 'ALPA') style = 'bg-rose-600 text-white border-rose-600 shadow-xs';
                            }

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(student, st)}
                                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition active:scale-95 ${style}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Note Field */}
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder={
                            formVal.status !== 'HADIR'
                              ? 'Contoh: Sakit flu, Dispensasi OSN...'
                              : 'Catatan opsional...'
                          }
                          value={formVal.note}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:ring-1 transition ${
                            formVal.status !== 'HADIR'
                              ? 'border-amber-300 bg-amber-50/50 focus:border-amber-500'
                              : 'border-slate-200 bg-white focus:border-blue-500'
                          }`}
                        />
                      </td>

                      {/* Audit & Sync Status Column */}
                      <td className="py-3.5 px-4 text-right">
                        {existingRecord ? (
                          <div className="text-[11px] space-y-0.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
                                existingRecord.syncState === 'synced'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : existingRecord.syncState === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {existingRecord.syncState === 'synced' ? 'Tersinkron' : 'Antrean Lokal'}
                            </span>
                            <div className="text-slate-400">
                              Oleh {existingRecord.recordedBy.split(' ')[0]}
                            </div>
                            {existingRecord.updateReason && (
                              <span
                                className="text-slate-500 underline cursor-help text-[10px] block"
                                title={`Alasan ubah: ${existingRecord.updateReason}`}
                              >
                                Diperbarui
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Draf baru
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Save Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            Total {studentsInClass.length} siswa • Waktu pencatatan akan direkam otomatis (FR-09)
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={isSubmitting || studentsInClass.length === 0}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Absensi Kelas Ini'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Audit Reason Modal for status update (FR-10 & FR-16) */}
      {auditModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3 text-blue-600">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Alasan Perubahan</h3>
                <p className="text-xs text-slate-500">Audit Jejak Perubahan Status Presensi (FR-10)</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 mb-4 border border-slate-200">
              <div>Siswa: <strong>{auditModalStudent.student.name}</strong></div>
              <div>
                Status Sebelumnya: <span className="font-bold text-slate-700">{auditModalStudent.previousStatus}</span> → Status Baru: <span className="font-bold text-blue-600">{auditModalStudent.newStatus}</span>
              </div>
            </div>

            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alasan Perubahan Status Presensi <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: Surat keterangan dokter baru diserahkan oleh orang tua / kesalahan pengetikan awal..."
              value={auditReason}
              onChange={(e) => setAuditReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAuditModalStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAuditReason}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
