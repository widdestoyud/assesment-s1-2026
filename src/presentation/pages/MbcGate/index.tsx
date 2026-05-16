import type { FC } from 'react';
import container from '@di/container';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import PageHeader from '@components/PageHeader';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import { SignalButton, SignalCard, SignalGateButton, SignalTab, SignalTypography } from '@components/SignalReact';
import styles from './mbc-gate.module.css';

const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');
  const {
    t,
    pageTitle,
    onBack,
    chipTransferCapability,
    onNfcNoticeClose,
    chipTransferFailedImage,
    showNfcModal,
    chipTransferStatus,
    isProcessing,
    error,
    onCloseNfcModal,
    onCancelScan,
    scanImage,
    resultProps,
    resultType,
    onCloseResult,
    onCheckIn,
    onSimulationCheckIn,
    activeTab,
    onSetActiveTab,
    simulationDate,
    simulationTime,
    maxDate,
    onSetSimulationDate,
    onSetSimulationTime,
  } = ctrl;

  return (
    <div className={styles['mbc-gate']}>
      <PageHeader title={pageTitle} onBack={onBack} />
      <main className={styles['mbc-gate__main']}>
        <NfcCapabilityNotice status={chipTransferCapability} onClose={onNfcNoticeClose} imageSrc={chipTransferFailedImage} t={t} />

        <NfcScanModal
          isOpen={showNfcModal}
          chipTransferStatus={chipTransferStatus}
          isProcessing={isProcessing}
          error={error}
          onClose={onCloseNfcModal}
          onCancel={onCancelScan}
          scanImageSrc={scanImage}
          t={t}
        />

        {resultProps && (
          <ResultStatusModal
            isOpen={resultType !== null}
            variant={resultProps.variant}
            title={resultProps.title}
            subtitle={resultProps.subtitle}
            buttonLabel={resultProps.buttonLabel}
            imageSrc={resultProps.imageSrc}
            detail={resultProps.detail}
            onClose={onCloseResult}
          />
        )}

        <div className={styles['mbc-gate__content']}>
          {/* Tab Switcher */}
          <SignalTab
            items={[
              { key: 'normal', label: String(t('mbc_gate_tab_normal')) },
              { key: 'simulation', label: String(t('mbc_gate_tab_simulation')) },
            ]}
            activeKey={activeTab}
            onSelect={(key) => onSetActiveTab(key as 'normal' | 'simulation')}
            activeClassName={styles['mbc-gate__tab--active']}
          />

          {/* Normal Tab — NFC Tap Circle */}
          {activeTab === 'normal' && (
            <SignalCard className={styles['mbc-gate__nfc-section']}>
                <SignalGateButton
                  color="gate"
                  onClick={onCheckIn}
                  disabled={isProcessing}
                  aria-label={t('mbc_gate_tap_card_label')}
                >
                  {t('mbc_gate_tap_card_label')}
                </SignalGateButton>
            </SignalCard>
          )}

          {/* Simulation Tab — Date/Time Picker */}
          {activeTab === 'simulation' && (
            <SignalCard className={styles['mbc-gate__simulation-section']}>
                  <SignalTypography variant="body1-regular" as="p" className={styles['mbc-gate__simulation-title']}>
                    {t('mbc_gate_simulation_pick_time')}
                  </SignalTypography>
                  <div className={styles['mbc-gate__simulation-inputs']}>
                    <input
                      type="date"
                      value={simulationDate}
                      max={maxDate}
                      onChange={(e) => onSetSimulationDate(e.target.value)}
                      className={styles['mbc-gate__simulation-input']}
                      aria-label={t('mbc_gate_simulation_date_label')}
                    />
                    <input
                      type="time"
                      value={simulationTime}
                      onChange={(e) => onSetSimulationTime(e.target.value)}
                      className={styles['mbc-gate__simulation-input']}
                      aria-label={t('mbc_gate_simulation_time_label')}
                    />
                  </div>

                {error && resultType !== 'nfc_error' && (
                  <div role="alert" className={styles['mbc-gate__error-alert']}>
                    {error}
                  </div>
                )}

                <SignalButton
                  variant="primary"
                  size="xl"
                  fullWidth
                  onClick={onSimulationCheckIn}
                  disabled={isProcessing}
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
