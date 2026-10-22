import { useEffect, useState } from 'react';
import { getSimulatedOffline } from '../services/storage';

export function useOnlineStatus() {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [simulatedOffline, setSimulatedOfflineState] = useState<boolean>(() => getSimulatedOffline());

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    const handleSimChange = () => setSimulatedOfflineState(getSimulatedOffline());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-simulation-changed', handleSimChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-simulation-changed', handleSimChange);
    };
  }, []);

  const isActuallyOnline = browserOnline && !simulatedOffline;

  return {
    isOnline: isActuallyOnline,
    browserOnline,
    simulatedOffline,
  };
}
