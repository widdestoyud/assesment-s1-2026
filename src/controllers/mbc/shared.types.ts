import type { TFunction } from 'i18next';
import type { NfcCapabilityStatus, NfcStatus, ResultModalProps } from '@src/@core/models/mbc';

export type { ResultModalProps } from '@src/@core/models/mbc';

export interface NfcOperationState {
  showNfcModal: boolean;
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  scanImage: string;
}

export interface NfcCapabilityState {
  nfcCapability: NfcCapabilityStatus;
  nfcAvailable: boolean;
  onNfcNoticeClose: () => void;
  nfcFailedImage: string;
}

export interface NfcPageState extends NfcOperationState, NfcCapabilityState {
  t: TFunction;
  pageTitle: string;
  onBack: () => void;
  resultProps: ResultModalProps | null;
  onCloseResult: () => void;
}
