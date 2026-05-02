import type { AwilixRegistry } from '@di/container';
import type {
  CheckInResult,
  NfcCapabilityStatus,
  NfcStatus,
  BenefitType,
} from '@core/services/mbc/models';

export interface GateControllerInterface {
  selectedBenefitType: BenefitType | null;
  benefitTypes: BenefitType[];
  onSelectBenefitType: (id: string) => void;
  simulationMode: boolean;
  onToggleSimulation: () => void;
  simulationTimestamp: string | null;
  onSetSimulationTimestamp: (ts: string) => void;
  nfcStatus: NfcStatus;
  lastResult: CheckInResult | null;
  isProcessing: boolean;
  error: string | null;
  deviceId: string | null;
  nfcCapability: NfcCapabilityStatus;
  onCheckIn: () => Promise<void>;
}

const GateController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useCallback'
    | 'checkInUseCase'
    | 'manageBenefitRegistryUseCase'
    | 'deviceService'
    | 'nfcService'
  >,
): GateControllerInterface => {
  const {
    useState,
    useEffect,
    useCallback,
    checkInUseCase,
    manageBenefitRegistryUseCase,
    deviceService,
    nfcService,
  } = deps;

  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [selectedBenefitType, setSelectedBenefitType] = useState<BenefitType | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationTimestamp, setSimulationTimestamp] = useState<string | null>(null);
  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const isNfcAvailable = nfcService.isAvailable();
      setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');

      // Ensure Device_ID
      const { deviceId: id } = await deviceService.ensureDeviceId();
      setDeviceId(id);

      // Load benefit types
      const types = await manageBenefitRegistryUseCase.getAll();
      setBenefitTypes(types);

      // Auto-select if only one benefit type
      if (types.length === 1) {
        setSelectedBenefitType(types[0]);
      }
    };
    init();
  }, []);

  const onSelectBenefitType = useCallback((id: string) => {
    const found = benefitTypes.find((st) => st.id === id);
    setSelectedBenefitType(found ?? null);
  }, [benefitTypes]);

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
    if (isProcessing || !selectedBenefitType || !deviceId) return;
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);

    try {
      const result = await checkInUseCase.execute({
        benefitTypeId: selectedBenefitType.id,
        benefitTypeName: selectedBenefitType.displayName,
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
  }, [isProcessing, selectedBenefitType, deviceId, simulationMode, simulationTimestamp]);

  return {
    selectedBenefitType,
    benefitTypes,
    onSelectBenefitType,
    simulationMode,
    onToggleSimulation,
    simulationTimestamp,
    onSetSimulationTimestamp,
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    deviceId,
    nfcCapability,
    onCheckIn,
  };
};

export default GateController;
