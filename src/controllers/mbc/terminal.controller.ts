import { useState } from 'react';
import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckOutResult,
  FeeResult,
  ChipTransferCapabilityStatus,
  ChipTransferStatus,
} from '@src/@core/models/mbc';
import { ChipTransferServiceError } from '@core/services/mbc/nfc.service';
import { InsufficientBalanceError } from '@core/use_case/mbc/CheckOut';
import { formatIDR } from '@utils/helpers/mbc.helper';
import { useChipTransferCapability, useChipTransferOperation } from './hooks';
import type { ResultModalProps } from './shared.types';

export type { ResultModalProps } from './shared.types';

export type TerminalResultType = 'checkout_success' | 'insufficient_balance' | 'not_checked_in' | 'nfc_error' | null;

export interface InsufficientBalanceData {
  checkInTime: string;
  checkOutTime: string;
  duration: string;
  feeBreakdown: FeeResult;
  balance: number;
}

export interface CheckOutSuccessDisplay {
  checkInTimeFormatted: string;
  checkOutTimeFormatted: string;
  duration: string;
  rateFormatted: string;
  unitLabel: string;
  totalFormatted: string;
  remainingBalanceFormatted: string;
  isSimulation: boolean;
}

export interface InsufficientBalanceDisplay {
  checkInTimeFormatted: string;
  checkOutTimeFormatted: string;
  duration: string;
  totalFormatted: string;
  balanceFormatted: string;
}

export interface TerminalControllerInterface {
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
  resultType: TerminalResultType;
  onCloseResult: () => void;

  // Actions — controller handles async + modal internally
  onCheckOut: () => void;

  // Result detail data (pre-formatted for rendering)
  checkOutSuccessDisplay: CheckOutSuccessDisplay | null;
  insufficientBalanceDisplay: InsufficientBalanceDisplay | null;
}

const TerminalController = (
  deps: Pick<
    AwilixRegistry,
    | 'useTranslation'
    | 'useNavigate'
    | 'checkOutUseCase'
    | 'chipTransferService'
    | 'images'
  >,
): TerminalControllerInterface => {
  const {
    useTranslation,
    useNavigate,
    checkOutUseCase,
    chipTransferService,
    images,
  } = deps;

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { chipTransferCapability, chipTransferAvailable } = useChipTransferCapability({ chipTransferService });
  const chipOp = useChipTransferOperation();

  const [lastResult, setLastResult] = useState<CheckOutResult | null>(null);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<InsufficientBalanceData | null>(null);
  const [resultType, setResultType] = useState<TerminalResultType>(null);

  const onCheckOut = async () => {
    setLastResult(null);
    setResultType(null);

    await chipOp.execute(async () => {
      try {
        const result = await checkOutUseCase.execute();
        chipOp.setChipTransferStatus('success');
        setLastResult(result);
        setResultType('checkout_success');
      } catch (err: unknown) {
        chipOp.setChipTransferStatus('error');
        if (err instanceof InsufficientBalanceError) {
          chipOp.setError(err.message);
          setInsufficientBalanceData({
            checkInTime: err.checkInTime,
            checkOutTime: err.checkOutTime,
            duration: err.duration,
            feeBreakdown: err.feeBreakdown,
            balance: err.balance,
          });
          setResultType('insufficient_balance');
        } else if (err instanceof Error && err.message === 'mbc_error_not_checked_in') {
          chipOp.setError(err.message);
          setResultType('not_checked_in');
        } else if (err instanceof ChipTransferServiceError) {
          chipOp.setError(err.messageKey);
          setResultType('nfc_error');
        } else {
          const message = err instanceof Error ? err.message : String(err);
          chipOp.setError(message);
          setResultType('nfc_error');
        }
      }
    });
  };

  const onCloseResult = () => {
    setLastResult(null);
    setInsufficientBalanceData(null);
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
  const pageTitle = String(t('mbc_terminal_title'));

  // Result modal props — pre-mapped, ready to spread
  const getResultProps = (): ResultModalProps | null => {
    if (resultType === 'checkout_success' && lastResult) {
      if (lastResult.isSimulation) {
        return {
          variant: 'success',
          title: t('mbc_terminal_checkout_success'),
          subtitle: t('mbc_terminal_simulation_notice'),
          buttonLabel: t('mbc_common_done_button'),
          imageSrc: images.success,
        };
      }
      return {
        variant: 'success',
        title: t('mbc_terminal_checkout_success'),
        subtitle: '',
        buttonLabel: t('mbc_common_done_button'),
        imageSrc: images.success,
      };
    }
    if (resultType === 'insufficient_balance') {
      return {
        variant: 'error',
        title: String(t('mbc_terminal_insufficient_balance_title')),
        subtitle: '',
        buttonLabel: String(t('mbc_terminal_insufficient_balance_button')),
        imageSrc: images.nfcWarningHuman,
      };
    }
    if (resultType === 'not_checked_in') {
      return {
        variant: 'error',
        title: String(t('mbc_terminal_not_checked_in_title')),
        subtitle: String(t('mbc_error_not_checked_in')),
        buttonLabel: String(t('mbc_common_close_button')),
        imageSrc: images.nfcLoadDataFailed,
      };
    }
    if (resultType === 'nfc_error' && chipOp.error) {
      const isTranslationKey = chipOp.error.startsWith('mbc_');
      return {
        variant: 'error',
        title: t('mbc_nfc_error_title'),
        subtitle: isTranslationKey ? String(t(chipOp.error as 'mbc_nfc_error_hardware_unavailable')) : chipOp.error,
        buttonLabel: t('mbc_common_done_button'),
        imageSrc: images.nfcLoadDataFailed,
      };
    }
    return null;
  };

  const resultProps = getResultProps();

  // Pre-formatted display data for checkout success
  const getCheckOutSuccessDisplay = (): CheckOutSuccessDisplay | null => {
    if (resultType !== 'checkout_success' || !lastResult) return null;
    return {
      checkInTimeFormatted: new Date(lastResult.checkInTime).toLocaleString('id-ID'),
      checkOutTimeFormatted: new Date(lastResult.checkOutTime).toLocaleString('id-ID'),
      duration: lastResult.duration,
      rateFormatted: formatIDR(lastResult.feeBreakdown.ratePerUnit),
      unitLabel: lastResult.feeBreakdown.unitLabel,
      totalFormatted: formatIDR(lastResult.feeBreakdown.fee),
      remainingBalanceFormatted: formatIDR(lastResult.remainingBalance),
      isSimulation: lastResult.isSimulation,
    };
  };

  // Pre-formatted display data for insufficient balance
  const getInsufficientBalanceDisplay = (): InsufficientBalanceDisplay | null => {
    if (resultType !== 'insufficient_balance' || !insufficientBalanceData) return null;
    return {
      checkInTimeFormatted: new Date(insufficientBalanceData.checkInTime).toLocaleString('id-ID'),
      checkOutTimeFormatted: new Date(insufficientBalanceData.checkOutTime).toLocaleString('id-ID'),
      duration: insufficientBalanceData.duration,
      totalFormatted: formatIDR(insufficientBalanceData.feeBreakdown.fee),
      balanceFormatted: formatIDR(insufficientBalanceData.balance),
    };
  };

  const checkOutSuccessDisplay = getCheckOutSuccessDisplay();
  const insufficientBalanceDisplay = getInsufficientBalanceDisplay();

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

    // Actions
    onCheckOut,

    // Result detail data
    checkOutSuccessDisplay,
    insufficientBalanceDisplay,
  };
};

export default TerminalController;
