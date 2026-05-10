import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckInResult,
  NfcCapabilityStatus,
  NfcStatus,
} from '@core/services/mbc/models';
import { NfcServiceError } from '@core/services/mbc/nfc.service';

export type GateTab = 'normal' | 'simulation';

export type GateResultType = 'checkin_success' | 'nfc_error' | null;

export interface GateControllerInterface {
  nfcStatus: NfcStatus;
  lastResult: CheckInResult | null;
  isProcessing: boolean;
  error: string | null;
  nfcCapability: NfcCapabilityStatus;
  activeTab: GateTab;
  onSetActiveTab: (tab: GateTab) => void;
  simulationDate: string;
  simulationTime: string;
  onSetSimulationDate: (date: string) => void;
  onSetSimulationTime: (time: string) => void;
  onCheckIn: () => Promise<void>;
  onSimulationCheckIn: () => Promise<void>;
  onCancelScan: () => void;
  onCloseResult: () => void;
  resultType: GateResultType;
  nfcErrorImage: string;
  t: TFunction;
}

const GateController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'checkInUseCase'
    | 'nfcService'
    | 'images'
  >,
): GateControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    checkInUseCase,
    nfcService,
    images,
  } = deps;

  const { t } = useTranslation();

  const [nfcStatus, setNfcStatus] = useState<NfcStatus>('idle');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nfcCapability, setNfcCapability] = useState<NfcCapabilityStatus>('permission_pending');
  const [activeTab, setActiveTab] = useState<GateTab>('normal');
  const [resultType, setResultType] = useState<GateResultType>(null);

  // Default simulation time: 3 hours ago
  const getDefault3HoursAgo = () => {
    const now = new Date();
    now.setHours(now.getHours() - 3);
    return now;
  };

  const defaultDate = getDefault3HoursAgo();
  const [simulationDate, setSimulationDate] = useState<string>(
    defaultDate.toISOString().split('T')[0],
  );
  const [simulationTime, setSimulationTime] = useState<string>(
    defaultDate.toTimeString().slice(0, 5),
  );

  useEffect(() => {
    const isNfcAvailable = nfcService.isAvailable();
    setNfcCapability(isNfcAvailable ? 'supported' : 'unsupported');
  }, []);

  const onSetActiveTab = (tab: GateTab) => {
    setActiveTab(tab);
    setError(null);
    setLastResult(null);
    setResultType(null);
  };

  const handleNfcError = (err: unknown) => {
    setNfcStatus('error');
    if (err instanceof NfcServiceError) {
      // NFC hardware/API error — show error modal with illustration
      setError(err.messageKey);
      setResultType('nfc_error');
    } else {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setResultType('nfc_error');
    }
  };

  const onCheckIn = async () => {
    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);
    setResultType(null);

    try {
      const result = await checkInUseCase.execute();
      setNfcStatus('success');
      setLastResult(result);
      setResultType('checkin_success');
    } catch (err: unknown) {
      handleNfcError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onSimulationCheckIn = async () => {
    // Validate timestamp is in the past
    const simTimestamp = new Date(`${simulationDate}T${simulationTime}:00`);
    if (simTimestamp.getTime() > Date.now()) {
      setError(t('mbc_error_simulation_future_time'));
      return;
    }

    setIsProcessing(true);
    setNfcStatus('scanning');
    setError(null);
    setLastResult(null);
    setResultType(null);

    try {
      const result = await checkInUseCase.execute({
        simulationTimestamp: simTimestamp.toISOString(),
      });
      setNfcStatus('success');
      setLastResult(result);
      setResultType('checkin_success');
    } catch (err: unknown) {
      handleNfcError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onCancelScan = () => {
    setIsProcessing(false);
    setNfcStatus('idle');
  };

  const onCloseResult = () => {
    setLastResult(null);
    setNfcStatus('idle');
    setError(null);
    setResultType(null);
  };

  return {
    nfcStatus,
    lastResult,
    isProcessing,
    error,
    nfcCapability,
    activeTab,
    onSetActiveTab,
    simulationDate,
    simulationTime,
    onSetSimulationDate: setSimulationDate,
    onSetSimulationTime: setSimulationTime,
    onCheckIn,
    onSimulationCheckIn,
    onCancelScan,
    onCloseResult,
    resultType,
    nfcErrorImage: images.nfcLoadDataFailed,
    t,
  };
};

export default GateController;
