import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckOutResult,
  NfcCapabilityStatus,
  NfcStatus,
} from '@src/@core/models/mbc';
import { NfcServiceError } from '@core/services/mbc/nfc.service';

export type TerminalResultType = 'checkout_success' | 'nfc_error' | null;

export interface TerminalControllerInterface {
  nfcStatus: NfcStatus;
  lastResult: CheckOutResult | null;
  isProcessing: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  onCheckOut: () => Promise<void>;
  onCancelScan: () => void;
  onCloseResult: () => void;
  resultType: TerminalResultType;
  nfcErrorImage: string;
  scanImage: string;
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
      if (err instanceof NfcServiceError) {
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
    setNfcStatus('idle');
    setError(null);
    setResultType(null);
  };

  return {
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    nfcCapability,
    onCheckOut,
    onCancelScan,
    onCloseResult,
    resultType,
    nfcErrorImage: images.nfcLoadDataFailed,
    scanImage: images.tapNfc,
    t,
  };
};

export default TerminalController;
