import type { FC } from 'react';
import type { ChipTransferStatus } from '../types';
import styles from './nfc-tap-prompt.module.css';

export interface NfcTapPromptProps {
  chipTransferStatus: ChipTransferStatus;
  isProcessing: boolean;
  label?: string;
  t: (key: string) => string;
}

const NfcTapPrompt: FC<NfcTapPromptProps> = ({
  chipTransferStatus,
  isProcessing,
  label,
  t,
}) => {

  const statusMap: Record<ChipTransferStatus, { emoji: string; text: string }> = {
    idle: { emoji: '📱', text: t('mbc_nfc_status_idle') },
    scanning: { emoji: '🔍', text: t('mbc_nfc_status_scanning') },
    reading: { emoji: '📖', text: t('mbc_nfc_status_reading') },
    writing: { emoji: '✍️', text: t('mbc_nfc_status_writing') },
    verifying: { emoji: '🔄', text: t('mbc_nfc_status_verifying') },
    success: { emoji: '✅', text: t('mbc_nfc_status_success') },
    error: { emoji: '❌', text: t('mbc_nfc_status_error') },
  };

  const config = statusMap[chipTransferStatus];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isProcessing}
      data-testid="nfc-tap-prompt"
      className={styles['nfc-tap-prompt']}
      style={{ opacity: isProcessing ? 0.6 : 1 }}
    >
      <span className={styles['nfc-tap-prompt__emoji']} aria-hidden="true">
        {config.emoji}
      </span>
      <p className={styles['nfc-tap-prompt__status-text']}>
        {label ?? config.text}
      </p>
      {isProcessing && (
        <p className={styles['nfc-tap-prompt__processing-text']}>{t('mbc_nfc_processing')}</p>
      )}
    </div>
  );
};

export default NfcTapPrompt;
