import { useState } from 'react';
import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  ChipTransferCapabilityStatus,
  ChipTransferStatus,
} from '@src/@core/models/mbc';
import { ChipTransferServiceError } from '@core/services/mbc/nfc.service';
import { useChipTransferCapability, useChipTransferOperation } from './hooks';
import type { ResultModalProps } from './shared.types';

export type { ResultModalProps } from './shared.types';

export type ScoutResultType = 'read_success' | 'nfc_error' | null;

export interface FormattedTransaction {
  label: string;
  time: string;
  amount: string;
  isPositive: boolean;
  isCheckin: boolean;
}

export interface ScoutControllerInterface {
  // Translation
  t: TFunction;

  // Page metadata
  pageTitle: string;
  onBack: () => void;

  // Chip transfer capability
  chipTransferCapability: ChipTransferCapabilityStatus;
  chipTransferAvailable: boolean;
  onNfcNoticeClose: () => void;
  chipTransferFailedImage: string;

  // Chip transfer scan modal
  showNfcModal: boolean;
  chipTransferStatus: ChipTransferStatus;
  isReading: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  scanImage: string;

  // Result modal — pre-mapped, ready to spread
  resultProps: ResultModalProps | null;
  resultType: ScoutResultType;
  onCloseResult: () => void;

  // Actions
  onReadCard: () => void;

  // Pre-formatted card display values
  formattedBalance: string;
  formattedTransactions: FormattedTransaction[];
  checkinStatusLabel: string;
  formattedEntryTime: string | null;
}

const ScoutController = (
  deps: Pick<
    AwilixRegistry,
    | 'useTranslation'
    | 'useNavigate'
    | 'chipTransferService'
    | 'silentShieldService'
    | 'cardDataService'
    | 'images'
    | 'helpers'
  >,
): ScoutControllerInterface => {
  const {
    useTranslation,
    useNavigate,
    chipTransferService,
    silentShieldService,
    cardDataService,
    images,
    helpers,
  } = deps;

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { chipTransferCapability, chipTransferAvailable } = useChipTransferCapability({ chipTransferService });
  const chipOp = useChipTransferOperation();

  const [cardData, setCardData] = useState<CardData | null>(null);
  const [resultType, setResultType] = useState<ScoutResultType>(null);

  const onReadCard = async () => {
    if (chipOp.isProcessing) return;

    setCardData(null);
    setResultType(null);

    await chipOp.execute(async () => {
      try {
        // Step 1: Read raw bytes from card
        const rawEncrypted = await chipTransferService.readCard();

        // Step 2: Try to decrypt
        const decrypted = await silentShieldService.decrypt(rawEncrypted);

        // Step 3: Try to deserialize
        const card = cardDataService.deserialize(decrypted);

        chipOp.setChipTransferStatus('success');
        setCardData(card);
        setResultType('read_success');
      } catch (err: unknown) {
        chipOp.setChipTransferStatus('error');
        if (err instanceof ChipTransferServiceError) {
          chipOp.setError(err.messageKey);
        } else {
          chipOp.setError(err instanceof Error ? err.message : String(err));
        }
        setResultType('nfc_error');
      }
    });
  };

  const onCloseResult = () => {
    setCardData(null);
    chipOp.setChipTransferStatus('idle');
    chipOp.setError(null);
    setResultType(null);
  };

  const onBack = () => {
    window.history.back();
  };

  const onNfcNoticeClose = () => {
    navigate({ to: '/' });
  };

  // Computed values
  const pageTitle = String(t('mbc_scout_title'));

  // Result modal props — pre-mapped, ready to spread
  const getResultProps = (): ResultModalProps | null => {
    if (resultType === 'read_success' && cardData) {
      return {
        variant: 'success',
        title: String(t('mbc_scout_read_success_title')),
        subtitle: String(t('mbc_scout_read_success_subtitle')),
        buttonLabel: String(t('mbc_common_close_button')),
        imageSrc: images.success,
      };
    }
    if (resultType === 'nfc_error' && chipOp.error) {
      return {
        variant: 'error',
        title: String(t('mbc_nfc_error_title')),
        subtitle: chipOp.error.startsWith('mbc_')
          ? String(t(chipOp.error as 'mbc_nfc_error_hardware_unavailable'))
          : chipOp.error,
        buttonLabel: String(t('mbc_common_close_button')),
        imageSrc: images.nfcLoadDataFailed,
      };
    }
    return null;
  };

  const resultProps = getResultProps();

  // Pre-formatted card display values
  const formattedBalance = cardData ? helpers.formatIDR(cardData.b) : '';

  const getTransactionLabel = (tp: 'tu' | 'ci' | 'co'): string => {
    switch (tp) {
      case 'tu': return String(t('mbc_scout_history_topup'));
      case 'ci': return String(t('mbc_scout_history_checkin'));
      case 'co': return String(t('mbc_scout_history_checkout'));
    }
  };

  const formattedTransactions: FormattedTransaction[] = cardData
    ? cardData.h.map((entry) => ({
        label: getTransactionLabel(entry.tp),
        time: new Date(entry.ts * 1000).toLocaleString('id-ID'),
        amount: entry.tp === 'ci' ? '—' : `${entry.a >= 0 ? '+' : ''}${helpers.formatIDR(entry.a)}`,
        isPositive: entry.a >= 0,
        isCheckin: entry.tp === 'ci',
      }))
    : [];

  const checkinStatusLabel = cardData
    ? cardData.s === 1
      ? String(t('mbc_scout_status_checked_in'))
      : String(t('mbc_scout_status_idle'))
    : '';

  const formattedEntryTime = cardData?.t
    ? `${String(t('mbc_common_entry_time_label'))} ${new Date(cardData.t).toLocaleString('id-ID')}`
    : null;

  return {
    // Translation
    t,

    // Page metadata
    pageTitle,
    onBack,

    // Chip transfer capability
    chipTransferCapability,
    chipTransferAvailable,
    onNfcNoticeClose,
    chipTransferFailedImage: images.nfcFailed,

    // Chip transfer scan modal
    showNfcModal: chipOp.showNfcModal,
    chipTransferStatus: chipOp.chipTransferStatus,
    isReading: chipOp.isProcessing,
    error: chipOp.error,
    onCloseNfcModal: chipOp.onCloseNfcModal,
    scanImage: images.tapNfc,

    // Result modal
    resultProps,
    resultType,
    onCloseResult,

    // Actions
    onReadCard,

    // Pre-formatted card display values
    formattedBalance,
    formattedTransactions,
    checkinStatusLabel,
    formattedEntryTime,
  };
};

export default ScoutController;
