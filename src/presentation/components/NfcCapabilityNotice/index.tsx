import type { FC } from 'react';
import type { NfcCapabilityStatus } from '@core/services/mbc/models';
import styles from './nfc-capability-notice.module.css';

export interface NfcCapabilityNoticeProps {
  status: NfcCapabilityStatus;
}

const STATUS_CONFIG: Record<
  Exclude<NfcCapabilityStatus, 'supported'>,
  { title: string; message: string; modifier: string }
> = {
  unsupported: {
    title: '⚠️ NFC Tidak Tersedia',
    message: 'Perangkat ini tidak mendukung NFC. Fitur yang memerlukan NFC tidak dapat digunakan.',
    modifier: 'unsupported',
  },
  permission_pending: {
    title: '🔒 Izin NFC Diperlukan',
    message: 'Izin NFC belum diberikan. Beberapa fitur mungkin memerlukan izin NFC.',
    modifier: 'permission-pending',
  },
  permission_denied: {
    title: '🚫 Izin NFC Ditolak',
    message: 'Izin NFC ditolak. Aktifkan izin NFC di pengaturan perangkat untuk menggunakan fitur ini.',
    modifier: 'permission-denied',
  },
};

const NfcCapabilityNotice: FC<NfcCapabilityNoticeProps> = ({ status }) => {
  if (status === 'supported') return null;

  const config = STATUS_CONFIG[status];

  return (
    <div
      role="alert"
      data-testid="nfc-capability-notice"
      className={`${styles['nfc-capability-notice']} ${styles[`nfc-capability-notice--${config.modifier}`]}`}
    >
      <p className={styles['nfc-capability-notice__title']}>{config.title}</p>
      <p className={styles['nfc-capability-notice__message']}>{config.message}</p>
    </div>
  );
};

export default NfcCapabilityNotice;
