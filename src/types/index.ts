export type UserRole = 'admin' | 'guru' | 'wali_kelas' | 'orang_tua' | 'siswa';

export type AttendanceStatus = 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA';

export type SyncState = 'synced' | 'pending' | 'syncing' | 'failed' | 'conflict';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  relatedStudentId?: string; // For parent or student
  relatedTeacherId?: string; // For teacher or homeroom teacher
  classId?: string; // If homeroom teacher or student
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  classId: string;
  className: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  address?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  subject: string;
  phone: string;
  isHomeroom?: boolean;
  homeroomClassId?: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "X MIPA 1"
  grade: number; // 10, 11, 12
  academicYear: string; // "2024/2025"
  semester: 'Ganjil' | 'Genap';
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  totalStudents: number;
}

export interface Schedule {
  id: string;
  classId: string;
  className: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  startTime: string; // e.g. "07:30"
  endTime: string; // e.g. "09:00"
  room: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  classId: string;
  className: string;
  scheduleId: string;
  subjectName: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  note?: string;
  recordedBy: string; // User's name
  recordedByRole: UserRole;
  recordedAt: string; // ISO string
  updatedBy?: string;
  updatedAt?: string;
  updateReason?: string;
  syncState: SyncState;
  syncError?: string;
  version: number;
}

export interface AuditLog {
  id: string;
  attendanceId: string;
  studentName: string;
  date: string;
  scheduleName: string;
  previousStatus: AttendanceStatus;
  newStatus: AttendanceStatus;
  changedBy: string;
  changedAt: string;
  reason: string;
}

export interface ParentNotification {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  date: string;
  subjectName: string;
  status: AttendanceStatus;
  message: string;
  channel: 'WhatsApp' | 'SMS' | 'In-App';
  sentAt: string;
  deliveryStatus: 'Terkirim' | 'Gagal' | 'Menunggu';
}

export interface SyncConflict {
  id: string;
  localRecord: AttendanceRecord;
  serverRecord: AttendanceRecord;
  studentName: string;
  date: string;
  subjectName: string;
}
