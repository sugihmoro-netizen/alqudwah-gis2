import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  getOfflineQueue,
  getLastSyncTime,
  syncOfflineData,
  setSimulatedOffline,
} from '../../services/storage';
import { SyncConflict } from '../../types';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Database,
  SlidersHorizontal,
} from 'lucide-react';

interface Props {
  onConflictsFound?: (conflicts: SyncConflict[]) => void;
}

export const SyncStatusBanner: React.FC<Props> = ({ onConflictsFound }) => {
  const { isOnline, simulatedOffline } = useOnlineStatus();
  const [queue, setQueue] = useState(getOfflineQueue());
  const [lastSync, setLastSync] = useState(getLastSyncTime());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const refreshState = () => {
    setQueue(getOfflineQueue());
    setLastSync(getLastSyncTime());
  };

  useEffect(() => {
    refreshState();
    const handleDataUpdate = () => refreshState();
    window.addEventListener('absensi-data-updated', handleDataUpdate);
    return () => window.removeEventListener('absensi-data-updated', handleDataUpdate);
  }, []);

  // Auto sync when online and there are pending items
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      handleSync();
    }
  }, [isOnline, queue.length]);

  const handleSync = async () => {
    if (!isOnline) {
      setSyncFeedback('Tidak dapat menyinkronkan saat offline. Sambungkan internet terlebih dahulu.');
      setTimeout(() => setSyncFeedback(null), 4000);
      return;
    }
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncOfflineData();
      refreshState();
      if (res.conflicts.length > 0) {
        onConflictsFound?.(res.conflicts);
        setSyncFeedback(`Sinkronisasi selesai dengan ${res.conflicts.length} konflik yang perlu ditinjau.`);
      } else {
        setSyncFeedback(`Berhasil menyinkronkan ${res.syncedCount} data absensi ke server!`);
      }
    } catch {
      setSyncFeedback('Gagal melakukan sinkronisasi data.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const toggleSimulateOffline = () => {
    setSimulatedOffline(!simulatedOffline);
  };

  const pendingCount = queue.filter((q) => q.syncState === 'pending').length;
  const conflictCount = queue.filter((q) => q.syncState === 'conflict').length;

  const formatLastSync = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '-';
    }
  };

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-3 sm:px-6 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Left: Online/Offline Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span>Online (Terhubung)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Mode Offline (Tersimpan Lokal)</span>
              </span>
            )}
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Sync Stats */}
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Sinkron Terakhir: <strong className="text-slate-200">{formatLastSync(lastSync)}</strong></span>
            </span>
          </div>
        </div>

        {/* Right: Pending Queue status + Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {queue.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-md font-medium">
              <Database className="w-3.5 h-3.5 animate-pulse" />
              <span>
                {pendingCount} Data Menunggu Sinkron
                {conflictCount > 0 && ` (${conflictCount} Konflik)`}
              </span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Semua data tersinkron</span>
            </div>
          )}

          {/* Sync Now Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing || (!isOnline && queue.length === 0)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-medium transition active:scale-95 ${
              queue.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            } disabled:opacity-50`}
            title="Kirim perubahan lokal ke server"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-blue-300' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
          </button>

          {/* Toggle Offline Simulation for Testing (FR-PWA requirement) */}
          <button
            onClick={toggleSimulateOffline}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border transition text-[11px] ${
              simulatedOffline
                ? 'bg-red-950/80 border-red-500 text-red-300 hover:bg-red-900/80'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Klik untuk mensimulasikan jaringan offline / putus"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{simulatedOffline ? 'Simulasi: Offline (Aktif)' : 'Simulasi Offline'}</span>
          </button>
        </div>
      </div>

      {/* Sync Notification Banner if triggered */}
      {syncFeedback && (
        <div className="mt-1.5 max-w-7xl mx-auto py-1 px-3 rounded bg-blue-950/90 text-blue-200 border border-blue-800 flex items-center justify-between text-xs">
          <span>{syncFeedback}</span>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
};
