import type { TFunction } from 'i18next';
import type { ChipTransferCapabilityStatus, ChipTransferStatus, ResultModalProps } from '@src/@core/models/mbc';

export type { ResultModalProps } from '@src/@core/models/mbc';

export interface ChipTransferOperationState {
  showNfcModal: boolean;
  chipTransferStatus: ChipTransferStatus;
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  scanImage: string;
}

export interface ChipTransferCapabilityState {
  chipTransferCapability: ChipTransferCapabilityStatus;
  chipTransferAvailable: boolean;
  onNfcNoticeClose: () => void;
  chipTransferFailedImage: string;
}

export interface ChipTransferPageState extends ChipTransferOperationState, ChipTransferCapabilityState {
  t: TFunction;
  pageTitle: string;
  onBack: () => void;
  resultProps: ResultModalProps | null;
  onCloseResult: () => void;
}
