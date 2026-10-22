import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA
  if (isInstalled) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        PWA Terpasang
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
      >
        <Download className="w-4 h-4" />
        <span>Pasang Aplikasi (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          <span>Pasang di iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Pasang di iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <p>Tekan tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah ke atas) di menu Safari bawah.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                  <p>Gulir ke bawah lalu pilih opsi <strong>Add to Home Screen (Tambah ke Layar Utama)</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                  <p>Tekan <strong>Tambah</strong> di pojok kanan atas. Aplikasi kini dapat diakses offline seperti aplikasi asli!</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop indicator or install tip
  return (
    <button
      onClick={() => alert('Untuk memasang PWA di browser ini, klik ikon instal/bintang di bilah alamat browser Anda (URL bar) atau gunakan Chrome / Edge.')}
      className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-xs"
      title="Dukungan PWA aktif untuk offline dan instalasi"
    >
      <Download className="w-3.5 h-3.5 text-slate-500" />
      <span>PWA Siap</span>
    </button>
  );
};
