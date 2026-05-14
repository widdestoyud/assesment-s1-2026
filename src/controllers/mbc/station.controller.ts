import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
} from '@src/@core/models/mbc';
import { NfcServiceError } from '@core/services/mbc/nfc.service';
import { formatIDR, formatThousands, stripThousands } from '@utils/helpers/mbc.helper';
import { useNfcCapability, useNfcOperation } from './hooks';
import type { ResultModalProps } from './shared.types';

export type { ResultModalProps } from './shared.types';

export type StationPhase = 'home' | 'topup';
export type ResultType = 'register_success' | 'already_registered' | 'not_registered' | 'topup_success' | 'topup_error' | 'nfc_error' | null;

export interface StationControllerInterface {
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
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  scanImage: string;

  // Result modal — pre-mapped, ready to spread
  resultProps: ResultModalProps | null;
  resultType: ResultType;
  onCloseResult: () => void;

  // Actions — controller handles async + modal internally
  onRegister: () => void;
  onStartTopUp: () => void;
  onTopUpNow: () => void;

  // Form state
  phase: StationPhase;
  cardData: CardData | null;
  topUpAmount: string;
  formattedTopUpAmount: string;
  isTopUpValid: boolean;
  selectedChip: number | null;
  quickAmounts: number[];
  onSelectChip: (amount: number) => void;
  onCustomAmountChange: (value: string) => void;

  // Computed
  formattedBalance: string;
}

const QUICK_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

