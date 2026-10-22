import React, { useState } from 'react';
import {
  Student,
  Teacher,
  SchoolClass,
  Schedule,
  User,
} from '../../types';
import {
  getStudents,
  saveStudents,
  getTeachers,
  saveTeachers,
  getClasses,
  saveClasses,
  getSchedules,
  saveSchedules,
  getAllUsers,
} from '../../services/storage';
import {
  Users,
  GraduationCap,
  School,
  Calendar,
  Shield,
  Plus,
  Trash2,
  Check,
  X,
} from 'lucide-react';

export const DataMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru' | 'kelas' | 'jadwal' | 'pengguna'>('siswa');

  const [students, setStudents] = useState<Student[]>(getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(getTeachers());
  const [classes, setClasses] = useState<SchoolClass[]>(getClasses());
  const [schedules, setSchedules] = useState<Schedule[]>(getSchedules());
  const users = getAllUsers();

  // Modal / Add state
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form state
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L',
    classId: classes[0]?.id || '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  // New Teacher Form state
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({
    nip: '',
    name: '',
    subject: '',
    phone: '',
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.nis) {
      alert('Nama dan NIS wajib diisi.');
      return;
    }

    const cls = classes.find((c) => c.id === newStudent.classId) || classes[0];
    const created: Student = {
      id: `std-${Date.now()}`,
      nis: newStudent.nis || '',
      nisn: newStudent.nisn || `007${Math.floor(Math.random() * 9000000)}`,
      name: newStudent.name || '',
      gender: (newStudent.gender as 'L' | 'P') || 'L',
      classId: cls.id,
      className: cls.name,
      parentName: newStudent.parentName || 'Orang Tua Siswa',
      parentPhone: newStudent.parentPhone || '081234567890',
      parentEmail: newStudent.parentEmail || '',
    };

    const updated = [...students, created];
    setStudents(updated);
    saveStudents(updated);
    setShowAddModal(false);
    setNewStudent({
      nis: '',
      nisn: '',
      name: '',
      gender: 'L',
      classId: classes[0]?.id || '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
    });
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      const updated = students.filter((s) => s.id !== id);
      setStudents(updated);
      saveStudents(updated);
    }
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacher.name || !newTeacher.subject) {
      alert('Nama guru dan mata pelajaran wajib diisi.');
      return;
    }

    const created: Teacher = {
      id: `tch-${Date.now()}`,
      nip: newTeacher.nip || '198501012010011001',
      name: newTeacher.name || '',
      subject: newTeacher.subject || '',
      phone: newTeacher.phone || '081234567800',
    };

    const updated = [...teachers, created];
    setTeachers(updated);
    saveTeachers(updated);
    setShowAddModal(false);
    setNewTeacher({ nip: '', name: '', subject: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <School className="w-6 h-6 text-blue-600" />
            Manajemen Data Master Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data siswa, guru, rombel kelas, jadwal pelajaran, dan akun pengguna (FR-04)
          </p>
        </div>

        {(activeTab === 'siswa' || activeTab === 'guru') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah {activeTab === 'siswa' ? 'Siswa' : 'Guru'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('siswa')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'siswa'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Siswa ({students.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('guru')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'guru'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Data Guru ({teachers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('kelas')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'kelas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Rombel Kelas ({classes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'jadwal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Pelajaran ({schedules.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('pengguna')}
          className={`pb-3 px-2 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
            activeTab === 'pengguna'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Akun & Peran ({users.length})</span>
        </button>
      </div>

      {/* Tab: Siswa */}
      {activeTab === 'siswa' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">NIS / NISN</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Jenis Kelamin</th>
                  <th className="py-3 px-4">Nama & No. HP Orang Tua</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center text-xs text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-xs">{st.nis}</div>
                      <div className="text-[10px] text-slate-400">NISN: {st.nisn}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{st.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {st.className}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {st.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      <div className="font-semibold text-slate-800">{st.parentName}</div>
                      <div className="text-slate-400">{st.parentPhone}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteStudent(st.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus data siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Guru */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">NIP</th>
                  <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">No. Telepon / WhatsApp</th>
                  <th className="py-3 px-4">Tugas Tambahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((tc, idx) => (
                  <tr key={tc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center text-xs text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{tc.nip}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{tc.name}</td>
                    <td className="py-3 px-4 font-medium text-blue-700 text-xs">{tc.subject}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{tc.phone}</td>
                    <td className="py-3 px-4">
                      {tc.isHomeroom ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Wali Kelas
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Guru Mapel</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Rombel Kelas */}
      {activeTab === 'kelas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Tingkat Kelas {cls.grade}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{cls.name}</h3>
                <div className="text-xs text-slate-500 mt-3 space-y-1">
                  <div>Tahun Ajaran: <strong>{cls.academicYear} ({cls.semester})</strong></div>
                  <div>Wali Kelas: <strong>{cls.homeroomTeacherName}</strong></div>
                  <div>Jumlah Siswa: <strong>{students.filter(s => s.classId === cls.id).length} siswa</strong></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Jadwal Pelajaran */}
      {activeTab === 'jadwal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Hari</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4">Guru Pengajar</th>
                  <th className="py-3 px-4">Ruangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-800 text-xs">{sch.day}</td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                      {sch.startTime} - {sch.endTime} WIB
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700 text-xs">{sch.className}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{sch.subjectName}</td>
                    <td className="py-3 px-4 text-xs text-slate-600">{sch.teacherName}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{sch.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Pengguna */}
      {activeTab === 'pengguna' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Nama Pengguna</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4 text-right">Status Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{usr.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{usr.username}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{usr.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        Aktif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Student / Teacher */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Tambah {activeTab === 'siswa' ? 'Siswa Baru' : 'Guru Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeTab === 'siswa' ? (
              <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 24109"
                    value={newStudent.nis}
                    onChange={(e) => setNewStudent({ ...newStudent, nis: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={newStudent.classId}
                      onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={newStudent.gender}
                      onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'L' | 'P' })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                    >
                      <option value="L">Laki-laki (L)</option>
                      <option value="P">Perempuan (P)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Orang Tua</label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Simpan Siswa
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddTeacher} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 198901012015011002"
                    value={newTeacher.nip}
                    onChange={(e) => setNewTeacher({ ...newTeacher, nip: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dewi Lestari, S.Pd."
                    value={newTeacher.name}
                    onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran yang Diampu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kimia"
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Contoh: 081299887766"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Simpan Guru
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
