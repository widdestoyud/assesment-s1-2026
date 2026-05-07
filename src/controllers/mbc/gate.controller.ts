import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckInResult,
  NfcCapabilityStatus,
  NfcStatus,
} from '@core/services/mbc/models';

export interface GateControllerInterface {
  nfcStatus: NfcStatus;
  lastResult: CheckInResult | null;
  isProcessing: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  onCheckIn: () => Promise<void>;
  t: TFunction;
}

const GateController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'checkInUseCase'
    | 'nfcService'
  >,
): GateControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    checkInUseCase,
    nfcService,
  } = deps;

  const { t } = useTranslation();

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onCheckIn = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);

    try {
      const result = await checkInUseCase.execute();
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
    onCheckIn,
    t,
  };
};

export default GateController;
