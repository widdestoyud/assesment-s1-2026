import type { AwilixRegistry } from '@di/container';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
  BenefitType,
} from '@core/services/mbc/models';

export interface ScoutControllerInterface {
  nfcStatus: NfcStatus;
  cardData: CardData | null;
  isReading: boolean;
  error: string | null;
  benefitTypes: BenefitType[];
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
    | 'manageBenefitRegistryUseCase'
    | 'nfcService'
  >,
): ScoutControllerInterface => {
  const {
    useState,
    useEffect,
    useCallback,
    readCardUseCase,
    manageBenefitRegistryUseCase,
    nfcService,
  } = deps;

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [benefitTypes, setBenefitTypes] = useState<BenefitType[]>([]);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  // Load benefit types on mount (for resolving display names)
  useEffect(() => {
    const init = async () => {
      const isNfcAvailable = nfcService.isAvailable();
      setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');

      const types = await manageBenefitRegistryUseCase.getAll();
      setBenefitTypes(types);
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
    benefitTypes,
    nfcCapability,
    onReadCard,
  };
};

export default ScoutController;
