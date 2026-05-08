import { useEffect, useState } from 'react';
import type { FC } from 'react';
import styles from './offline-indicator.module.css';

const OfflineIndicator: FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showPwaNotice, setShowPwaNotice] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Check if browser supports Service Worker (PWA requirement)
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
      <div role="alert" className={styles['offline-indicator--warning']}>
        <span className={styles['offline-indicator__icon']} aria-hidden="true">⚠️</span>
        Browser ini tidak mendukung mode offline. Gunakan Chrome untuk pengalaman terbaik.
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div role="status" aria-live="polite" className={styles['offline-indicator']}>
      <span className={styles['offline-indicator__icon']} aria-hidden="true">📡</span>
      Anda sedang offline — aplikasi tetap berjalan
    </div>
  );
};

export default OfflineIndicator;
