import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
} from '@core/services/mbc/models';

export type StationPhase = 'tap' | 'topup' | 'balance';

export interface StationControllerInterface {
  phase: StationPhase;
  cardData: CardData | null;
  topUpAmount: string;
  setTopUpAmount: (value: string) => void;
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  onTapCard: () => Promise<void>;
  onTopUp: (amount: number) => Promise<void>;
  onGoToTopUp: () => void;
  onCancelScan: () => void;
  t: TFunction;
}

const StationController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'validateCardUseCase'
    | 'topUpBalanceUseCase'
    | 'nfcService'
  >,
): StationControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    validateCardUseCase,
    topUpBalanceUseCase,
    nfcService,
  } = deps;

  const { t } = useTranslation();

  const [phase, setPhase] = useState<StationPhase>('tap');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onTapCard = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);

    try {
      const result = await validateCardUseCase.execute();
      setNfcStatus('success');

      // Always go to top-up after successful validation
      setCardData({ v: 2, b: result.balance, s: 0, t: null });
      setPhase('topup');
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const onTopUp = async (amount: number) => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);

    try {
      const result = await topUpBalanceUseCase.execute({ amount });
      setNfcStatus('success');
      setCardData({ v: 2, b: result.balance, s: 0, t: null });
      setPhase('balance');
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const onGoToTopUp = () => {
    setPhase('topup');
    setTopUpAmount('');
    setError(null);
    setNfcStatus('idle');
  };

  const onCancelScan = () => {
    setIsProcessing(false);
    setNfcStatus('idle');
    setError(null);
  };

  return {
    phase,
    cardData,
    topUpAmount,
    setTopUpAmount,
    nfcStatus,
    isProcessing,
    error,
    nfcCapability,
    onTapCard,
    onTopUp,
    onGoToTopUp,
    onCancelScan,
    t,
  };
};

export default StationController;
