import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
} from '@core/services/mbc/models';

export interface ScoutControllerInterface {
  nfcStatus: NfcStatus;
  cardData: CardData | null;
  isReading: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  onReadCard: () => Promise<void>;
  t: TFunction;
}

const ScoutController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'readCardUseCase'
    | 'nfcService'
  >,
): ScoutControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    readCardUseCase,
    nfcService,
  } = deps;

  const { t } = useTranslation();

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onReadCard = async () => {
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
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsReading(false);
    }
  };

  return {
    nfcStatus,
    cardData,
    isReading,
    error,
    nfcCapability,
    onReadCard,
    t,
  };
};

export default ScoutController;
