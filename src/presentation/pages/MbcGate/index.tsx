import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import SignalHero from '@components/SignalHero';
import SignalGateButton from '@components/SignalGateButton';
import SignalCard from '@components/SignalCard';
import SignalButton from '@components/SignalButton';
import SignalTab from '@components/SignalTab';
import SignalTypography from '@components/SignalTypography';
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
    <div className={styles['mbc-gate']}>
      <SignalHero title={String(t('mbc_gate_title'))} onBack={() => window.history.back()} />
      <main className={styles['mbc-gate__main']}>
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
          <SignalTab
            items={[
              { key: 'normal', label: String(t('mbc_gate_tab_normal')) },
              { key: 'simulation', label: String(t('mbc_gate_tab_simulation')) },
            ]}
            activeKey={ctrl.activeTab}
            onSelect={(key) => ctrl.onSetActiveTab(key as 'normal' | 'simulation')}
            activeClassName={styles['mbc-gate__tab--active']}
          />

          {/* Normal Tab — NFC Tap Circle */}
          {ctrl.activeTab === 'normal' && (
            <SignalCard className={styles['mbc-gate__nfc-section']}>
                <SignalGateButton
                  color="gate"
                  onClick={handleNormalCheckIn}
                  disabled={ctrl.isProcessing}
                  aria-label={t('mbc_gate_tap_card_label')}
                >
                  {t('mbc_gate_tap_card_label')}
                </SignalGateButton>
            </SignalCard>
          )}

          {/* Simulation Tab — Date/Time Picker */}
          {ctrl.activeTab === 'simulation' && (
            <SignalCard className={styles['mbc-gate__simulation-section']}>
                  <SignalTypography variant="body1-regular" as="p" className={styles['mbc-gate__simulation-title']}>
                    {t('mbc_gate_simulation_pick_time')}
                  </SignalTypography>
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

                {ctrl.error && ctrl.resultType !== 'nfc_error' && (
                  <div role="alert" className={styles['mbc-gate__error-alert']}>
                    {ctrl.error}
                  </div>
                )}

                <SignalButton
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={handleSimulationCheckIn}
                  disabled={ctrl.isProcessing}
                >
                  {t('mbc_gate_simulation_use_time')}
                </SignalButton>
            </SignalCard>
          )}
        </div>
      </main>
    </div>
  );
};

export default MbcGate;
