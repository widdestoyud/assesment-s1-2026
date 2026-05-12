import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { ScoutControllerInterface } from '@controllers/mbc/scout.controller';
import type { TransactionType } from '@src/@core/models/mbc';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import PageHeader from '@components/PageHeader';
import { SignalCard, SignalGateButton } from '@components/SignalReact';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './mbc-scout.module.css';

const MbcScout: FC = () => {
  const ctrl = container.resolve<ScoutControllerInterface>('scoutController');
  const { t } = ctrl;
  const [showNfcModal, setShowNfcModal] = useState(false);

  const getTransactionLabel = (tp: TransactionType): string => {
    switch (tp) {
      case 'tu': return String(t('mbc_scout_history_topup'));
      case 'ci': return String(t('mbc_scout_history_checkin'));
      case 'co': return String(t('mbc_scout_history_checkout'));
    }
  };

  const handleReadCard = async () => {
    setShowNfcModal(true);
    try {
      await ctrl.onReadCard();
    } finally {
      setShowNfcModal(false);
    }
  };

  const handleCloseNfcModal = () => {
    setShowNfcModal(false);
  };

  const handleCloseResult = () => {
    ctrl.onCloseResult();
  };

  const getResultProps = () => {
    if (ctrl.resultType === 'read_success' && ctrl.cardData) {
      return {
        variant: 'success' as const,
        title: String(t('mbc_scout_read_success_title')),
        subtitle: String(t('mbc_scout_read_success_subtitle')),
        buttonLabel: String(t('mbc_common_close_button')),
        imageSrc: ctrl.successImage,
      };
    }
    if (ctrl.resultType === 'nfc_error' && ctrl.error) {
      return {
        variant: 'error' as const,
        title: String(t('mbc_nfc_error_title')),
        subtitle: ctrl.error.startsWith('mbc_') ? String(t(ctrl.error as 'mbc_nfc_error_hardware_unavailable')) : ctrl.error,
        buttonLabel: String(t('mbc_common_close_button')),
        imageSrc: ctrl.nfcErrorImage,
      };
    }
    return null;
  };

  const resultProps = getResultProps();
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';

  return (
    <div className={styles['mbc-scout']}>
      <PageHeader title={String(t('mbc_scout_title'))} onBack={() => window.history.back()} />
      <main className={styles['mbc-scout__main']}>
        <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

        {/* NFC Scan Modal */}
        <NfcScanModal
          isOpen={showNfcModal}
          nfcStatus={ctrl.nfcStatus}
          isProcessing={ctrl.isReading}
          error={ctrl.error}
          onClose={handleCloseNfcModal}
          onCancel={handleCloseNfcModal}
          scanImageSrc={ctrl.scanImage}
          t={t}
        />

        {/* Result Modal — card info on success, error on failure */}
        {resultProps && (
          <ResultStatusModal
            isOpen={ctrl.resultType !== null}
            variant={resultProps.variant}
            title={resultProps.title}
            subtitle={resultProps.subtitle}
            buttonLabel={resultProps.buttonLabel}
            imageSrc={resultProps.imageSrc}
            hideHeader={ctrl.resultType === 'read_success'}
            onClose={handleCloseResult}
          >
            {ctrl.resultType === 'read_success' && ctrl.cardData && (
              <div className={styles['mbc-scout__modal-content']}>
                <SignalCard>
                  <div className={styles['mbc-scout__info-grid']}>
                    <div className={styles['mbc-scout__info-balance']}>
                      <span className={styles['mbc-scout__info-label']}>{t('mbc_scout_card_balance_label')}</span>
                      <span className={styles['mbc-scout__info-balance-value']}>{formatIDR(ctrl.cardData.b)}</span>
                    </div>
                    <div className={styles['mbc-scout__info-status']}>
                      <span className={styles['mbc-scout__info-label']}>{t('mbc_scout_checkin_status_label')}</span>
                      <span className={styles['mbc-scout__info-status-value']}>
                        {ctrl.cardData.s === 1 ? `${t('mbc_scout_status_checked_in')}` : t('mbc_scout_status_idle')}
                      </span>
                      {ctrl.cardData.t && (
                        <span className={styles['mbc-scout__info-timestamp']}>
                          {t('mbc_common_entry_time_label')}{' '}
                          <strong>{new Date(ctrl.cardData.t).toLocaleString('id-ID')}</strong>
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
                    {ctrl.cardData.h.length === 0 ? (
                      <p className={styles['mbc-scout__history-empty']}>
                        {t('mbc_scout_history_empty')}
                      </p>
                    ) : (
                      <div className={styles['mbc-scout__history-list']}>
                        {ctrl.cardData.h.map((entry, idx) => (
                          <div key={idx} className={styles['mbc-scout__history-item']}>
                            <div className={styles['mbc-scout__history-left']}>
                              <span className={styles['mbc-scout__history-type']}>
                                {getTransactionLabel(entry.tp)}
                              </span>
                              <span className={styles['mbc-scout__history-time']}>
                                {new Date(entry.ts * 1000).toLocaleString('id-ID')}
                              </span>
                            </div>
                            {entry.tp === 'ci' ? (
                              <span className={styles['mbc-scout__history-amount']}>—</span>
                            ) : (
                              <span className={`${styles['mbc-scout__history-amount']} ${entry.a >= 0 ? styles['mbc-scout__history-amount--positive'] : styles['mbc-scout__history-amount--negative']}`}>
                                {entry.a >= 0 ? '+' : ''}{formatIDR(entry.a)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SignalCard>
              </div>
            )}
          </ResultStatusModal>
        )}

        {/* Main Content — Tap Button */}
        {nfcAvailable && (
          <div className={styles['mbc-scout__content']}>
            <SignalCard className={styles['mbc-scout__nfc-section']}>
              <SignalGateButton
                color="scout"
                onClick={handleReadCard}
                disabled={ctrl.isReading}
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
