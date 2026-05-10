import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { ScoutControllerInterface } from '@controllers/mbc/scout.controller';
import type { TransactionType } from '@src/@core/models/mbc';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import PageLayout from '@components/PageLayout';
import BalanceDisplay from '@components/BalanceDisplay';
import { formatIDR } from '@utils/helpers/mbc.helper';
import DebugPanel, { createDebugLog, type DebugLog } from '@components/DebugPanel';
import styles from './mbc-scout.module.css';

const MbcScout: FC = () => {
  const ctrl = container.resolve<ScoutControllerInterface>('scoutController');
  const { t } = ctrl;
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const getTransactionLabel = (tp: TransactionType): string => {
    switch (tp) {
      case 'tu': return t('mbc_scout_history_topup');
      case 'ci': return t('mbc_scout_history_checkin');
      case 'co': return t('mbc_scout_history_checkout');
    }
  };

  const addLog = (step: string, data: unknown, level: DebugLog['level'] = 'info') => {
    setDebugLogs(prev => [...prev, createDebugLog(step, data, level)]);
  };

  const handleReadCard = async () => {
    setDebugLogs([]);
    addLog('NFC Read Start', { nfcCapability: ctrl.nfcCapability, nfcStatus: ctrl.nfcStatus });
    try {
      await ctrl.onReadCard();
      addLog('NFC Read Complete', { cardData: ctrl.cardData, nfcStatus: ctrl.nfcStatus }, 'success');
    } catch (err: unknown) {
      addLog('NFC Read Error', { error: err instanceof Error ? err.message : String(err) }, 'error');
    }
  };

  return (
    <PageLayout
      icon="🔍"
      title={t('mbc_scout_title')}
      subtitle={t('mbc_scout_subtitle')}
      color="purple"
    >
      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {(ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending') && (
        <div className={styles['mbc-scout__content']}>
          <button
            type="button"
            onClick={handleReadCard}
            disabled={ctrl.isReading}
            className={styles['mbc-scout__primary-button']}
          >
            {t('mbc_scout_read_button')}
          </button>

          <NfcTapPrompt
            nfcStatus={ctrl.nfcStatus}
            isProcessing={ctrl.isReading}
            t={t}
          />

          {ctrl.error && (
            <div role="alert" className={styles['mbc-scout__error-alert']}>
              {ctrl.error}
            </div>
          )}

          {/* Raw data section — always show when data was read */}
          {(ctrl.rawEncryptedBase64 || ctrl.rawDecryptedJson) && (
            <div className={styles['mbc-scout__detail-card']}>
              <p className={styles['mbc-scout__detail-title']}>
                {t('mbc_scout_raw_data_title')}
              </p>
              {ctrl.rawEncryptedBase64 && (
                <>
                  <p className={styles['mbc-scout__raw-data-label']}>{t('mbc_scout_raw_encrypted_label')}</p>
                  <div className={styles['mbc-scout__raw-data']}>
                    <code>{ctrl.rawEncryptedBase64}</code>
                  </div>
                </>
              )}
              {ctrl.rawDecryptedJson && (
                <>
                  <p className={styles['mbc-scout__raw-data-label']}>{t('mbc_scout_raw_decrypted_label')}</p>
                  <div className={styles['mbc-scout__raw-data']}>
                    <code>{ctrl.rawDecryptedJson}</code>
                  </div>
                </>
              )}
            </div>
          )}

          {ctrl.cardData && (
            <div className={styles['mbc-scout__card-info']}>
              <BalanceDisplay balance={ctrl.cardData.b} t={t} />
              <div className={styles['mbc-scout__status-card']}>
                <p className={styles['mbc-scout__status-label']}>
                  {t('mbc_scout_checkin_status_label')}
                </p>
                <p className={styles['mbc-scout__status-value']}>
                  {ctrl.cardData.s === 1 ? t('mbc_scout_status_checked_in') : t('mbc_scout_status_idle')}
                </p>
                {ctrl.cardData.t && (
                  <p className={styles['mbc-scout__status-timestamp']}>
                    {t('mbc_scout_checkin_time_label')}{' '}
                    <strong>{new Date(ctrl.cardData.t).toLocaleString('id-ID')}</strong>
                  </p>
                )}
              </div>
              <div className={styles['mbc-scout__detail-card']}>
                <p className={styles['mbc-scout__detail-title']}>
                  {t('mbc_scout_card_detail_title')}
                </p>
                <div className={styles['mbc-scout__detail-row']}>
                  <span className={styles['mbc-scout__detail-label']}>{t('mbc_scout_card_version_label')}</span>
                  <span className={styles['mbc-scout__detail-value']}>v{ctrl.cardData.v}</span>
                </div>
                <div className={styles['mbc-scout__detail-row']}>
                  <span className={styles['mbc-scout__detail-label']}>{t('mbc_scout_card_balance_label')}</span>
                  <span className={styles['mbc-scout__detail-value']}>Rp {ctrl.cardData.b.toLocaleString('id-ID')}</span>
                </div>
                <div className={styles['mbc-scout__detail-row']}>
                  <span className={styles['mbc-scout__detail-label']}>{t('mbc_scout_card_status_label')}</span>
                  <span className={styles['mbc-scout__detail-value']}>
                    {ctrl.cardData.s === 1 ? 'Checked-In' : 'Idle'}
                  </span>
                </div>
                <div className={styles['mbc-scout__detail-row']}>
                  <span className={styles['mbc-scout__detail-label']}>{t('mbc_scout_card_timestamp_label')}</span>
                  <span className={styles['mbc-scout__detail-value']}>
                    {ctrl.cardData.t ? new Date(ctrl.cardData.t).toLocaleString('id-ID') : '-'}
                  </span>
                </div>
              </div>

              {/* Transaction History */}
              <div className={styles['mbc-scout__detail-card']}>
                <p className={styles['mbc-scout__detail-title']}>
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
            </div>
          )}
        </div>
      )}

      <DebugPanel logs={debugLogs} title="Scout NFC Debug" onClear={() => setDebugLogs([])} />
    </PageLayout>
  );
};

export default MbcScout;
