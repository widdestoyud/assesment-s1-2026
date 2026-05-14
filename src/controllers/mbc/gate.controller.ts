import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckInResult,
  NfcCapabilityStatus,
  NfcStatus,
} from '@src/@core/models/mbc';
import { NfcServiceError } from '@core/services/mbc/nfc.service';
import { useNfcCapability, useNfcOperation } from './hooks';
import type { ResultModalProps } from './shared.types';

export type { ResultModalProps } from './shared.types';

export type GateTab = 'normal' | 'simulation';

export type GateResultType = 'checkin_success' | 'already_checked_in' | 'nfc_error' | null;

export interface GateControllerInterface {
  // Translation
  t: TFunction;

  // Page metadata
  pageTitle: string;
  onBack: () => void;

  // NFC capability
  nfcCapability: NfcCapabilityStatus;
  nfcAvailable: boolean;
  onNfcNoticeClose: () => void;
  nfcFailedImage: string;

  // NFC scan modal
  showNfcModal: boolean;
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  scanImage: string;

  // Result modal — pre-mapped, ready to spread
  resultProps: ResultModalProps | null;
  resultType: GateResultType;
  onCloseResult: () => void;

  // Actions — controller handles async + modal internally
  onCheckIn: () => void;
  onSimulationCheckIn: () => void;

  // Form state
  activeTab: GateTab;
  onSetActiveTab: (tab: GateTab) => void;
  simulationDate: string;
  simulationTime: string;
  maxDate: string;
  onSetSimulationDate: (date: string) => void;
  onSetSimulationTime: (time: string) => void;

  // Legacy (kept for compatibility)
  lastResult: CheckInResult | null;
  nfcErrorImage: string;
  successImage: string;
}

const GateController = (
  deps: Pick<
    AwilixRegistry,
    | 'useState'
    | 'useEffect'
    | 'useTranslation'
    | 'useNavigate'
    | 'checkInUseCase'
    | 'nfcService'
    | 'images'
  >,
): GateControllerInterface => {
  const {
    useState,
    useEffect,
    useTranslation,
    useNavigate,
    checkInUseCase,
    nfcService,
    images,
  } = deps;

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { nfcCapability, nfcAvailable } = useNfcCapability({ useState, useEffect, nfcService });
  const nfcOp = useNfcOperation({ useState });

  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
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

  const onSetActiveTab = (tab: GateTab) => {
    setActiveTab(tab);
    nfcOp.setError(null);
    setLastResult(null);
    setResultType(null);
  };

  const handleNfcError = (err: unknown) => {
    nfcOp.setNfcStatus('error');
    if (err instanceof Error && err.message === 'mbc_error_already_checked_in') {
      nfcOp.setError(err.message);
      setResultType('already_checked_in');
    } else if (err instanceof NfcServiceError) {
      nfcOp.setError(err.messageKey);
      setResultType('nfc_error');
    } else {
      const message = err instanceof Error ? err.message : String(err);
      nfcOp.setError(message);
      setResultType('nfc_error');
    }
  };

  const onCheckIn = async () => {
    setLastResult(null);
    setResultType(null);

    await nfcOp.execute(async () => {
      try {
        const result = await checkInUseCase.execute();
        nfcOp.setNfcStatus('success');
        setLastResult(result);
        setResultType('checkin_success');
      } catch (err: unknown) {
        handleNfcError(err);
      }
    });
  };

  const onSimulationCheckIn = async () => {
    // Validate timestamp is in the past
    const simTimestamp = new Date(`${simulationDate}T${simulationTime}:00`);
    if (simTimestamp.getTime() > Date.now()) {
      nfcOp.setError(t('mbc_error_simulation_future_time'));
      return;
    }

    setLastResult(null);
    setResultType(null);

    await nfcOp.execute(async () => {
      try {
        const result = await checkInUseCase.execute({
          simulationTimestamp: simTimestamp.toISOString(),
        });
        nfcOp.setNfcStatus('success');
        setLastResult(result);
        setResultType('checkin_success');
      } catch (err: unknown) {
        handleNfcError(err);
      }
    });
  };

  const onCloseResult = () => {
    setLastResult(null);
    nfcOp.setNfcStatus('idle');
    nfcOp.setError(null);
    setResultType(null);
  };

  const onBack = () => {
    window.history.back();
  };

  const onNfcNoticeClose = () => {
    navigate({ to: '/' });
  };

  // Computed values
  const maxDate = new Date().toISOString().split('T')[0];
  const pageTitle = String(t('mbc_gate_title'));

  // Result modal props — pre-mapped, ready to spread
  const getResultProps = (): ResultModalProps | null => {
    if (resultType === 'checkin_success' && lastResult) {
      if (lastResult.isSimulation) {
        return {
          variant: 'success',
          title: t('mbc_gate_checkin_simulation_success'),
          subtitle: `${t('mbc_common_entry_time_label')} ${new Date(lastResult.checkInTime).toLocaleString('id-ID')}`,
          buttonLabel: t('mbc_common_done_button'),
          imageSrc: images.success,
        };
      }
      return {
        variant: 'success',
        title: t('mbc_gate_checkin_success'),
        subtitle: `${t('mbc_common_entry_time_label')} ${new Date(lastResult.checkInTime).toLocaleString('id-ID')}`,
        buttonLabel: t('mbc_common_done_button'),
        imageSrc: images.success,
      };
    }
    if (resultType === 'already_checked_in') {
      return {
        variant: 'error',
        title: t('mbc_gate_already_checked_in_title'),
        subtitle: t('mbc_error_already_checked_in'),
        buttonLabel: t('mbc_common_close_button'),
        imageSrc: images.nfcLoadDataFailed,
      };
    }
    if (resultType === 'nfc_error' && nfcOp.error) {
      return {
        variant: 'error',
        title: t('mbc_nfc_error_title'),
        subtitle: nfcOp.error.startsWith('mbc_') ? String(t(nfcOp.error as 'mbc_nfc_error_hardware_unavailable')) : nfcOp.error,
        buttonLabel: t('mbc_common_done_button'),
        imageSrc: images.nfcLoadDataFailed,
      };
    }
    return null;
  };

  const resultProps = getResultProps();

  return {
    // Translation
    t,

    // Page metadata
    pageTitle,
    onBack,

    // NFC capability
    nfcCapability,
    nfcAvailable,
    onNfcNoticeClose,
    nfcFailedImage: images.nfcFailed,

    // NFC scan modal
    showNfcModal: nfcOp.showNfcModal,
    nfcStatus: nfcOp.nfcStatus,
    isProcessing: nfcOp.isProcessing,
    error: nfcOp.error,
    onCloseNfcModal: nfcOp.onCloseNfcModal,
    onCancelScan: nfcOp.onCancelScan,
    scanImage: images.tapNfc,

    // Result modal
    resultProps,
    resultType,
    onCloseResult,

    // Actions
    onCheckIn,
    onSimulationCheckIn,

    // Form state
    activeTab,
    onSetActiveTab,
    simulationDate,
    simulationTime,
    maxDate,
    onSetSimulationDate: setSimulationDate,
    onSetSimulationTime: setSimulationTime,

    // Legacy (kept for compatibility)
    lastResult,
    nfcErrorImage: images.nfcLoadDataFailed,
    successImage: images.success,
  };
};

export default GateController;
