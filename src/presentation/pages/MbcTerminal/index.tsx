import type { FC } from 'react';
import container from '@di/container';
import type { TerminalControllerInterface } from '@controllers/mbc/terminal.controller';
import PageHeader from '@components/PageHeader';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import BalanceDisplay from '@components/BalanceDisplay';
import { SignalCard, SignalGateButton, SignalTypography } from '@components/SignalReact';
import styles from './mbc-terminal.module.css';

const MbcTerminal: FC = () => {
  const ctrl = container.resolve<TerminalControllerInterface>('terminalController');
  const {
    t,
    pageTitle,
    pageSubtitle,
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
    onCheckOut,
    checkOutSuccessDisplay,
    insufficientBalanceDisplay,
  } = ctrl;

  const resultChildren = (
    <>
      {checkOutSuccessDisplay && (
        <div className={styles['mbc-terminal__result-section']}>
          <div className={styles['mbc-terminal__time-info']}>
            <div className={styles['mbc-terminal__time-row']}>
              <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_entry_time_label')}</span>
              <span className={styles['mbc-terminal__time-value']}>{checkOutSuccessDisplay.checkInTimeFormatted}</span>
            </div>
            <div className={styles['mbc-terminal__time-row']}>
              <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_exit_time_label')}</span>
              <span className={styles['mbc-terminal__time-value']}>{checkOutSuccessDisplay.checkOutTimeFormatted}</span>
            </div>
            <div className={styles['mbc-terminal__time-row']}>
              <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_duration_info_label')}</span>
              <span className={styles['mbc-terminal__time-value']}>{checkOutSuccessDisplay.duration}</span>
            </div>
            <div className={styles['mbc-terminal__time-row']}>
              <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_rate_label')}</span>
              <span className={styles['mbc-terminal__time-value']}>{checkOutSuccessDisplay.rateFormatted} / {checkOutSuccessDisplay.unitLabel}</span>
            </div>
            <div className={styles['mbc-terminal__time-row--total']}>
              <span className={styles['mbc-terminal__time-label--bold']}>{t('mbc_terminal_total_label')}</span>
              <span className={styles['mbc-terminal__time-value--bold']}>{checkOutSuccessDisplay.totalFormatted}</span>
            </div>
          </div>
          {!checkOutSuccessDisplay.isSimulation && (
            <BalanceDisplay formattedBalance={checkOutSuccessDisplay.remainingBalanceFormatted} t={t} />
          )}
        </div>
      )}
      {insufficientBalanceDisplay && (
        <div className={styles['mbc-terminal__result-section']}>
          <div className={styles['mbc-terminal__time-info']}>
            <div className={styles['mbc-terminal__time-row']}>
              <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_entry_time_label')}</span>
              <span className={styles['mbc-terminal__time-value']}>{insufficientBalanceDisplay.checkInTimeFormatted}</span>
            </div>
            <div className={styles['mbc-terminal__time-row']}>
              <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_exit_time_label')}</span>
              <span className={styles['mbc-terminal__time-value']}>{insufficientBalanceDisplay.checkOutTimeFormatted}</span>
            </div>
            <div className={styles['mbc-terminal__time-row']}>
              <span className={styles['mbc-terminal__time-label']}>{t('mbc_terminal_duration_info_label')}</span>
              <span className={styles['mbc-terminal__time-value']}>{insufficientBalanceDisplay.duration}</span>
            </div>
            <div className={styles['mbc-terminal__time-row--total']}>
              <span className={styles['mbc-terminal__time-label--bold']}>{t('mbc_terminal_total_label')}</span>
              <span className={styles['mbc-terminal__time-value--bold']}>{insufficientBalanceDisplay.totalFormatted}</span>
            </div>
          </div>
          <BalanceDisplay formattedBalance={insufficientBalanceDisplay.balanceFormatted} t={t} />
        </div>
      )}
    </>
  );

  return (
    <div className={styles['mbc-terminal']}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} onBack={onBack} />
      <main className={styles['mbc-terminal__main']}>
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
          >
            {resultChildren}
          </ResultStatusModal>
        )}

        <div className={styles['mbc-terminal__content']}>
          {/* NFC Tap Circle */}
          <SignalCard className={styles['mbc-terminal__nfc-section']}>
              <SignalGateButton
                color="terminal"
                onClick={onCheckOut}
                disabled={isProcessing}
                aria-label={t('mbc_terminal_tap_card_label')}
              >
                {t('mbc_terminal_tap_card_label')}
              </SignalGateButton>
          </SignalCard>

          {/* Guide Section */}
          <div className={styles['mbc-terminal__guide']}>
            <SignalTypography variant="body1-bold" as="p">
              {t('mbc_terminal_guide_title')}
            </SignalTypography>
            <SignalTypography variant="body2-regular" as="p" className={styles['mbc-terminal__guide-steps']}>
              {String(t('mbc_terminal_info')).split('\\n').join('\n')}
            </SignalTypography>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MbcTerminal;
