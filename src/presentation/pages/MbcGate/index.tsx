import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import PageLayout from '@components/PageLayout';
import styles from './mbc-gate.module.css';

const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');
  const { t } = ctrl;
  const [showNfcModal, setShowNfcModal] = useState(false);

  const handleNormalCheckIn = async () => {
    setShowNfcModal(true);
    try {
      await ctrl.onCheckIn();
    } finally {
      setShowNfcModal(false);
    }
  };

  const handleSimulationCheckIn = async () => {
    // Validate first before showing modal
    const simTimestamp = new Date(`${ctrl.simulationDate}T${ctrl.simulationTime}:00`);
    if (simTimestamp.getTime() > Date.now()) {
      ctrl.onSimulationCheckIn(); // Will set error internally
      return;
    }
    setShowNfcModal(true);
    try {
      await ctrl.onSimulationCheckIn();
    } finally {
      setShowNfcModal(false);
    }
  };

  const handleCloseNfcModal = () => {
    ctrl.onCancelScan();
    setShowNfcModal(false);
  };

  const handleCloseResult = () => {
    ctrl.onCloseResult();
  };

  // Compute max date/time for simulation (cannot exceed now)
  const now = new Date();
  const maxDate = now.toISOString().split('T')[0];

  const getResultProps = () => {
    if (ctrl.resultType === 'checkin_success' && ctrl.lastResult) {
      if (ctrl.lastResult.isSimulation) {
        return {
          variant: 'success' as const,
          title: t('mbc_gate_checkin_simulation_success'),
          subtitle: `${t('mbc_gate_entry_time_label')} ${new Date(ctrl.lastResult.checkInTime).toLocaleString('id-ID')}`,
          buttonLabel: t('mbc_common_done_button'),
        };
      }
      return {
        variant: 'success' as const,
        title: t('mbc_gate_checkin_success'),
        subtitle: `${t('mbc_gate_entry_time_label')} ${new Date(ctrl.lastResult.checkInTime).toLocaleString('id-ID')}`,
        buttonLabel: t('mbc_common_done_button'),
      };
    }
    if (ctrl.resultType === 'nfc_error' && ctrl.error) {
      return {
        variant: 'error' as const,
        title: t('mbc_nfc_error_title'),
        subtitle: t(ctrl.error as 'mbc_nfc_error_hardware_unavailable'),
        buttonLabel: t('mbc_common_done_button'),
        imageSrc: ctrl.nfcErrorImage,
      };
    }
    return null;
  };

  const resultProps = getResultProps();

  return (
    <PageLayout
      icon="🚪"
      title={t('mbc_gate_title')}
      subtitle={t('mbc_gate_subtitle')}
      color="green"
    >
      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {/* NFC Scan Modal */}
      <NfcScanModal
        isOpen={showNfcModal}
        nfcStatus={ctrl.nfcStatus}
        isProcessing={ctrl.isProcessing}
        error={ctrl.error}
        onClose={handleCloseNfcModal}
        onCancel={ctrl.onCancelScan}
        scanImageSrc={ctrl.scanImage}
        t={t}
      />

      {/* Result Modal (success or NFC error) */}
      {resultProps && (
        <ResultStatusModal
          isOpen={ctrl.resultType !== null}
          variant={resultProps.variant}
          title={resultProps.title}
          subtitle={resultProps.subtitle}
          buttonLabel={resultProps.buttonLabel}
          imageSrc={resultProps.imageSrc}
          onClose={handleCloseResult}
          t={t}
        />
      )}

      <div className={styles['mbc-gate__content']}>
        {/* Tab Switcher */}
        <div className={styles['mbc-gate__tab-container']}>
          <button
            type="button"
            onClick={() => ctrl.onSetActiveTab('normal')}
            className={`${styles['mbc-gate__tab']} ${ctrl.activeTab === 'normal' ? styles['mbc-gate__tab--active'] : ''}`}
          >
            {t('mbc_gate_tab_normal')}
          </button>
          <span className={styles['mbc-gate__tab-divider']} aria-hidden="true" />
          <button
            type="button"
            onClick={() => ctrl.onSetActiveTab('simulation')}
            className={`${styles['mbc-gate__tab']} ${ctrl.activeTab === 'simulation' ? styles['mbc-gate__tab--active'] : ''}`}
          >
            {t('mbc_gate_tab_simulation')}
          </button>
        </div>

        {/* Normal Tab — NFC Tap Circle */}
        {ctrl.activeTab === 'normal' && (
          <div className={styles['mbc-gate__nfc-section']}>
            <button
              type="button"
              onClick={handleNormalCheckIn}
              disabled={ctrl.isProcessing}
              className={styles['mbc-gate__nfc-circle']}
              aria-label={t('mbc_gate_tap_card_label')}
            >
              <span className={styles['mbc-gate__nfc-label']}>
                {t('mbc_gate_tap_card_label')}
              </span>
            </button>
          </div>
        )}

        {/* Simulation Tab — Date/Time Picker */}
        {ctrl.activeTab === 'simulation' && (
          <div className={styles['mbc-gate__simulation-section']}>
            <div className={styles['mbc-gate__simulation-card']}>
              <p className={styles['mbc-gate__simulation-title']}>
                {t('mbc_gate_simulation_pick_time')}
              </p>
              <div className={styles['mbc-gate__simulation-inputs']}>
                <input
                  type="date"
                  value={ctrl.simulationDate}
                  max={maxDate}
                  onChange={(e) => ctrl.onSetSimulationDate(e.target.value)}
                  className={styles['mbc-gate__simulation-input']}
                  aria-label={t('mbc_gate_simulation_date_label')}
                />
                <input
                  type="time"
                  value={ctrl.simulationTime}
                  onChange={(e) => ctrl.onSetSimulationTime(e.target.value)}
                  className={styles['mbc-gate__simulation-input']}
                  aria-label={t('mbc_gate_simulation_time_label')}
                />
              </div>
            </div>

            {ctrl.error && ctrl.resultType !== 'nfc_error' && (
              <div role="alert" className={styles['mbc-gate__error-alert']}>
                {ctrl.error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSimulationCheckIn}
              disabled={ctrl.isProcessing}
              className={styles['mbc-gate__simulation-button']}
            >
              {t('mbc_gate_simulation_use_time')}
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MbcGate;
