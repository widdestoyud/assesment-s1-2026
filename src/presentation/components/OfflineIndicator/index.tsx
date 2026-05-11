import { useEffect, useState } from 'react';
import type { FC } from 'react';
import SignalSnackBar from '@components/SignalSnackBar';

const OfflineIndicator: FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPwaNotice, setShowPwaNotice] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    if (!('serviceWorker' in navigator)) {
      setShowPwaNotice(true);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (showPwaNotice) {
    return (
      <SignalSnackBar
        variant="warning"
        message="Browser ini tidak mendukung mode offline. Gunakan Chrome untuk pengalaman terbaik."
        position="bottom"
        data-testid="pwa-notice"
      />
    );
  }

  return (
    <SignalSnackBar
      variant="dark"
      message="Anda sedang offline — aplikasi tetap berjalan"
      position="bottom"
      visible={isOffline}
      data-testid="offline-indicator"
    />
  );
};

export default OfflineIndicator;
