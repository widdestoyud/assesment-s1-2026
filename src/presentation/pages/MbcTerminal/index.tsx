import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import container from '@di/container';
import type { TerminalControllerInterface } from '@controllers/mbc/terminal.controller';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import PageHeader from '@components/PageHeader';
import BalanceDisplay from '@components/BalanceDisplay';
import { SignalCard, SignalGateButton } from '@components/SignalReact';
import { formatIDR } from '@utils/helpers/mbc.helper';
import images from '@infra/images';
import styles from './mbc-terminal.module.css';

const MbcTerminal: FC = () => {
  const ctrl = container.resolve<TerminalControllerInterface>('terminalController');
  const { t } = ctrl;
  const navigate = useNavigate();
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
          imageSrc: ctrl.successImage,
        };
      }
      return {
        variant: 'success' as const,
        title: t('mbc_terminal_checkout_success'),
        subtitle: '',
        buttonLabel: t('mbc_common_done_button'),
        imageSrc: ctrl.successImage,
      };
    }
    if (ctrl.resultType === 'insufficient_balance') {
      return {
        variant: 'error' as const,
        title: String(t('mbc_terminal_insufficient_balance_title')),
        subtitle: '',
        buttonLabel: String(t('mbc_terminal_insufficient_balance_button')),
        imageSrc: ctrl.warningImage,
      };
    }
    if (ctrl.resultType === 'not_checked_in') {
      return {
        variant: 'error' as const,
        title: String(t('mbc_terminal_not_checked_in_title')),
        subtitle: String(t('mbc_error_not_checked_in')),
        buttonLabel: String(t('mbc_common_close_button')),
        imageSrc: ctrl.nfcErrorImage,
      };
    }
    if (ctrl.resultType === 'nfc_error' && ctrl.error) {
      const isTranslationKey = ctrl.error.startsWith('mbc_');
      return {
        variant: 'error' as const,
        title: t('mbc_nfc_error_title'),
        subtitle: isTranslationKey ? String(t(ctrl.error as 'mbc_nfc_error_hardware_unavailable')) : ctrl.error,
        buttonLabel: t('mbc_common_done_button'),
        imageSrc: ctrl.nfcErrorImage,
      };
    }
    return null;
  };

  const resultProps = getResultProps();

  return (
    <div className={styles['mbc-terminal']}>
      <PageHeader title={String(t('mbc_terminal_title'))} onBack={() => window.history.back()} />
      <main className={styles['mbc-terminal__main']}>
        <NfcCapabilityNotice status={ctrl.nfcCapability} onClose={() => navigate({ to: '/' })} imageSrc={images.nfcFailed} t={t} />

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
          >
            {ctrl.resultType === 'checkout_success' && ctrl.lastResult && (
              <div className={styles['mbc-terminal__result-section']}>
                <div className={styles['mbc-terminal__time-info']}>
                  <div className={styles['mbc-terminal__time-row']}>
                    <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_entry_time_label')}</span>
                    <span className={styles['mbc-terminal__time-value']}>{new Date(ctrl.lastResult.checkInTime).toLocaleString('id-ID')}</span>
                  </div>
                  <div className={styles['mbc-terminal__time-row']}>
                    <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_exit_time_label')}</span>
                    <span className={styles['mbc-terminal__time-value']}>{new Date(ctrl.lastResult.checkOutTime).toLocaleString('id-ID')}</span>
                  </div>
                  <div className={styles['mbc-terminal__time-row']}>
                    <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_duration_info_label')}</span>
                    <span className={styles['mbc-terminal__time-value']}>{ctrl.lastResult.duration}</span>
                  </div>
                  <div className={styles['mbc-terminal__time-row']}>
                    <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_rate_label')}</span>
                    <span className={styles['mbc-terminal__time-value']}>{formatIDR(ctrl.lastResult.feeBreakdown.ratePerUnit)} / {ctrl.lastResult.feeBreakdown.unitLabel}</span>
                  </div>
                  <div className={styles['mbc-terminal__time-row--total']}>
                    <span className={styles['mbc-terminal__time-label--bold']}>{t('mbc_terminal_total_label')}</span>
                    <span className={styles['mbc-terminal__time-value--bold']}>{formatIDR(ctrl.lastResult.feeBreakdown.fee)}</span>
                  </div>
                </div>
                {!ctrl.lastResult.isSimulation && (
                  <BalanceDisplay formattedBalance={formatIDR(ctrl.lastResult.remainingBalance)} t={t} />
                )}
              </div>
            )}
            {ctrl.resultType === 'insufficient_balance' && ctrl.insufficientBalanceData && (
              <div className={styles['mbc-terminal__result-section']}>
                <div className={styles['mbc-terminal__time-info']}>
                  <div className={styles['mbc-terminal__time-row']}>
                    <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_entry_time_label')}</span>
                    <span className={styles['mbc-terminal__time-value']}>{new Date(ctrl.insufficientBalanceData.checkInTime).toLocaleString('id-ID')}</span>
                  </div>
                  <div className={styles['mbc-terminal__time-row']}>
                    <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_exit_time_label')}</span>
                    <span className={styles['mbc-terminal__time-value']}>{new Date(ctrl.insufficientBalanceData.checkOutTime).toLocaleString('id-ID')}</span>
                  </div>
                  <div className={styles['mbc-terminal__time-row']}>
                    <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_duration_info_label')}</span>
                    <span className={styles['mbc-terminal__time-value']}>{ctrl.insufficientBalanceData.duration}</span>
                  </div>
                  <div className={styles['mbc-terminal__time-row--total']}>
                    <span className={styles['mbc-terminal__time-label--bold']}>{t('mbc_terminal_total_label')}</span>
                    <span className={styles['mbc-terminal__time-value--bold']}>{formatIDR(ctrl.insufficientBalanceData.feeBreakdown.fee)}</span>
                  </div>
                </div>
                <BalanceDisplay formattedBalance={formatIDR(ctrl.insufficientBalanceData.balance)} t={t} />
              </div>
            )}
          </ResultStatusModal>
        )}

        <div className={styles['mbc-terminal__content']}>
          {/* NFC Tap Circle */}
          <SignalCard className={styles['mbc-terminal__nfc-section']}>
              <SignalGateButton
                color="terminal"
                onClick={handleCheckOut}
                disabled={ctrl.isProcessing}
                aria-label={t('mbc_terminal_tap_card_label')}
              >
                {t('mbc_terminal_tap_card_label')}
              </SignalGateButton>
          </SignalCard>

          {/* Check-Out Result moved into ResultStatusModal above */}
        </div>
      </main>
    </div>
  );
};

export default MbcTerminal;
