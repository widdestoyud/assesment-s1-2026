import type { FC } from 'react';
import container from '@di/container';
import type { ScoutControllerInterface } from '@controllers/mbc/scout.controller';
import PageHeader from '@components/PageHeader';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import { SignalCard, SignalGateButton } from '@components/SignalReact';
import styles from './mbc-scout.module.css';

const MbcScout: FC = () => {
  const ctrl = container.resolve<ScoutControllerInterface>('scoutController');
  const {
    t,
    pageTitle,
    onBack,
    nfcCapability,
    onNfcNoticeClose,
    nfcFailedImage,
    showNfcModal,
    nfcStatus,
    isReading,
    error,
    onCloseNfcModal,
    scanImage,
    resultProps,
    resultType,
    onCloseResult,
    onReadCard,
    nfcAvailable,
    formattedBalance,
    formattedTransactions,
    checkinStatusLabel,
    formattedEntryTime,
  } = ctrl;

  const resultChildren = resultType === 'read_success' ? (
    <div className={styles['mbc-scout__modal-content']}>
      <SignalCard>
        <div className={styles['mbc-scout__info-grid']}>
          <div className={styles['mbc-scout__info-balance']}>
            <span className={styles['mbc-scout__info-label']}>{t('mbc_scout_card_balance_label')}</span>
            <span className={styles['mbc-scout__info-balance-value']}>{formattedBalance}</span>
          </div>
          <div className={styles['mbc-scout__info-status']}>
            <span className={styles['mbc-scout__info-label']}>{t('mbc_scout_checkin_status_label')}</span>
            <span className={styles['mbc-scout__info-status-value']}>{checkinStatusLabel}</span>
            {formattedEntryTime && (
              <span className={styles['mbc-scout__info-timestamp']}>
                {formattedEntryTime}
              </span>
            )}
          </div>
        </div>
      </SignalCard>

      <SignalCard>
        <div className={styles['mbc-scout__history-section']}>
          <p className={styles['mbc-scout__history-title']}>
            {t('mbc_scout_history_title')}
          </p>
          {formattedTransactions.length === 0 ? (
            <p className={styles['mbc-scout__history-empty']}>
              {t('mbc_scout_history_empty')}
            </p>
          ) : (
            <div className={styles['mbc-scout__history-list']}>
              {formattedTransactions.map((tx, idx) => (
                <div key={idx} className={styles['mbc-scout__history-item']}>
                  <div className={styles['mbc-scout__history-left']}>
                    <span className={styles['mbc-scout__history-type']}>
                      {tx.label}
                    </span>
                    <span className={styles['mbc-scout__history-time']}>
                      {tx.time}
                    </span>
                  </div>
                  {tx.isCheckin ? (
                    <span className={styles['mbc-scout__history-amount']}>—</span>
                  ) : (
                    <span className={`${styles['mbc-scout__history-amount']} ${tx.isPositive ? styles['mbc-scout__history-amount--positive'] : styles['mbc-scout__history-amount--negative']}`}>
                      {tx.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SignalCard>
    </div>
  ) : undefined;

  return (
    <div className={styles['mbc-scout']}>
      <PageHeader title={pageTitle} onBack={onBack} />
      <main className={styles['mbc-scout__main']}>
        <NfcCapabilityNotice status={nfcCapability} onClose={onNfcNoticeClose} imageSrc={nfcFailedImage} t={t} />

        <NfcScanModal
          isOpen={showNfcModal}
          nfcStatus={nfcStatus}
          isProcessing={isReading}
          error={error}
          onClose={onCloseNfcModal}
          onCancel={onCloseNfcModal}
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
            hideHeader={resultType === 'read_success'}
            onClose={onCloseResult}
          >
            {resultChildren}
          </ResultStatusModal>
        )}

        {/* Main Content — Tap Button */}
        {nfcAvailable && (
          <div className={styles['mbc-scout__content']}>
            <SignalCard className={styles['mbc-scout__nfc-section']}>
              <SignalGateButton
                color="scout"
                onClick={onReadCard}
                disabled={isReading}
                aria-label={String(t('mbc_scout_read_button'))}
              >
                {t('mbc_scout_read_button')}
              </SignalGateButton>
            </SignalCard>
          </div>
        )}
      </main>
    </div>
  );
};

export default MbcScout;
