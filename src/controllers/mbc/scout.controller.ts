import type { AwilixRegistry } from '@di/container';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
  ServiceType,
} from '@core/services/mbc/models';

export interface ScoutControllerInterface {
  nfcStatus: NfcStatus;
  cardData: CardData | null;
  isReading: boolean;
  error: string | null;
  serviceTypes: ServiceType[];
  nfcCapability: NfcCapabilityStatus;
  onReadCard: () => Promise<void>;
}

const ScoutController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useCallback'
    | 'readCardUseCase'
    | 'manageServiceRegistryUseCase'
    | 'nfcService'
  >,
): ScoutControllerInterface => {
  const {
    useState,
    useEffect,
    useCallback,
    readCardUseCase,
    manageServiceRegistryUseCase,
    nfcService,
  } = deps;

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  // Load service types on mount (for resolving display names)
  useEffect(() => {
    const init = async () => {
      const isNfcAvailable = nfcService.isAvailable();
      setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');

      const types = await manageServiceRegistryUseCase.getAll();
      setServiceTypes(types);
    };
    init();
  }, []);

  const onReadCard = useCallback(async () => {
    if (isReading) return;
    setIsReading(true);
    setNfcStatus('scanning');
    setError(null);
    setCardData(null);

    try {
      const data = await readCardUseCase.execute();
      setNfcStatus('success');
      setCardData(data);
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to read card');
    } finally {
      setIsReading(false);
    }
  }, [isReading]);

  return {
    nfcStatus,
    cardData,
    isReading,
    error,
    serviceTypes,
    nfcCapability,
    onReadCard,
  };
};

export default ScoutController;
