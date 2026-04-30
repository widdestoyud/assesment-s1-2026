import type { FC } from 'react';
import type { NfcStatus } from '@core/services/mbc/models';

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
      className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center"
      style={{ opacity: isProcessing ? 0.6 : 1 }}
    >
      <span className="text-5xl" aria-hidden="true">
        {config.emoji}
      </span>
      <p className="text-lg font-medium text-gray-700">
        {label ?? config.text}
      </p>
      {isProcessing && (
        <p className="text-sm text-gray-500">Sedang memproses...</p>
      )}
    </div>
  );
};

export default NfcTapPrompt;
