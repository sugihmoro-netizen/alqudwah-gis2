import React, { useState, useEffect } from 'react';
import { User, SyncConflict } from './types';
import {
  initializeStorage,
  getCurrentUser,
  setCurrentUser,
  getSchedules,
  secureLogout,
  getAllUsers,
} from './services/storage';
import { Navbar } from './components/common/Navbar';
import { SyncStatusBanner } from './components/common/SyncStatusBanner';
import { ConflictModal } from './components/common/ConflictModal';
import { InputAbsensi } from './components/guru/InputAbsensi';
import { JadwalHariIni } from './components/guru/JadwalHariIni';
import { RekapWaliKelas } from './components/wali/RekapWaliKelas';
import { PortalOrangTua } from './components/orangtua/PortalOrangTua';
import { PortalSiswa } from './components/siswa/PortalSiswa';
import { LaporanAbsensi } from './components/admin/LaporanAbsensi';
import { DataMaster } from './components/admin/DataMaster';
import { AuditLogView } from './components/admin/AuditLogView';
import { NotificationCenter } from './components/admin/NotificationCenter';
import {
  UserCheck,
  Calendar,
  FileSpreadsheet,
  Database,
  History,
  Bell,
  HeartHandshake,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    initializeStorage();
    return getCurrentUser();
  });

  const [activeTab, setActiveTab] = useState<string>('input-absensi');
  const [activeScheduleForInput, setActiveScheduleForInput] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  // Update default tab based on user role when switching
  useEffect(() => {
    if (currentUser.role === 'orang_tua') {
      setActiveTab('portal-ortu');
    } else if (currentUser.role === 'siswa') {
      setActiveTab('portal-siswa');
    } else if (currentUser.role === 'wali_kelas') {
      setActiveTab('rekap-wali');
    } else if (currentUser.role === 'admin') {
      setActiveTab('laporan');
    } else {
      setActiveTab('input-absensi');
    }
  }, [currentUser.role]);

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  };

  const handleLogout = (clearLocal: boolean) => {
    secureLogout(clearLocal);
    // Switch to first available user or admin
    const defaultUser = getAllUsers()[0];
    setCurrentUser(defaultUser);
    setCurrentUserState(defaultUser);
  };

  const handleSelectScheduleForInput = (scheduleId: string) => {
    setActiveScheduleForInput(scheduleId);
    setActiveTab('input-absensi');
  };

  // Nav menu tabs based on role
  const getNavTabs = () => {
    switch (currentUser.role) {
      case 'guru':
        return [
          { id: 'input-absensi', label: 'Input Presensi', icon: UserCheck },
          { id: 'jadwal', label: 'Jadwal Hari Ini', icon: Calendar },
          { id: 'laporan', label: 'Laporan & Rekap', icon: FileSpreadsheet },
        ];
      case 'wali_kelas':
        return [
          { id: 'rekap-wali', label: 'Rekap Kelas Perwalian', icon: UserCheck },
          { id: 'input-absensi', label: 'Input Presensi', icon: UserCheck },
          { id: 'laporan', label: 'Laporan Presensi', icon: FileSpreadsheet },
        ];
      case 'orang_tua':
        return [
          { id: 'portal-ortu', label: 'Presensi Anak', icon: HeartHandshake },
        ];
      case 'siswa':
        return [
          { id: 'portal-siswa', label: 'Presensi Pribadi', icon: GraduationCap },
        ];
      case 'admin':
        return [
          { id: 'laporan', label: 'Laporan & Ekspor', icon: FileSpreadsheet },
          { id: 'input-absensi', label: 'Presensi Kelas', icon: UserCheck },
          { id: 'master', label: 'Data Master', icon: Database },
          { id: 'notifikasi', label: 'Notifikasi Ortu', icon: Bell },
          { id: 'audit', label: 'Audit Log', icon: History },
        ];
      default:
        return [];
    }
  };

  const navTabs = getNavTabs();
  const schedules = getSchedules();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 sm:pb-8">
      {/* Sync and Network Status Bar (FR-PWA Requirement) */}
      <SyncStatusBanner onConflictsFound={(c) => setConflicts(c)} />

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Navigation Sub-header (Desktop & Tablet) */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {activeTab === 'input-absensi' && (
          <InputAbsensi currentUser={currentUser} />
        )}

        {activeTab === 'jadwal' && (
          <JadwalHariIni
            schedules={schedules}
            currentUser={currentUser}
            onSelectScheduleForInput={handleSelectScheduleForInput}
          />
        )}

        {activeTab === 'rekap-wali' && (
          <RekapWaliKelas currentUser={currentUser} />
        )}

        {activeTab === 'portal-ortu' && (
          <PortalOrangTua currentUser={currentUser} />
        )}

        {activeTab === 'portal-siswa' && (
          <PortalSiswa currentUser={currentUser} />
        )}

        {activeTab === 'laporan' && <LaporanAbsensi />}

        {activeTab === 'master' && <DataMaster />}

        {activeTab === 'notifikasi' && <NotificationCenter />}

        {activeTab === 'audit' && <AuditLogView />}
      </main>

      {/* Mobile Bottom Navigation Bar for PWA Touch Experience */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 leading-tight">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* Conflict Resolution Modal if sync conflicts arise */}
      {conflicts.length > 0 && (
        <ConflictModal
          conflicts={conflicts}
          onResolved={() => setConflicts((prev) => prev.slice(1))}
          onClose={() => setConflicts([])}
        />
      )}
    </div>
  );
}
