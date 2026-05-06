import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckOutResult,
  NfcCapabilityStatus,
  NfcStatus,
} from '@core/services/mbc/models';

export interface TerminalControllerInterface {
  nfcStatus: NfcStatus;
  lastResult: CheckOutResult | null;
  isProcessing: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  onCheckOut: () => Promise<void>;
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
  >,
): TerminalControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    checkOutUseCase,
    nfcService,
  } = deps;

  const { t } = useTranslation();

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckOutResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onCheckOut = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);

    try {
      const result = await checkOutUseCase.execute();
      setNfcStatus('success');
      setLastResult(result);
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    nfcCapability,
    onCheckOut,
    t,
  };
};

export default TerminalController;
