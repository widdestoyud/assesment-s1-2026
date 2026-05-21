import type { TFunction } from 'i18next';
import type { ChipTransferCapabilityStatus, ChipTransferStatus, ResultModalProps } from '@src/@core/models/mbc';

export type { ResultModalProps } from '@src/@core/models/mbc';

/** Error keys that indicate a card validation/data issue (not NFC hardware) */
const CARD_INVALID_ERROR_KEYS = [
  'mbc_nfc_error_card_not_recognized',
  'mbc_nfc_error_card_data_corrupted',
  'mbc_nfc_error_incompatible_card',
  'mbc_error_decryption_failed',
];

/**
 * Returns the appropriate error title key based on the error message.
 * Card-related errors get "Kartu Tidak Valid", NFC hardware errors get "NFC Tidak Tersedia".
 */
export const getErrorTitleKey = (errorKey: string | null): string => {
  if (errorKey && CARD_INVALID_ERROR_KEYS.includes(errorKey)) {
    return 'mbc_nfc_error_card_invalid_title';
  }
  return 'mbc_nfc_error_title';
};

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
