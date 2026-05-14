import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
} from '@src/@core/models/mbc';
import { NfcServiceError } from '@core/services/mbc/nfc.service';
import { useNfcCapability, useNfcOperation } from './hooks';
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

  // NFC capability
  nfcCapability: NfcCapabilityStatus;
  nfcAvailable: boolean;
  onNfcNoticeClose: () => void;
  nfcFailedImage: string;

  // NFC scan modal
  showNfcModal: boolean;
  nfcStatus: NfcStatus;
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

  // Card data (raw, for advanced display)
  cardData: CardData | null;
  rawEncryptedBase64: string | null;
  rawDecryptedJson: string | null;

  // Pre-formatted card display values
  formattedBalance: string;
  formattedTransactions: FormattedTransaction[];
  checkinStatusLabel: string;
  formattedEntryTime: string | null;

  // Legacy (kept for compatibility)
  successImage: string;
  nfcErrorImage: string;
}

const ScoutController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'useNavigate'
    | 'readCardUseCase'
    | 'nfcService'
    | 'silentShieldService'
    | 'cardDataService'
    | 'images'
    | 'helpers'
  >,
): ScoutControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    useNavigate,
    nfcService,
    silentShieldService,
    cardDataService,
    images,
    helpers,
  } = deps;

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { nfcCapability, nfcAvailable } = useNfcCapability({ useState, useEffect, nfcService });
  const nfcOp = useNfcOperation({ useState });

  const [cardData, setCardData] = useState<CardData | null>(null);
  const [rawEncryptedBase64, setRawEncryptedBase64] = useState<string | null>(null);
  const [rawDecryptedJson, setRawDecryptedJson] = useState<string | null>(null);
  const [resultType, setResultType] = useState<ScoutResultType>(null);

  const uint8ToBase64 = (bytes: Uint8Array): string => {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCodePoint(byte);
    }
    return btoa(binary);
  };

  const onReadCard = async () => {
    if (nfcOp.isProcessing) return;

    setCardData(null);
    setRawEncryptedBase64(null);
    setRawDecryptedJson(null);
    setResultType(null);

    await nfcOp.execute(async () => {
      try {
        // Step 1: Read raw bytes from card
        const rawEncrypted = await nfcService.readCard();

        // Store encrypted raw data
        if (rawEncrypted.length > 0) {
          setRawEncryptedBase64(uint8ToBase64(rawEncrypted));
        }

        // Step 2: Try to decrypt
        const decrypted = await silentShieldService.decrypt(rawEncrypted);

        // Store decrypted raw data
        const decoder = new TextDecoder();
        setRawDecryptedJson(decoder.decode(decrypted));

        // Step 3: Try to deserialize
        const card = cardDataService.deserialize(decrypted);

        nfcOp.setNfcStatus('success');
        setCardData(card);
        setResultType('read_success');
      } catch (err: unknown) {
        nfcOp.setNfcStatus('error');
        if (err instanceof NfcServiceError) {
          nfcOp.setError(err.messageKey);
        } else {
          nfcOp.setError(err instanceof Error ? err.message : String(err));
        }
        setResultType('nfc_error');
      }
    });
  };

  const onCloseResult = () => {
    setCardData(null);
    setRawEncryptedBase64(null);
    setRawDecryptedJson(null);
    nfcOp.setNfcStatus('idle');
    nfcOp.setError(null);
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
    if (resultType === 'nfc_error' && nfcOp.error) {
      return {
        variant: 'error',
        title: String(t('mbc_nfc_error_title')),
        subtitle: nfcOp.error.startsWith('mbc_')
          ? String(t(nfcOp.error as 'mbc_nfc_error_hardware_unavailable'))
          : nfcOp.error,
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

    // NFC capability
    nfcCapability,
    nfcAvailable,
    onNfcNoticeClose,
    nfcFailedImage: images.nfcFailed,

    // NFC scan modal
    showNfcModal: nfcOp.showNfcModal,
    nfcStatus: nfcOp.nfcStatus,
    isReading: nfcOp.isProcessing,
    error: nfcOp.error,
    onCloseNfcModal: nfcOp.onCloseNfcModal,
    scanImage: images.tapNfc,

    // Result modal
    resultProps,
    resultType,
    onCloseResult,

    // Actions
    onReadCard,

    // Card data (raw)
    cardData,
    rawEncryptedBase64,
    rawDecryptedJson,

    // Pre-formatted card display values
    formattedBalance,
    formattedTransactions,
    checkinStatusLabel,
    formattedEntryTime,

    // Legacy (kept for compatibility)
    successImage: images.success,
    nfcErrorImage: images.nfcLoadDataFailed,
  };
};

export default ScoutController;
