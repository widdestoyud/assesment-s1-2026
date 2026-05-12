import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckOutResult,
  FeeResult,
  NfcCapabilityStatus,
  NfcStatus,
} from '@src/@core/models/mbc';
import { NfcServiceError } from '@core/services/mbc/nfc.service';
import { InsufficientBalanceError } from '@core/use_case/mbc/CheckOut';

export type TerminalResultType = 'checkout_success' | 'insufficient_balance' | 'not_checked_in' | 'nfc_error' | null;

export interface InsufficientBalanceData {
  checkInTime: string;
  checkOutTime: string;
  duration: string;
  feeBreakdown: FeeResult;
  balance: number;
}

export interface TerminalControllerInterface {
  nfcStatus: NfcStatus;
  lastResult: CheckOutResult | null;
  insufficientBalanceData: InsufficientBalanceData | null;
  isProcessing: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  onCheckOut: () => Promise<void>;
  onCancelScan: () => void;
  onCloseResult: () => void;
  resultType: TerminalResultType;
  nfcErrorImage: string;
  scanImage: string;
  successImage: string;
  warningImage: string;
  t: TFunction;
}

const TerminalController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'checkOutUseCase'
    | 'nfcService'
    | 'images'
  >,
): TerminalControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    checkOutUseCase,
    nfcService,
    images,
  } = deps;

  const { t } = useTranslation();

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckOutResult | null>(null);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<InsufficientBalanceData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');
  const [resultType, setResultType] = useState<TerminalResultType>(null);

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onCheckOut = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);
    setResultType(null);

    try {
      const result = await checkOutUseCase.execute();
      setNfcStatus('success');
      setLastResult(result);
      setResultType('checkout_success');
    } catch (err: unknown) {
      setNfcStatus('error');
      if (err instanceof InsufficientBalanceError) {
        setError(err.message);
        setInsufficientBalanceData({
          checkInTime: err.checkInTime,
          checkOutTime: err.checkOutTime,
          duration: err.duration,
          feeBreakdown: err.feeBreakdown,
          balance: err.balance,
        });
        setResultType('insufficient_balance');
      } else if (err instanceof Error && err.message === 'mbc_error_not_checked_in') {
        setError(err.message);
        setResultType('not_checked_in');
      } else if (err instanceof NfcServiceError) {
        setError(err.messageKey);
        setResultType('nfc_error');
      } else {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setResultType('nfc_error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const onCancelScan = () => {
    setIsProcessing(false);
    setNfcStatus('idle');
  };

  const onCloseResult = () => {
    setLastResult(null);
    setInsufficientBalanceData(null);
    setNfcStatus('idle');
    setError(null);
    setResultType(null);
  };

  return {
    nfcStatus,
    lastResult,
    insufficientBalanceData,
    isProcessing,
    error,
    nfcCapability,
    onCheckOut,
    onCancelScan,
    onCloseResult,
    resultType,
    nfcErrorImage: images.nfcLoadDataFailed,
    scanImage: images.tapNfc,
    successImage: images.success,
    warningImage: images.nfcWarningHuman,
    t,
  };
};

export default TerminalController;
