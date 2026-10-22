import {
  Student,
  Teacher,
  SchoolClass,
  Schedule,
  AttendanceRecord,
  User,
  AuditLog,
  ParentNotification,
  SyncConflict,
  AttendanceStatus,
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_SCHEDULES,
  INITIAL_USERS,
  getSeedAttendanceRecords,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

const STORAGE_KEYS = {
  CLASSES: 'absensi_classes_v1',
  TEACHERS: 'absensi_teachers_v1',
  STUDENTS: 'absensi_students_v1',
  SCHEDULES: 'absensi_schedules_v1',
  RECORDS: 'absensi_records_v1',
  QUEUE: 'absensi_queue_v1',
  AUDIT_LOGS: 'absensi_audit_v1',
  NOTIFICATIONS: 'absensi_notifs_v1',
  CURRENT_USER: 'absensi_user_v1',
  LAST_SYNC: 'absensi_last_sync_v1',
  SIMULATE_OFFLINE: 'absensi_sim_offline_v1',
  RETENTION_DAYS: 'absensi_retention_v1',
  SCHOOL_INFO: 'absensi_school_v1',
};

export const defaultSchoolInfo = {
  name: 'Al-Qudwah Global Islamic School (GIS)',
  address: 'Jl. Raya Al-Qudwah No. 1, Komplek Pendidikan Terpadu',
  phone: '(0252) 201234',
  academicYear: '2024/2025',
  semester: 'Ganjil',
};

// Initialize default storage data if missing
export const initializeStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECORDS)) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(getSeedAttendanceRecords()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUEUE)) {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    // Default logged in as Guru Bambang
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[1]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LAST_SYNC)) {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }
  if (!localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO)) {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(defaultSchoolInfo));
  }
};

// Safe JSON getters and setters
function getJson<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setJson<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Master Data APIs
export const getSchoolInfo = () => getJson(STORAGE_KEYS.SCHOOL_INFO, defaultSchoolInfo);
export const saveSchoolInfo = (info: typeof defaultSchoolInfo) => setJson(STORAGE_KEYS.SCHOOL_INFO, info);

export const getClasses = (): SchoolClass[] => getJson(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
export const saveClasses = (classes: SchoolClass[]) => setJson(STORAGE_KEYS.CLASSES, classes);

export const getTeachers = (): Teacher[] => getJson(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
export const saveTeachers = (teachers: Teacher[]) => setJson(STORAGE_KEYS.TEACHERS, teachers);

export const getStudents = (): Student[] => getJson(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
export const saveStudents = (students: Student[]) => setJson(STORAGE_KEYS.STUDENTS, students);

export const getSchedules = (): Schedule[] => getJson(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES);
export const saveSchedules = (schedules: Schedule[]) => setJson(STORAGE_KEYS.SCHEDULES, schedules);

// User Auth Session
export const getCurrentUser = (): User => getJson(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[1]);
export const setCurrentUser = (user: User) => setJson(STORAGE_KEYS.CURRENT_USER, user);
export const getAllUsers = (): User[] => INITIAL_USERS;

// Offline Simulation Flag
export const getSimulatedOffline = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.SIMULATE_OFFLINE) === 'true';
};
export const setSimulatedOffline = (offline: boolean) => {
  localStorage.setItem(STORAGE_KEYS.SIMULATE_OFFLINE, offline ? 'true' : 'false');
  window.dispatchEvent(new Event('offline-simulation-changed'));
};

// Sync Meta
export const getLastSyncTime = (): string => {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || new Date().toISOString();
};
export const setLastSyncTime = (isoString: string) => {
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, isoString);
};

// Attendance Records API
export const getAttendanceRecords = (): AttendanceRecord[] => {
  return getJson(STORAGE_KEYS.RECORDS, []);
};

export const getOfflineQueue = (): AttendanceRecord[] => {
  return getJson(STORAGE_KEYS.QUEUE, []);
};

export const getAuditLogs = (): AuditLog[] => {
  return getJson(STORAGE_KEYS.AUDIT_LOGS, []);
};

export const getNotifications = (): ParentNotification[] => {
  return getJson(STORAGE_KEYS.NOTIFICATIONS, []);
};

// Add / Update Attendance Batch
export interface SaveAttendancePayload {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  previousRecord?: AttendanceRecord;
  updateReason?: string;
}

