import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CardData,
  NfcCapabilityStatus,
  NfcStatus,
} from '@core/services/mbc/models';

export type StationPhase = 'home' | 'topup';
export type ResultType = 'register_success' | 'already_registered' | 'not_registered' | 'topup_success' | 'topup_error' | null;

export interface StationControllerInterface {
  phase: StationPhase;
  cardData: CardData | null;
  topUpAmount: string;
  setTopUpAmount: (value: string) => void;
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  resultType: ResultType;
  resultAmount: number;
  successImage: string;
  alreadyRegisteredImage: string;
  refreshImage: string;
  onRegister: () => Promise<void>;
  onStartTopUp: () => Promise<void>;
  onTopUp: (amount: number) => Promise<void>;
  onCancelScan: () => void;
  onCloseResult: () => void;
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
    | 'images'
  >,
): StationControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    validateCardUseCase,
    topUpBalanceUseCase,
    nfcService,
    images,
  } = deps;

  const { t } = useTranslation();

  const [phase, setPhase] = useState<StationPhase>('home');
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');
  const [resultType, setResultType] = useState<ResultType>(null);
  const [resultAmount, setResultAmount] = useState(0);

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  /**
   * Registration flow:
   * 1. Read card via NFC
   * 2. If card is blank/corrupt → format as new card → show "Registrasi Berhasil"
   * 3. If card is already valid → show "Kartu Sudah Terdaftar"
   */
  const onRegister = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setResultType(null);

    try {
      const result = await validateCardUseCase.execute();

      setNfcStatus('success');
      if (result.type === 'new') {
        setResultType('register_success');
      } else {
        setResultType('already_registered');
        setCardData({ v: 2, b: result.balance, s: 0, t: null, h: [] });
      }
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Top-up flow step 1: Read card to validate it's registered
   * If valid → go to topup phase
   * If not valid → show "Kartu Belum Terdaftar"
   */
  const onStartTopUp = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setResultType(null);

    try {
      const result = await validateCardUseCase.execute();
      setNfcStatus('success');

      if (result.type === 'new') {
        // Card was blank/corrupt — we just formatted it, but user wanted top-up
        // Show "not registered" since it was not previously a valid card
        setResultType('not_registered');
      } else {
        // Card is valid — proceed to top-up form
        setCardData({ v: 2, b: result.balance, s: 0, t: null, h: [] });
        setPhase('topup');
      }
    } catch (err: unknown) {
      setNfcStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Top-up flow step 2: Write new balance to card
   */
  const onTopUp = async (amount: number) => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setResultType(null);
    setResultAmount(amount);

    try {
      await topUpBalanceUseCase.execute({ amount });
      setNfcStatus('success');
      setResultType('topup_success');
    } catch (err: unknown) {
      setNfcStatus('error');
      setResultType('topup_error');
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const onCancelScan = () => {
    setIsProcessing(false);
    setNfcStatus('idle');
    setError(null);
  };

  const onCloseResult = () => {
    setResultType(null);
    setPhase('home');
    setTopUpAmount('');
    setError(null);
    setNfcStatus('idle');
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
    resultType,
    resultAmount,
    successImage: images.success,
    alreadyRegisteredImage: images.nfcSuccessHuman,
    refreshImage: images.tapNfc,
    onRegister,
    onStartTopUp,
    onTopUp,
    onCancelScan,
    onCloseResult,
    t,
  };
};

export default StationController;
