import type { AwilixRegistry } from '@di/container';
import type {
  CheckInResult,
  NfcStatus,
  ServiceType,
} from '@core/services/mbc/models';

export interface GateControllerInterface {
  selectedServiceType: ServiceType | null;
  serviceTypes: ServiceType[];
  onSelectServiceType: (id: string) => void;
  simulationMode: boolean;
  onToggleSimulation: () => void;
  simulationTimestamp: string | null;
  onSetSimulationTimestamp: (ts: string) => void;
  nfcStatus: NfcStatus;
  lastResult: CheckInResult | null;
  isProcessing: boolean;
  error: string | null;
  deviceId: string | null;
  onCheckIn: () => Promise<void>;
}

const GateController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useCallback'
    | 'checkInUseCase'
    | 'manageServiceRegistryUseCase'
    | 'deviceService'
  >,
): GateControllerInterface => {
  const {
    useState,
    useEffect,
    useCallback,
    checkInUseCase,
    manageServiceRegistryUseCase,
    deviceService,
  } = deps;

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationTimestamp, setSimulationTimestamp] = useState<string | null>(null);
  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Ensure Device_ID
      const { deviceId: id } = await deviceService.ensureDeviceId();
      setDeviceId(id);

      // Load service types
      const types = await manageServiceRegistryUseCase.getAll();
      setServiceTypes(types);

      // Auto-select if only one service type
      if (types.length === 1) {
        setSelectedServiceType(types[0]);
      }
    };
    init();
  }, []);

  const onSelectServiceType = useCallback((id: string) => {
    const found = serviceTypes.find((st) => st.id === id);
    setSelectedServiceType(found ?? null);
  }, [serviceTypes]);

  const onToggleSimulation = useCallback(() => {
    setSimulationMode((prev) => !prev);
    if (simulationMode) {
      setSimulationTimestamp(null);
    }
  }, [simulationMode]);

  const onSetSimulationTimestamp = useCallback((ts: string) => {
    setSimulationTimestamp(ts);
  }, []);

  const onCheckIn = useCallback(async () => {
    if (isProcessing || !selectedServiceType || !deviceId) return;
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);

    try {
      const result = await checkInUseCase.execute({
        serviceTypeId: selectedServiceType.id,
        serviceTypeName: selectedServiceType.displayName,
        deviceId,
        simulationTimestamp: simulationMode && simulationTimestamp
          ? simulationTimestamp
          : undefined,
      });
      setNfcStatus('success');
      setLastResult(result);
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : 'Check-in failed');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, selectedServiceType, deviceId, simulationMode, simulationTimestamp]);

  return {
    selectedServiceType,
    serviceTypes,
    onSelectServiceType,
    simulationMode,
    onToggleSimulation,
    simulationTimestamp,
    onSetSimulationTimestamp,
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    deviceId,
    onCheckIn,
  };
};

export default GateController;
