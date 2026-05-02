import type { AwilixRegistry } from '@di/container';
import type {
  NfcCapabilityStatus,
  NfcStatus,
  OperationResult,
  BenefitType,
} from '@core/services/mbc/models';

export interface RegistrationFormData {
  name: string;
  memberId: string;
}

export interface TopUpFormData {
  amount: number;
}

export interface StationControllerInterface {
  // Registration
  onRegister: (data: RegistrationFormData) => Promise<void>;
  // Top-up
  onTopUp: (data: TopUpFormData) => Promise<void>;
  // Benefit config
  benefitTypes: BenefitType[];
  onAddBenefitType: (benefitType: BenefitType) => Promise<void>;
  onEditBenefitType: (id: string, updates: Partial<Omit<BenefitType, 'id'>>) => Promise<void>;
  onRemoveBenefitType: (id: string) => Promise<void>;
  onRefreshBenefitTypes: () => Promise<void>;
  // NFC state
  nfcStatus: NfcStatus;
  lastResult: OperationResult | null;
  isProcessing: boolean;
  error: string | null;
  // Storage health
  storageWarning: string | null;
  // NFC capability
  nfcCapability: NfcCapabilityStatus;
}

const StationController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useCallback'
    | 'registerMemberUseCase'
    | 'topUpBalanceUseCase'
    | 'manageBenefitRegistryUseCase'
    | 'storageHealthService'
    | 'nfcService'
  >,
): StationControllerInterface => {
  const {
    useState,
    useEffect,
    useCallback,
    registerMemberUseCase,
    topUpBalanceUseCase,
    manageBenefitRegistryUseCase,
    storageHealthService,
    nfcService,
  } = deps;

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<OperationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const isNfcAvailable = nfcService.isAvailable();
      setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');

      // Check storage health
      const health = await storageHealthService.checkWriteCapacity();
      if (!health.canWrite && health.error) {
        setStorageWarning(health.error.message);
      }

      // Load benefit types
      const types = await manageBenefitRegistryUseCase.getAll();
      setBenefitTypes(types);
    };
    init();
  }, []);

  const onRegister = useCallback(async (data: RegistrationFormData) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);

    try {
      const result = await registerMemberUseCase.execute({
        member: { name: data.name, memberId: data.memberId },
      });
      setNfcStatus('success');
      setLastResult(result);
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const onTopUp = useCallback(async (data: TopUpFormData) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);

    try {
      const result = await topUpBalanceUseCase.execute({
        amount: data.amount,
      });
      setNfcStatus('success');
      setLastResult(result);
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const onRefreshBenefitTypes = useCallback(async () => {
    const types = await manageBenefitRegistryUseCase.getAll();
    setBenefitTypes(types);
  }, []);

  const onAddBenefitType = useCallback(async (benefitType: BenefitType) => {
    await manageBenefitRegistryUseCase.add(benefitType);
    await onRefreshBenefitTypes();
  }, []);

  const onEditBenefitType = useCallback(async (
    id: string,
    updates: Partial<Omit<BenefitType, 'id'>>,
  ) => {
    await manageBenefitRegistryUseCase.update(id, updates);
    await onRefreshBenefitTypes();
  }, []);

  const onRemoveBenefitType = useCallback(async (id: string) => {
    await manageBenefitRegistryUseCase.remove(id);
    await onRefreshBenefitTypes();
  }, []);

  return {
    onRegister,
    onTopUp,
    benefitTypes,
    onAddBenefitType,
    onEditBenefitType,
    onRemoveBenefitType,
    onRefreshBenefitTypes,
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    storageWarning,
    nfcCapability,
  };
};

export default StationController;