export const saveAttendanceBatch = (
  schedule: Schedule,
  date: string,
  user: User,
  items: SaveAttendancePayload[],
  isOnline: boolean
): { success: boolean; mode: 'online' | 'offline'; recordsSaved: AttendanceRecord[] } => {
  const allStudents = getStudents();
  const currentRecords = getAttendanceRecords();
  const currentQueue = getOfflineQueue();
  const auditLogs = getAuditLogs();
  const notifications = getNotifications();

  const isSimulated = getSimulatedOffline();
  const effectivelyOnline = isOnline && !isSimulated;

  const now = new Date().toISOString();
  const updatedRecords: AttendanceRecord[] = [];

  for (const item of items) {
    const student = allStudents.find((s) => s.id === item.studentId);
    if (!student) continue;

    const existingInServer = currentRecords.find(
      (r) => r.studentId === item.studentId && r.scheduleId === schedule.id && r.date === date
    );

    const existingInQueue = currentQueue.find(
      (r) => r.studentId === item.studentId && r.scheduleId === schedule.id && r.date === date
    );

    const baseRecord = existingInQueue || existingInServer;

    const record: AttendanceRecord = {
      id: baseRecord?.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentId: student.id,
      studentName: student.name,
      studentNis: student.nis,
      classId: schedule.classId,
      className: schedule.className,
      scheduleId: schedule.id,
      subjectName: schedule.subjectName,
      date,
      status: item.status,
      note: item.note || '',
      recordedBy: baseRecord ? baseRecord.recordedBy : user.name,
      recordedByRole: baseRecord ? baseRecord.recordedByRole : user.role,
      recordedAt: baseRecord ? baseRecord.recordedAt : now,
      updatedBy: baseRecord ? user.name : undefined,
      updatedAt: baseRecord ? now : undefined,
      updateReason: item.updateReason || undefined,
      syncState: effectivelyOnline ? 'synced' : 'pending',
      version: (baseRecord?.version || 0) + 1,
    };

    updatedRecords.push(record);

    // If changing existing status with reason, add audit log
    if (baseRecord && baseRecord.status !== item.status && item.updateReason) {
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        attendanceId: record.id,
        studentName: student.name,
        date,
        scheduleName: `${schedule.subjectName} (${schedule.className})`,
        previousStatus: baseRecord.status,
        newStatus: item.status,
        changedBy: user.name,
        changedAt: now,
        reason: item.updateReason,
      };
      auditLogs.unshift(newAudit);
    }

    // Auto trigger notification for Non-Hadir (Izin, Sakit, Alpa) if new or changed
    if (['IZIN', 'SAKIT', 'ALPA'].includes(item.status)) {
      const statusIndo = item.status === 'SAKIT' ? 'SAKIT' : item.status === 'IZIN' ? 'IZIN' : 'ALPA (Tanpa Keterangan)';
      const msg = `Yth. Bpk/Ibu ${student.parentName}, ananda ${student.name} tercatat ${statusIndo} pada pelajaran ${schedule.subjectName} (${date}). Mohon konfirmasi bila diperlukan. Terima kasih. - Al-Qudwah GIS`;

      const newNotif: ParentNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        studentId: student.id,
        studentName: student.name,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        date,
        subjectName: schedule.subjectName,
        status: item.status,
        message: msg,
        channel: 'WhatsApp',
        sentAt: now,
        deliveryStatus: effectivelyOnline ? 'Terkirim' : 'Menunggu',
      };
      notifications.unshift(newNotif);
    }
  }

  setJson(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
  setJson(STORAGE_KEYS.NOTIFICATIONS, notifications);

  if (effectivelyOnline) {
    // Write directly to records
    const updatedServerList = [...currentRecords];
    for (const rec of updatedRecords) {
      const idx = updatedServerList.findIndex((r) => r.id === rec.id || (r.studentId === rec.studentId && r.scheduleId === rec.scheduleId && r.date === rec.date));
      if (idx >= 0) {
        updatedServerList[idx] = rec;
      } else {
        updatedServerList.push(rec);
      }
    }
    setJson(STORAGE_KEYS.RECORDS, updatedServerList);
    setLastSyncTime(now);
    window.dispatchEvent(new Event('absensi-data-updated'));
    return { success: true, mode: 'online', recordsSaved: updatedRecords };
  } else {
    // Save to offline queue
    const updatedQueue = [...currentQueue];
    for (const rec of updatedRecords) {
      const idx = updatedQueue.findIndex((q) => q.id === rec.id || (q.studentId === rec.studentId && q.scheduleId === rec.scheduleId && q.date === rec.date));
      if (idx >= 0) {
        updatedQueue[idx] = rec;
      } else {
        updatedQueue.push(rec);
      }
    }
    setJson(STORAGE_KEYS.QUEUE, updatedQueue);
    window.dispatchEvent(new Event('absensi-data-updated'));
    return { success: true, mode: 'offline', recordsSaved: updatedRecords };
  }
};

