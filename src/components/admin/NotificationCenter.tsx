import React, { useState } from 'react';
import { getNotifications } from '../../services/storage';
import { ParentNotification } from '../../types';
import { Bell, MessageCircle, Send, CheckCircle2, Clock, Phone } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<ParentNotification[]>(getNotifications());
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = notifications.filter((n) => {
    if (filterStatus !== 'ALL' && n.deliveryStatus !== filterStatus) return false;
    return true;
  });

  const handleOpenWhatsApp = (notif: ParentNotification) => {
    const cleanPhone = notif.parentPhone.replace(/^0/, '62');
    const text = encodeURIComponent(notif.message);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const total = notifications.length;
  const countSent = notifications.filter((n) => n.deliveryStatus === 'Terkirim').length;
  const countPending = notifications.filter((n) => n.deliveryStatus === 'Menunggu').length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-600" />
            Pemberitahuan Orang Tua (Notifikasi Ketidakhadiran)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Log pengiriman notifikasi otomatis saat siswa tercatat Sakit, Izin, atau Alpa (FR-15)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">Semua Pengiriman ({total})</option>
            <option value="Terkirim">Terkirim ({countSent})</option>
            <option value="Menunggu">Menunggu Sinkron ({countPending})</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Notifikasi Dibuat</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-emerald-600">Berhasil Terkirim</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{countSent}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-amber-600">Menunggu Sinkronisasi</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{countPending}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Orang Tua & No. Telp</th>
                <th className="py-3 px-4">Status & Mapel</th>
                <th className="py-3 px-4">Isi Pesan Notifikasi</th>
                <th className="py-3 px-4 text-center">Status Kirim</th>
                <th className="py-3 px-4 text-right">Kanal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada notifikasi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div>{item.date}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.sentAt).toLocaleTimeString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 text-xs">{item.studentName}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <div className="font-semibold text-slate-800">{item.parentName}</div>
                      <div className="text-slate-400">{item.parentPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] ${
                          item.status === 'ALPA'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'SAKIT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <div className="text-slate-500 text-[11px] mt-0.5">{item.subjectName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                      <p className="line-clamp-2 bg-slate-50 p-1.5 rounded border border-slate-100">
                        {item.message}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.deliveryStatus === 'Terkirim'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.deliveryStatus === 'Terkirim' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        {item.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenWhatsApp(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                        title="Buka pesan di WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kirim WA</span>
                      </button>
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
