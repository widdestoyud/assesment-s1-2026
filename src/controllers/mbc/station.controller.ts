import { useState, useEffect } from 'react';
import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  ChipTransferCapabilityStatus,
  ChipTransferStatus,
} from '@src/@core/models/mbc';
import { ChipTransferServiceError } from '@core/services/mbc/nfc.service';
import { formatIDR, formatThousands, stripThousands } from '@utils/helpers/mbc.helper';
import config from '@src/infrastructure/config';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChipTransferCapability, useChipTransferOperation } from './hooks';
import type { ResultModalProps } from './shared.types';

export type { ResultModalProps } from './shared.types';

export type StationPhase = 'home' | 'topup';
export type ResultType = 'register_success' | 'already_registered' | 'not_registered' | 'topup_success' | 'topup_error' | 'nfc_error' | null;

export interface TopUpBalanceDisplay {
  formattedBalance: string;
  formattedPreviousBalance: string;
  formattedChangeAmount: string;
}

export interface StationControllerInterface {
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
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  scanImage: string;

  // Result modal — pre-mapped, ready to spread
  resultProps: ResultModalProps | null;
  resultType: ResultType;
  onCloseResult: () => void;
  topUpBalanceDisplay: TopUpBalanceDisplay | null;

  // Actions — controller handles async + modal internally
  onRegister: () => void;
  onStartTopUp: () => void;
  onTopUpNow: () => void;

