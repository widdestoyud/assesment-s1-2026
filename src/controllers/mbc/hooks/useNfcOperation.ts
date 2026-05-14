import type { AwilixRegistry } from '@di/container';
import type { ChipTransferStatus } from '@src/@core/models/mbc';

export interface UseChipTransferOperationReturn {
  showNfcModal: boolean;
  chipTransferStatus: ChipTransferStatus;
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  execute: (asyncFn: () => Promise<void>) => Promise<void>;
  setError: (error: string | null) => void;
  setChipTransferStatus: (status: ChipTransferStatus) => void;
  resetState: () => void;
}

export const useChipTransferOperation = (
  deps: Pick<AwilixRegistry, 'useState'>,
): UseChipTransferOperationReturn => {
  const { useState } = deps;

  const [showNfcModal, setShowNfcModal] = useState(false);
  const [chipTransferStatus, setChipTransferStatus] = useState<ChipTransferStatus>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCancelScan = () => {
    setIsProcessing(false);
    setChipTransferStatus('idle');
  };

  const onCloseNfcModal = () => {
    onCancelScan();
    setShowNfcModal(false);
  };

  const execute = async (asyncFn: () => Promise<void>) => {
    setShowNfcModal(true);
    setIsProcessing(true);
    setChipTransferStatus('scanning');
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
    setChipTransferStatus('idle');
    setIsProcessing(false);
    setError(null);
  };

  return {
    showNfcModal,
    chipTransferStatus,
    isProcessing,
    error,
    onCloseNfcModal,
    onCancelScan,
    execute,
    setError,
    setChipTransferStatus,
    resetState,
  };
};
