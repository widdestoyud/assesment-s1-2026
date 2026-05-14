import type { AwilixRegistry } from '@di/container';
import type { NfcStatus } from '@src/@core/models/mbc';

export interface UseNfcOperationReturn {
  showNfcModal: boolean;
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  execute: (asyncFn: () => Promise<void>) => Promise<void>;
  setError: (error: string | null) => void;
  setNfcStatus: (status: NfcStatus) => void;
  resetState: () => void;
}

export const useNfcOperation = (
  deps: Pick<AwilixRegistry, 'useState'>,
): UseNfcOperationReturn => {
  const { useState } = deps;

  const [showNfcModal, setShowNfcModal] = useState(false);
  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCancelScan = () => {
    setIsProcessing(false);
    setNfcStatus('idle');
  };

  const onCloseNfcModal = () => {
    onCancelScan();
    setShowNfcModal(false);
  };

  const execute = async (asyncFn: () => Promise<void>) => {
    setShowNfcModal(true);
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);

    try {
      await asyncFn();
    } finally {
      setIsProcessing(false);
      setShowNfcModal(false);
    }
  };

  const resetState = () => {
    setShowNfcModal(false);
    setNfcStatus('idle');
    setIsProcessing(false);
    setError(null);
  };

  return {
    showNfcModal,
    nfcStatus,
    isProcessing,
    error,
    onCloseNfcModal,
    onCancelScan,
    execute,
    setError,
    setNfcStatus,
    resetState,
  };
};
