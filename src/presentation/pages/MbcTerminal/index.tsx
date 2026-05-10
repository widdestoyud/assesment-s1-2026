import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { TerminalControllerInterface } from '@controllers/mbc/terminal.controller';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import PageLayout from '@components/PageLayout';
import FeeBreakdown from '@components/FeeBreakdown';
import BalanceDisplay from '@components/BalanceDisplay';
import styles from './mbc-terminal.module.css';

const MbcTerminal: FC = () => {
  const ctrl = container.resolve<TerminalControllerInterface>('terminalController');
  const { t } = ctrl;
  const [showNfcModal, setShowNfcModal] = useState(false);

  const handleCheckOut = async () => {
    setShowNfcModal(true);
    try {
      await ctrl.onCheckOut();
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

  const getResultProps = () => {
    if (ctrl.resultType === 'checkout_success' && ctrl.lastResult) {
      if (ctrl.lastResult.isSimulation) {
        return {
          variant: 'success' as const,
          title: t('mbc_terminal_checkout_success'),
          subtitle: t('mbc_terminal_simulation_notice'),
          buttonLabel: t('mbc_common_done_button'),
        };
      }
      return {
        variant: 'success' as const,
        title: t('mbc_terminal_checkout_success'),
        subtitle: `${t('mbc_terminal_duration_label')} ${ctrl.lastResult.duration}`,
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
      icon="💳"
      title={t('mbc_terminal_title')}
      subtitle={t('mbc_terminal_subtitle')}
      color="orange"
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

      <div className={styles['mbc-terminal__content']}>
        {/* NFC Tap Circle */}
        <div className={styles['mbc-terminal__nfc-section']}>
          <button
            type="button"
            onClick={handleCheckOut}
            disabled={ctrl.isProcessing}
            className={styles['mbc-terminal__nfc-circle']}
            aria-label={t('mbc_terminal_tap_card_label')}
          >
            <span className={styles['mbc-terminal__nfc-label']}>
              {t('mbc_terminal_tap_card_label')}
            </span>
          </button>
        </div>

        {/* Check-Out Result (inline, below circle) */}
        {ctrl.lastResult && ctrl.resultType === 'checkout_success' && (
          <div className={styles['mbc-terminal__result-section']}>
            {ctrl.lastResult.isSimulation && (
              <div className={styles['mbc-terminal__simulation-notice']}>
                {t('mbc_terminal_simulation_notice')}
              </div>
            )}
            <FeeBreakdown
              feeResult={ctrl.lastResult.feeBreakdown}
              benefitTypeName={t('mbc_terminal_parking_label')}
              t={t}
            />
            {!ctrl.lastResult.isSimulation && (
              <BalanceDisplay balance={ctrl.lastResult.remainingBalance} t={t} />
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default MbcTerminal;
