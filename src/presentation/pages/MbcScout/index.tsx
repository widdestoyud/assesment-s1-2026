import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { ScoutControllerInterface } from '@controllers/mbc/scout.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import BalanceDisplay from '@components/BalanceDisplay';
import DebugPanel, { createDebugLog, type DebugLog } from '@components/DebugPanel';
import styles from './mbc-scout.module.css';

const MbcScout: FC = () => {
  const ctrl = container.resolve<ScoutControllerInterface>('scoutController');
  const { t } = ctrl;
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

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
    <main className={styles['mbc-scout']}>
      <h1 className={styles['mbc-scout__title']}>{t('mbc_scout_title')}</h1>
      <p className={styles['mbc-scout__subtitle']}>{t('mbc_scout_subtitle')}</p>

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
            </div>
          )}
        </div>
      )}

      <DebugPanel logs={debugLogs} title="Scout NFC Debug" onClear={() => setDebugLogs([])} />
    </main>
  );
};

export default MbcScout;
