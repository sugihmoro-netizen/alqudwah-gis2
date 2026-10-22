import React, { useState } from 'react';
import {
  getClasses,
  getStudents,
  getAllActiveRecords,
  exportRecordsToCSV,
} from '../../services/storage';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';

export const LaporanAbsensi: React.FC = () => {
  const classes = getClasses();
  const students = getStudents();
  const records = getAllActiveRecords();

  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (filterClass !== 'ALL' && r.classId !== filterClass) return false;
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    if (
      searchQuery &&
      !r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !r.studentNis.includes(searchQuery) &&
      !r.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Summary counts
  const total = filteredRecords.length;
  const countHadir = filteredRecords.filter((r) => r.status === 'HADIR').length;
  const countIzin = filteredRecords.filter((r) => r.status === 'IZIN').length;
  const countSakit = filteredRecords.filter((r) => r.status === 'SAKIT').length;
  const countAlpa = filteredRecords.filter((r) => r.status === 'ALPA').length;

  const attendancePercent = total > 0 ? Math.round((countHadir / total) * 100) : 100;

  const handleExportCSV = () => {
    const filename = `Rekap_Absensi_${filterClass !== 'ALL' ? filterClass : 'Semua'}_${startDate}_${endDate}.csv`;
    exportRecordsToCSV(filteredRecords, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Laporan & Rekapitulasi Presensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Filter multi-dimensi dan ekspor laporan ke format Excel / CSV (FR-13, FR-14)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredRecords.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Excel / CSV ({filteredRecords.length} Data)</span>
        </button>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Laporan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Class Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status Kehadiran</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="HADIR">Hadir Saja</option>
              <option value="IZIN">Izin Saja</option>
              <option value="SAKIT">Sakit Saja</option>
              <option value="ALPA">Alpa Saja</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
            />
          </div>

          {/* Search text */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cari Siswa/Mapel</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Nama / NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Sesi Terpilih</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Hadir</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {countHadir} <span className="text-xs text-slate-400 font-normal">({attendancePercent}%)</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-blue-600">Izin</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{countIzin}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-600">Sakit</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{countSakit}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-rose-600">Alpa</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{countAlpa}</div>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-4">NIS & Siswa</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Penginput</th>
                <th className="py-3 px-4 text-right">Sinkron</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada data presensi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">{r.date}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 text-xs">{r.className}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 text-xs">{r.subjectName}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{r.studentName}</div>
                      <div className="text-[11px] text-slate-400">NIS: {r.studentNis}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.status === 'HADIR'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'IZIN'
                            ? 'bg-blue-100 text-blue-800'
                            : r.status === 'SAKIT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 italic">
                      {r.note || '-'}
                      {r.updateReason && (
                        <div className="text-[10px] text-slate-400 not-italic">
                          Alasan ubah: {r.updateReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{r.recordedBy}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.recordedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          r.syncState === 'synced'
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        {r.syncState === 'synced' ? 'Sinkron' : 'Antrean'}
                      </span>
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