const StationController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'useNavigate'
    | 'validateCardUseCase'
    | 'topUpBalanceUseCase'
    | 'nfcService'
    | 'images'
  >,
): StationControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    useNavigate,
    validateCardUseCase,
    topUpBalanceUseCase,
    nfcService,
    images,
  } = deps;

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { nfcCapability, nfcAvailable } = useNfcCapability({ useState, useEffect, nfcService });
  const nfcOp = useNfcOperation({ useState });

  const [phase, setPhase] = useState<StationPhase>('home');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [resultType, setResultType] = useState<ResultType>(null);
  const [resultAmount, setResultAmount] = useState(0);
  const [selectedChip, setSelectedChip] = useState<number | null>(null);

  // --- NFC error handler ---
  const handleNfcError = (err: unknown) => {
    nfcOp.setNfcStatus('error');
    if (err instanceof NfcServiceError) {
      nfcOp.setError(err.messageKey);
      setResultType('nfc_error');
    } else {
      nfcOp.setError(err instanceof Error ? err.message : String(err));
    }
  };

  // --- Actions ---

  const onRegister = async () => {
    setResultType(null);

    await nfcOp.execute(async () => {
      try {
        const result = await validateCardUseCase.execute();
        nfcOp.setNfcStatus('success');
        if (result.type === 'new') {
          setResultType('register_success');
        } else {
          setResultType('already_registered');
          setCardData({ v: 2, b: result.balance, s: 0, t: null, h: [] });
        }
      } catch (err: unknown) {
        handleNfcError(err);
      }
    });
  };

  const onStartTopUp = async () => {
    setResultType(null);

    await nfcOp.execute(async () => {
      try {
        const result = await validateCardUseCase.execute();
        nfcOp.setNfcStatus('success');

        if (result.type === 'new') {
          setResultType('not_registered');
        } else {
          setCardData({ v: 2, b: result.balance, s: 0, t: null, h: [] });
          setPhase('topup');
        }
      } catch (err: unknown) {
        handleNfcError(err);
      }
    });
  };

  const onTopUpNow = async () => {
    const amount = Number.parseInt(topUpAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) return;

    setResultType(null);
    setResultAmount(amount);

    await nfcOp.execute(async () => {
      try {
        await topUpBalanceUseCase.execute({ amount });
        nfcOp.setNfcStatus('success');
        setResultType('topup_success');
      } catch (err: unknown) {
        nfcOp.setNfcStatus('error');
        if (err instanceof NfcServiceError) {
          nfcOp.setError(err.messageKey);
          setResultType('nfc_error');
        } else {
          setResultType('topup_error');
          nfcOp.setError(err instanceof Error ? err.message : String(err));
        }
      }
    });
  };

  // --- Form handlers ---

  const onSelectChip = (amount: number) => {
    setSelectedChip(amount);
    setTopUpAmount(String(amount));
  };

  const onCustomAmountChange = (value: string) => {
    const raw = stripThousands(value).replace(/\D/g, '');
    setSelectedChip(null);
    setTopUpAmount(raw);
  };

  // --- Modal handlers ---

  const onCloseResult = () => {
    setResultType(null);
    setPhase('home');
    setTopUpAmount('');
    nfcOp.setError(null);
    nfcOp.setNfcStatus('idle');
    setSelectedChip(null);
  };

  // --- Navigation ---

  const onBack = () => {
    window.history.back();
  };

  const onNfcNoticeClose = () => {
    navigate({ to: '/' });
  };

  // --- Computed values ---

  const pageTitle = String(t('mbc_station_title'));
  const parsedAmount = Number.parseInt(topUpAmount, 10);
  const isTopUpValid = !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const formattedTopUpAmount = formatThousands(topUpAmount);
  const formattedBalance = cardData ? formatIDR(cardData.b) : '';

  // --- Result modal props ---

  const getResultProps = (): ResultModalProps | null => {
    switch (resultType) {
      case 'register_success':
        return {
          variant: 'success',
          title: t('mbc_station_register_success_title'),
          subtitle: t('mbc_station_register_success_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: images.success,
        };
      case 'already_registered':
        return {
          variant: 'success',
          title: t('mbc_station_already_registered_title'),
          subtitle: t('mbc_station_already_registered_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: images.nfcSuccessHuman,
          detail: cardData
            ? { label: t('mbc_scout_card_balance_label'), value: formatIDR(cardData.b) }
            : undefined,
        };
      case 'not_registered':
        return {
          variant: 'error',
          title: t('mbc_station_not_registered_title'),
          subtitle: t('mbc_station_not_registered_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
        };
      case 'topup_success':
        return {
          variant: 'success',
          title: t('mbc_station_topup_result_success_title'),
          subtitle: t('mbc_station_topup_result_success_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: images.success,
          detail: { label: t('mbc_station_topup_result_nominal_label'), value: formatIDR(resultAmount) },
        };
      case 'topup_error':
        return {
          variant: 'error',
          title: t('mbc_station_topup_result_error_title'),
          subtitle: nfcOp.error ?? t('mbc_station_topup_result_error_subtitle'),
          buttonLabel: t('mbc_station_topup_result_retry_button'),
        };
      case 'nfc_error':
        return {
          variant: 'error',
          title: t('mbc_nfc_error_title'),
          subtitle: t(nfcOp.error as 'mbc_nfc_error_hardware_unavailable') ?? t('mbc_nfc_error_hardware_unavailable'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: images.nfcLoadDataFailed,
        };
      default:
        return null;
    }
  };

  const resultProps = getResultProps();

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
    isProcessing: nfcOp.isProcessing,
    error: nfcOp.error,
    onCloseNfcModal: nfcOp.onCloseNfcModal,
    onCancelScan: nfcOp.onCancelScan,
    scanImage: images.tapNfc,

    // Result modal
    resultProps,
    resultType,
    onCloseResult,

    // Actions
    onRegister,
    onStartTopUp,
    onTopUpNow,

    // Form state
    phase,
    cardData,
    topUpAmount,
    formattedTopUpAmount,
    isTopUpValid,
    selectedChip,
    quickAmounts: QUICK_AMOUNTS,
    onSelectChip,
    onCustomAmountChange,

    // Computed
    formattedBalance,
  };
};

export default StationController;
