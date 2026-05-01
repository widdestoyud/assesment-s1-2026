import type { FC } from 'react';
import type { NfcStatus } from '@core/services/mbc/models';
import styles from './nfc-tap-prompt.module.css';

export interface NfcTapPromptProps {
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  label?: string;
}

const STATUS_CONFIG: Record<NfcStatus, { emoji: string; text: string }> = {
  idle: { emoji: '📱', text: 'Tempelkan kartu NFC' },
  scanning: { emoji: '🔍', text: 'Menunggu kartu...' },
  reading: { emoji: '📖', text: 'Membaca kartu...' },
  writing: { emoji: '✍️', text: 'Menulis ke kartu...' },
  verifying: { emoji: '🔄', text: 'Memverifikasi...' },
  success: { emoji: '✅', text: 'Berhasil!' },
  error: { emoji: '❌', text: 'Gagal. Coba lagi.' },
};

const NfcTapPrompt: FC<NfcTapPromptProps> = ({
  nfcStatus,
  isProcessing,
  label,
}) => {
  const config = STATUS_CONFIG[nfcStatus];

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
        <p className={styles['nfc-tap-prompt__processing-text']}>Sedang memproses...</p>
      )}
    </div>
  );
};

export default NfcTapPrompt;
