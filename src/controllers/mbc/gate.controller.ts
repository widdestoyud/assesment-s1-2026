import { useState } from 'react';
import type { AwilixRegistry } from '@di/container';
import type { TFunction } from 'i18next';
import type {
  CheckInResult,
  ChipTransferCapabilityStatus,
  ChipTransferStatus,
} from '@src/@core/models/mbc';
import { ChipTransferServiceError } from '@core/services/mbc/nfc.service';
import { useChipTransferCapability, useChipTransferOperation } from './hooks';
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

  // Chip transfer capability
  chipTransferCapability: ChipTransferCapabilityStatus;
  chipTransferAvailable: boolean;
  onNfcNoticeClose: () => void;
  chipTransferFailedImage: string;

  // Chip transfer scan modal
  showNfcModal: boolean;
  chipTransferStatus: ChipTransferStatus;
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
}

const GateController = (
  deps: Pick<
    AwilixRegistry,
    | 'useTranslation'
    | 'useNavigate'
    | 'checkInUseCase'
    | 'chipTransferService'
    | 'images'
  >,
): GateControllerInterface => {
  const {
    useTranslation,
    useNavigate,
    checkInUseCase,
    chipTransferService,
    images,
  } = deps;

  const navigate = useNavigate();

  const { t } = useTranslation();

  const { chipTransferCapability, chipTransferAvailable } = useChipTransferCapability({ chipTransferService });
  const chipOp = useChipTransferOperation();

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
    chipOp.setError(null);
    setLastResult(null);
    setResultType(null);
  };

  const handleChipTransferError = (err: unknown) => {
    chipOp.setChipTransferStatus('error');
    if (err instanceof Error && err.message === 'mbc_error_already_checked_in') {
      chipOp.setError(err.message);
      setResultType('already_checked_in');
    } else if (err instanceof ChipTransferServiceError) {
      chipOp.setError(err.messageKey);
      setResultType('nfc_error');
    } else {
      const message = err instanceof Error ? err.message : String(err);
      chipOp.setError(message);
      setResultType('nfc_error');
    }
  };

  const onCheckIn = async () => {
    setLastResult(null);
    setResultType(null);

    await chipOp.execute(async () => {
      try {
        const result = await checkInUseCase.execute();
        chipOp.setChipTransferStatus('success');
        setLastResult(result);
        setResultType('checkin_success');
      } catch (err: unknown) {
        handleChipTransferError(err);
      }
    });
  };

  const onSimulationCheckIn = async () => {
    // Validate timestamp is in the past
    const simTimestamp = new Date(`${simulationDate}T${simulationTime}:00`);
    if (simTimestamp.getTime() > Date.now()) {
      chipOp.setError(t('mbc_error_simulation_future_time'));
      return;
    }

    setLastResult(null);
    setResultType(null);

    await chipOp.execute(async () => {
      try {
        const result = await checkInUseCase.execute({
          simulationTimestamp: simTimestamp.toISOString(),
        });
        chipOp.setChipTransferStatus('success');
        setLastResult(result);
        setResultType('checkin_success');
      } catch (err: unknown) {
        handleChipTransferError(err);
      }
    });
  };

  const onCloseResult = () => {
    setLastResult(null);
    chipOp.setChipTransferStatus('idle');
    chipOp.setError(null);
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
    if (resultType === 'nfc_error' && chipOp.error) {
      return {
        variant: 'error',
        title: t('mbc_nfc_error_title'),
        subtitle: chipOp.error.startsWith('mbc_') ? String(t(chipOp.error as 'mbc_nfc_error_hardware_unavailable')) : chipOp.error,
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

    // Chip transfer capability
    chipTransferCapability,
    chipTransferAvailable,
    onNfcNoticeClose,
    chipTransferFailedImage: images.nfcFailed,

    // Chip transfer scan modal
    showNfcModal: chipOp.showNfcModal,
    chipTransferStatus: chipOp.chipTransferStatus,
    isProcessing: chipOp.isProcessing,
    error: chipOp.error,
    onCloseNfcModal: chipOp.onCloseNfcModal,
    onCancelScan: chipOp.onCancelScan,
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
  };
};

export default GateController;
