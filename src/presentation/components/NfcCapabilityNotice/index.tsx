import type { FC } from 'react';
import type { NfcCapabilityStatus } from '@core/services/mbc/models';
import styles from './nfc-capability-notice.module.css';

export interface NfcCapabilityNoticeProps {
  status: NfcCapabilityStatus;
}

const NfcCapabilityNotice: FC<NfcCapabilityNoticeProps> = ({ status }) => {
  if (status === 'supported' || status === 'permission_pending') {
    return null;
  }

  const isUnsupported = status === 'unsupported';

  return (
    <div
      role="alert"
      data-testid="nfc-capability-notice"
      className={`${styles['nfc-capability-notice']} ${
        isUnsupported
          ? styles['nfc-capability-notice--unsupported']
          : styles['nfc-capability-notice--denied']
      }`}
    >
      <div className={styles['nfc-capability-notice__icon']}>
        {isUnsupported ? '🚫' : '🔒'}
      </div>
      <p
        className={`${styles['nfc-capability-notice__title']} ${
          isUnsupported
            ? styles['nfc-capability-notice__title--unsupported']
            : styles['nfc-capability-notice__title--denied']
        }`}
      >
        {isUnsupported
          ? 'NFC Tidak Didukung'
          : 'Izin NFC Ditolak'}
      </p>
      <p
        className={`${styles['nfc-capability-notice__message']} ${
          isUnsupported
            ? styles['nfc-capability-notice__message--unsupported']
            : styles['nfc-capability-notice__message--denied']
        }`}
      >
        {isUnsupported
          ? 'Browser atau perangkat ini tidak mendukung Web NFC. Gunakan Chrome di Android untuk fitur NFC.'
          : 'Izin akses NFC ditolak. Aktifkan kembali izin NFC di pengaturan browser.'}
      </p>
      <p className={styles['nfc-capability-notice__hint']}>
        {isUnsupported
          ? 'Web NFC hanya tersedia di Chrome Android 89+. Desktop dan iOS tidak didukung.'
          : 'Buka Settings → Site Settings → NFC → Izinkan untuk situs ini.'}
      </p>
    </div>
  );
};

export default NfcCapabilityNotice;
