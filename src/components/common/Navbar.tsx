import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { getAllUsers } from '../../services/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { LogoutModal } from './LogoutModal';
import {
  GraduationCap,
  Users,
  Shield,
  UserCheck,
  HeartHandshake,
  LogOut,
  ChevronDown,
  School,
} from 'lucide-react';

interface Props {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onLogout: (clearLocal: boolean) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  activeTab,
  onSelectTab,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const allUsers = getAllUsers();

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin Sekolah';
      case 'guru':
        return 'Guru Mapel';
      case 'wali_kelas':
        return 'Wali Kelas';
      case 'orang_tua':
        return 'Orang Tua / Wali';
      case 'siswa':
        return 'Siswa';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'guru':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'wali_kelas':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'orang_tua':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'siswa':
        return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5" />;
      case 'guru':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'wali_kelas':
        return <UserCheck className="w-3.5 h-3.5" />;
      case 'orang_tua':
        return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'siswa':
        return <Users className="w-3.5 h-3.5" />;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                  Absensi Siswa AlQudwah GIS
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Al-Qudwah GIS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Global Islamic School • Presensi Digital & Offline-First
              </p>
            </div>
          </div>

          {/* Right Section: PWA Install + Role Switcher + Logout */}
          <div className="flex items-center gap-2.5">
            <PWAInstallButton />

            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition text-left"
                title="Ganti Peran Pengguna untuk Pengujian"
              >
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getRoleBadgeColor(
                        currentUser.role
                      )}`}
                    >
                      {getRoleIcon(currentUser.role)}
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>

                <div className="md:hidden flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getRoleBadgeColor(
                      currentUser.role
                    )}`}
                  >
                    {getRoleIcon(currentUser.role)}
                    <span className="text-[11px]">{getRoleLabel(currentUser.role)}</span>
                  </span>
                </div>

                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowRoleMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Ganti Peran Pengguna (Demo PRD)
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Pilih profil untuk melihat tampilan sesuai hak akses
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {allUsers.map((u) => {
                        const isSelected = u.id === currentUser.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              onSwitchUser(u);
                              setShowRoleMenu(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition ${
                              isSelected
                                ? 'bg-blue-50 text-blue-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-medium">{u.name}</div>
                              <span
                                className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getRoleBadgeColor(
                                  u.role
                                )}`}
                              >
                                {getRoleIcon(u.role)}
                                {getRoleLabel(u.role)}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Logout / Keluar Akun"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Security Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirmLogout={(clearLocal) => {
          setShowLogoutModal(false);
          onLogout(clearLocal);
        }}
      />
    </>
  );
};