  // Form state
  phase: StationPhase;
  cardData: CardData | null;
  formattedTopUpAmount: string;
  isTopUpValid: boolean;
  topUpError: string | null;
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
    | 'useTranslation'
    | 'useNavigate'
    | 'useForm'
    | 'validateCardUseCase'
    | 'topUpBalanceUseCase'
    | 'chipTransferService'
    | 'images'
  >,
): StationControllerInterface => {
  const {
    useTranslation,
    useNavigate,
    useForm,
    validateCardUseCase,
    topUpBalanceUseCase,
    chipTransferService,
    images,
  } = deps;

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { chipTransferCapability, chipTransferAvailable } = useChipTransferCapability({ chipTransferService });
  const chipOp = useChipTransferOperation();

  const [phase, setPhase] = useState<StationPhase>('home');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [resultType, setResultType] = useState<ResultType>(null);
  const [resultAmount, setResultAmount] = useState(0);
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);

  // --- Top-up form with React Hook Form + Zod ---
  const topUpSchema = z.object({
    amount: z
      .string()
      .min(1, String(t('mbc_station_topup_error_required')))
      .refine(
        (val) => {
          const num = Number.parseInt(val, 10);
          return !Number.isNaN(num) && num >= config.minTopUp;
        },
        { message: String(t('mbc_error_min_topup', { min: config.minTopUp.toLocaleString('id-ID') })) },
      )
      .refine(
        (val) => {
          const num = Number.parseInt(val, 10);
          const currentBalance = cardData?.b ?? 0;
          return !Number.isNaN(num) && (currentBalance + num) <= config.maxBalance;
        },
        {
          message: String(t('mbc_error_max_balance_exceeded', {
            max: config.maxBalance.toLocaleString('id-ID'),
            remaining: ((config.maxBalance - (cardData?.b ?? 0))).toLocaleString('id-ID'),
          })),
        },
      ),
  });

  const form = useForm<{ amount: string }>({
    resolver: zodResolver(topUpSchema),
    mode: 'onChange',
    defaultValues: { amount: '' },
  });

  const watchedAmount = form.watch('amount');
  const topUpError = form.formState.errors.amount?.message ?? null;
  const isTopUpValid = form.formState.isValid && watchedAmount.length > 0;

  // Re-validate when cardData changes (max balance depends on current balance)
  useEffect(() => {
    if (watchedAmount) {
      form.trigger('amount');
    }
  }, [cardData?.b]);

  // --- Chip transfer error handler ---
  const handleChipTransferError = (err: unknown) => {
    chipOp.setChipTransferStatus('error');
    if (err instanceof ChipTransferServiceError) {
      chipOp.setError(err.messageKey);
      setResultType('nfc_error');
    } else {
      chipOp.setError(err instanceof Error ? err.message : String(err));
    }
  };

  // --- Shared validate-card flow ---
  const executeValidateCard = async (handlers: {
    onNew: () => void;
    onExisting: (balance: number) => void;
  }) => {
    setResultType(null);
    await chipOp.execute(async () => {
      try {
        const result = await validateCardUseCase.execute();
        chipOp.setChipTransferStatus('success');
        if (result.type === 'new') {
          handlers.onNew();
        } else {
          setCardData({ v: 2, b: result.balance, s: 0, t: null, h: [] });
          handlers.onExisting(result.balance);
        }
      } catch (err: unknown) {
        handleChipTransferError(err);
      }
    });
  };

  // --- Actions ---

  const onRegister = () =>
    executeValidateCard({
      onNew: () => setResultType('register_success'),
      onExisting: () => setResultType('already_registered'),
    });

  const onStartTopUp = () =>
    executeValidateCard({
      onNew: () => setResultType('not_registered'),
      onExisting: () => setPhase('topup'),
    });

  const onTopUpNow = async () => {
    const amount = Number.parseInt(watchedAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) return;

    setResultType(null);
    setResultAmount(amount);
    setPreviousBalance(cardData?.b ?? 0);

    await chipOp.execute(async () => {
      try {
        await topUpBalanceUseCase.execute({ amount });
        chipOp.setChipTransferStatus('success');
        setResultType('topup_success');
      } catch (err: unknown) {
        chipOp.setChipTransferStatus('error');
        if (err instanceof ChipTransferServiceError) {
          chipOp.setError(err.messageKey);
          setResultType('nfc_error');
        } else {
          setResultType('topup_error');
          chipOp.setError(err instanceof Error ? err.message : String(err));
        }
      }
    });
  };

  // --- Form handlers ---

  const onSelectChip = (amount: number) => {
    setSelectedChip(amount);
    form.setValue('amount', String(amount), { shouldValidate: true });
  };

  const onCustomAmountChange = (value: string) => {
    const raw = stripThousands(value).replace(/\D/g, '');
    setSelectedChip(null);
    form.setValue('amount', raw, { shouldValidate: true });
  };

  // --- Modal handlers ---

  const onCloseResult = () => {
    setResultType(null);
    setPhase('home');
    form.reset();
    chipOp.setError(null);
    chipOp.setChipTransferStatus('idle');
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
  const formattedTopUpAmount = formatThousands(watchedAmount);
  const formattedBalance = cardData ? formatIDR(cardData.b) : '';

  // --- Top-up balance display (shown on success) ---
  const topUpBalanceDisplay: TopUpBalanceDisplay | null =
    resultType === 'topup_success' && previousBalance !== null
      ? {
          formattedBalance: formatIDR(previousBalance + resultAmount),
          formattedPreviousBalance: formatIDR(previousBalance),
          formattedChangeAmount: formatIDR(resultAmount),
        }
      : null;

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
          subtitle: chipOp.error ?? t('mbc_station_topup_result_error_subtitle'),
          buttonLabel: t('mbc_station_topup_result_retry_button'),
        };
      case 'nfc_error':
        return {
          variant: 'error',
          title: t('mbc_nfc_error_title'),
          subtitle: t(chipOp.error as 'mbc_nfc_error_hardware_unavailable') ?? t('mbc_nfc_error_hardware_unavailable'),
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

    // Chip transfer capability
    chipTransferCapability,
    chipTransferAvailable,
    onNfcNoticeClose,
    chipTransferFailedImage: images.nfcFailed,

    // Chip transfer scan modal
    showNfcModal: chipOp.showNfcModal,
    chipTransferStatus: chipOp.chipTransferStatus,
    isProcessing: chipOp.isProcessing,
    error: chipOp.error,
    onCloseNfcModal: chipOp.onCloseNfcModal,
    onCancelScan: chipOp.onCancelScan,
    scanImage: images.tapNfc,

    // Result modal
    resultProps,
    resultType,
    onCloseResult,
    topUpBalanceDisplay,

    // Actions
    onRegister,
    onStartTopUp,
    onTopUpNow,

    // Form state
    phase,
    cardData,
    formattedTopUpAmount,
    isTopUpValid,
    topUpError,
    selectedChip,
    quickAmounts: QUICK_AMOUNTS,
    onSelectChip,
    onCustomAmountChange,

    // Computed
    formattedBalance,
  };
};

export default StationController;
