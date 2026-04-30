import type { AwilixRegistry } from '@di/container';
import type {
  NfcStatus,
  OperationResult,
  ServiceType,
  StorageError,
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
  // Service config
  serviceTypes: ServiceType[];
  onAddServiceType: (serviceType: ServiceType) => Promise<void>;
  onEditServiceType: (id: string, updates: Partial<Omit<ServiceType, 'id'>>) => Promise<void>;
  onRemoveServiceType: (id: string) => Promise<void>;
  onRefreshServiceTypes: () => Promise<void>;
  // NFC state
  nfcStatus: NfcStatus;
  lastResult: OperationResult | null;
  isProcessing: boolean;
  error: string | null;
  // Storage health
  storageWarning: string | null;
}

const StationController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useCallback'
    | 'registerMemberUseCase'
    | 'topUpBalanceUseCase'
    | 'manageServiceRegistryUseCase'
    | 'nfcService'
    | 'storageHealthService'
  >,
): StationControllerInterface => {
  const {
    useState,
    useEffect,
    useCallback,
    registerMemberUseCase,
    topUpBalanceUseCase,
    manageServiceRegistryUseCase,
    nfcService,
    storageHealthService,
  } = deps;

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<OperationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Check storage health
      const health = await storageHealthService.checkWriteCapacity();
      if (!health.canWrite && health.error) {
        setStorageWarning(health.error.message);
      }

      // Load service types
      const types = await manageServiceRegistryUseCase.getAll();
      setServiceTypes(types);
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

  const onRefreshServiceTypes = useCallback(async () => {
    const types = await manageServiceRegistryUseCase.getAll();
    setServiceTypes(types);
  }, []);

  const onAddServiceType = useCallback(async (serviceType: ServiceType) => {
    await manageServiceRegistryUseCase.add(serviceType);
    await onRefreshServiceTypes();
  }, []);

  const onEditServiceType = useCallback(async (
    id: string,
    updates: Partial<Omit<ServiceType, 'id'>>,
  ) => {
    await manageServiceRegistryUseCase.update(id, updates);
    await onRefreshServiceTypes();
  }, []);

  const onRemoveServiceType = useCallback(async (id: string) => {
    await manageServiceRegistryUseCase.remove(id);
    await onRefreshServiceTypes();
  }, []);

  return {
    onRegister,
    onTopUp,
    serviceTypes,
    onAddServiceType,
    onEditServiceType,
    onRemoveServiceType,
    onRefreshServiceTypes,
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    storageWarning,
  };
};

export default StationController;
