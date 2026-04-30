import type { AwilixRegistry } from '@di/container';
import type {
  CheckOutResult,
  FeeResult,
  NfcStatus,
  ServiceType,
} from '@core/services/mbc/models';

export interface ManualCalcFormData {
  checkInTimestamp: string;
  serviceTypeId: string;
}

export interface TerminalControllerInterface {
  nfcStatus: NfcStatus;
  lastResult: CheckOutResult | null;
  isProcessing: boolean;
  error: string | null;
  // Manual calculation
  isManualMode: boolean;
  onToggleManualMode: () => void;
  onManualCalculate: (data: ManualCalcFormData) => Promise<void>;
  manualResult: FeeResult | null;
  serviceTypes: ServiceType[];
  // Actions
  onCheckOut: () => Promise<void>;
}

const TerminalController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useCallback'
    | 'checkOutUseCase'
    | 'manualCalculationUseCase'
    | 'manageServiceRegistryUseCase'
    | 'deviceService'
  >,
): TerminalControllerInterface => {
  const {
    useState,
    useEffect,
    useCallback,
    checkOutUseCase,
    manualCalculationUseCase,
    manageServiceRegistryUseCase,
    deviceService,
  } = deps;

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckOutResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualResult, setManualResult] = useState<FeeResult | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const { deviceId } = await deviceService.ensureDeviceId();
      setCurrentDeviceId(deviceId);

      const types = await manageServiceRegistryUseCase.getAll();
      setServiceTypes(types);
    };
    init();
  }, []);

  const onToggleManualMode = useCallback(() => {
    setIsManualMode((prev) => !prev);
    setManualResult(null);
  }, []);

  const onCheckOut = useCallback(async () => {
    if (isProcessing || !currentDeviceId) return;
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);

    try {
      const result = await checkOutUseCase.execute({
        currentDeviceId,
      });
      setNfcStatus('success');
      setLastResult(result);
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : 'Check-out failed');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, currentDeviceId]);

  const onManualCalculate = useCallback(async (data: ManualCalcFormData) => {
    setError(null);
    setManualResult(null);

    try {
      const result = await manualCalculationUseCase.execute({
        checkInTimestamp: data.checkInTimestamp,
        serviceTypeId: data.serviceTypeId,
      });
      setManualResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Manual calculation failed');
    }
  }, []);

  return {
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    isManualMode,
    onToggleManualMode,
    onManualCalculate,
    manualResult,
    serviceTypes,
    onCheckOut,
  };
};

export default TerminalController;
