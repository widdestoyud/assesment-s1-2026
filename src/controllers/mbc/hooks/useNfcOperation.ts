import { useState } from 'react';
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
}

export const useChipTransferOperation = (): UseChipTransferOperationReturn => {
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
  };
};
