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
  /** Whether a card needs registration confirmation from user */
  pendingRegister: boolean;
  onTapCard: () => Promise<void>;
  onTopUp: (amount: number) => Promise<void>;
  onGoToTopUp: () => void;
  onCancelScan: () => void;
  /** User confirms to register the incompatible/blank card */
  onConfirmRegister: () => void;
  /** User declines registration */
  onCancelRegister: () => void;
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
  const [pendingRegister, setPendingRegister] = useState(false);

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onTapCard = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setPendingRegister(false);

    try {
      const result = await validateCardUseCase.execute();
      setNfcStatus('success');

      // Always go to top-up after successful validation
      setCardData({ v: 2, b: result.balance, s: 0, t: null });
      setPhase('topup');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      // Incompatible, blank, or decryption-failed card → ask user for registration confirmation
      if (
        errorMessage === 'mbc_nfc_error_incompatible_card' ||
        errorMessage === 'mbc_nfc_error_blank_card' ||
        errorMessage === 'mbc_error_decryption_failed'
      ) {
        setNfcStatus('idle');
        setPendingRegister(true);
      } else {
        setNfcStatus('error');
        setError(errorMessage);
      }
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

  const onConfirmRegister = () => {
    setPendingRegister(false);
    setCardData({ v: 2, b: 0, s: 0, t: null });
    setPhase('topup');
  };

  const onCancelRegister = () => {
    setPendingRegister(false);
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
    pendingRegister,
    onTapCard,
    onTopUp,
    onGoToTopUp,
    onCancelScan,
    onConfirmRegister,
    onCancelRegister,
    t,
  };
};

export default StationController;
