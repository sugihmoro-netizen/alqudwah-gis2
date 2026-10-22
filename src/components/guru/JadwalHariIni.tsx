import React from 'react';
import { Schedule, User } from '../../types';
import { getAllActiveRecords, getStudents } from '../../services/storage';
import { Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

interface Props {
  schedules: Schedule[];
  currentUser: User;
  onSelectScheduleForInput: (scheduleId: string) => void;
}

export const JadwalHariIni: React.FC<Props> = ({
  schedules,
  currentUser,
  onSelectScheduleForInput,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const allRecords = getAllActiveRecords();
  const allStudents = getStudents();

  // Filter for teacher if guru
  const mySchedules =
    currentUser.role === 'guru' && currentUser.relatedTeacherId
      ? schedules.filter((s) => s.teacherId === currentUser.relatedTeacherId)
      : schedules;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Jadwal Mengajar Hari Ini
          </h2>
          <p className="text-xs text-slate-500">
            Daftar sesi mata pelajaran dan status pengisian presensi hari ini
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mySchedules.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            Tidak ada jadwal mengajar yang tercatat untuk hari ini.
          </div>
        ) : (
          mySchedules.map((sch) => {
            const classStudents = allStudents.filter((st) => st.classId === sch.classId);
            const recordedForThisSchedule = allRecords.filter(
              (r) => r.scheduleId === sch.id && r.date === todayStr
            );

            const isCompleted =
              classStudents.length > 0 &&
              recordedForThisSchedule.length >= classStudents.length;

            return (
              <div
                key={sch.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {sch.className}
                    </span>
                    <span className="text-xs text-slate-500">{sch.room}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">{sch.subjectName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pengajar: {sch.teacherName}</p>

                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {sch.startTime} - {sch.endTime} WIB
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Lengkap ({recordedForThisSchedule.length}/{classStudents.length})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        {recordedForThisSchedule.length > 0
                          ? `Belum Selesai (${recordedForThisSchedule.length}/${classStudents.length})`
                          : 'Belum Diabsen'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectScheduleForInput(sch.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition active:scale-95 shadow-xs"
                  >
                    <span>{isCompleted ? 'Lihat / Edit' : 'Isi Presensi'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