// Process Sync
export const syncOfflineData = async (): Promise<{
  syncedCount: number;
  conflicts: SyncConflict[];
  errors: string[];
}> => {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, conflicts: [], errors: [] };
  }

  // Mark all queue items as syncing
  setJson(
    STORAGE_KEYS.QUEUE,
    queue.map((q) => ({ ...q, syncState: 'syncing' as const }))
  );
  window.dispatchEvent(new Event('absensi-data-updated'));

  // Artificial short delay to simulate network sync
  await new Promise((resolve) => setTimeout(resolve, 800));

  const serverRecords = getAttendanceRecords();
  const conflicts: SyncConflict[] = [];
  const errors: string[] = [];
  const remainingQueue: AttendanceRecord[] = [];
  let syncedCount = 0;

  const updatedServerRecords = [...serverRecords];

  for (const localRec of queue) {
    const existingServer = updatedServerRecords.find(
      (s) => s.studentId === localRec.studentId && s.scheduleId === localRec.scheduleId && s.date === localRec.date
    );

    // Conflict detection: if server record exists, was updated after local record's base version
    if (existingServer && existingServer.version > localRec.version) {
      conflicts.push({
        id: `conf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        localRecord: localRec,
        serverRecord: existingServer,
        studentName: localRec.studentName,
        date: localRec.date,
        subjectName: localRec.subjectName,
      });
      remainingQueue.push({ ...localRec, syncState: 'conflict' });
      continue;
    }

    // Normal merge: prevent duplicates
    const idx = updatedServerRecords.findIndex((s) => s.id === localRec.id || (s.studentId === localRec.studentId && s.scheduleId === localRec.scheduleId && s.date === localRec.date));
    const finalRec: AttendanceRecord = {
      ...localRec,
      syncState: 'synced',
      version: Math.max(localRec.version, (existingServer?.version || 0) + 1),
    };

    if (idx >= 0) {
      updatedServerRecords[idx] = finalRec;
    } else {
      updatedServerRecords.push(finalRec);
    }
    syncedCount++;
  }

  // Also update pending parent notifications delivery status
  const notifications = getNotifications().map((notif) => {
    if (notif.deliveryStatus === 'Menunggu') {
      return { ...notif, deliveryStatus: 'Terkirim' as const };
    }
    return notif;
  });
  setJson(STORAGE_KEYS.NOTIFICATIONS, notifications);

  setJson(STORAGE_KEYS.RECORDS, updatedServerRecords);
  setJson(STORAGE_KEYS.QUEUE, remainingQueue);
  setLastSyncTime(new Date().toISOString());
  window.dispatchEvent(new Event('absensi-data-updated'));

  return { syncedCount, conflicts, errors };
};

// Resolve Conflict
export const resolveConflict = (
  conflict: SyncConflict,
  resolution: 'keep_local' | 'keep_server'
) => {
  const queue = getOfflineQueue();
  const serverRecords = getAttendanceRecords();

  const newQueue = queue.filter((q) => q.id !== conflict.localRecord.id);

  if (resolution === 'keep_local') {
    const resolvedRec: AttendanceRecord = {
      ...conflict.localRecord,
      syncState: 'synced',
      version: conflict.serverRecord.version + 1,
    };
    const idx = serverRecords.findIndex((s) => s.id === conflict.serverRecord.id);
    if (idx >= 0) {
      serverRecords[idx] = resolvedRec;
    } else {
      serverRecords.push(resolvedRec);
    }
    setJson(STORAGE_KEYS.RECORDS, serverRecords);
  }

  setJson(STORAGE_KEYS.QUEUE, newQueue);
  window.dispatchEvent(new Event('absensi-data-updated'));
};

// Combined view of records for current device (Server + Local Queue)
export const getAllActiveRecords = (): AttendanceRecord[] => {
  const server = getAttendanceRecords();
  const queue = getOfflineQueue();

  const map = new Map<string, AttendanceRecord>();

  for (const s of server) {
    const key = `${s.studentId}_${s.scheduleId}_${s.date}`;
    map.set(key, s);
  }

  // Queue overrides server for local display
  for (const q of queue) {
    const key = `${q.studentId}_${q.scheduleId}_${q.date}`;
    map.set(key, q);
  }

  return Array.from(map.values());
};

// Shared device safe logout
export const secureLogout = (clearLocalData: boolean) => {
  if (clearLocalData) {
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Helper: Export to CSV
export const exportRecordsToCSV = (records: AttendanceRecord[], filename = 'Laporan_Absensi_Siswa.csv') => {
  const headers = [
    'Tanggal',
    'Kelas',
    'Mata Pelajaran',
    'NIS',
    'Nama Siswa',
    'Status',
    'Keterangan',
    'Dicatat Oleh',
    'Waktu Catat',
    'Diubah Oleh',
    'Alasan Ubah',
    'Status Sinkron',
  ];

  const rows = records.map((r) => [
    `"${r.date}"`,
    `"${r.className}"`,
    `"${r.subjectName}"`,
    `"${r.studentNis}"`,
    `"${r.studentName}"`,
    `"${r.status}"`,
    `"${(r.note || '').replace(/"/g, '""')}"`,
    `"${r.recordedBy}"`,
    `"${r.recordedAt}"`,
    `"${r.updatedBy || '-'}"`,
    `"${(r.updateReason || '-').replace(/"/g, '""')}"`,
    `"${r.syncState}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
