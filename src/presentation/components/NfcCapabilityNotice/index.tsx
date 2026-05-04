import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { NfcCapabilityStatus } from '@core/services/mbc/models';
import styles from './nfc-capability-notice.module.css';

export interface NfcCapabilityNoticeProps {
  status: NfcCapabilityStatus;
  t: TFunction;
}

const NfcCapabilityNotice: FC<NfcCapabilityNoticeProps> = ({ status, t }) => {

  if (status === 'supported') return null;

  const statusMap: Record<
    Exclude<NfcCapabilityStatus, 'supported'>,
    { title: string; message: string; modifier: string }
  > = {
    unsupported: {
      title: t('mbc_nfc_unsupported_title'),
      message: t('mbc_nfc_unsupported_message'),
      modifier: 'unsupported',
    },
    permission_pending: {
      title: t('mbc_nfc_permission_pending_title'),
      message: t('mbc_nfc_permission_pending_message'),
      modifier: 'permission-pending',
    },
    permission_denied: {
      title: t('mbc_nfc_permission_denied_title'),
      message: t('mbc_nfc_permission_denied_message'),
      modifier: 'permission-denied',
    },
  };

  const config = statusMap[status];

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
