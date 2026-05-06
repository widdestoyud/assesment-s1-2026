import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import BalanceDisplay from '@components/BalanceDisplay';
import DebugPanel, { createDebugLog, type DebugLog } from '@components/DebugPanel';
import styles from './mbc-station.module.css';

const MbcStation: FC = () => {
  const ctrl = container.resolve<StationControllerInterface>('stationController');
  const { t } = ctrl;
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addLog = (step: string, data: unknown, level: DebugLog['level'] = 'info') => {
    setDebugLogs(prev => [...prev, createDebugLog(step, data, level)]);
  };

  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';

  const handleTapCard = async () => {
    setDebugLogs([]);
    addLog('Validate Card Start', { nfcCapability: ctrl.nfcCapability });
    try {
      await ctrl.onTapCard();
      addLog('Validate Card Complete', { phase: ctrl.phase, cardData: ctrl.cardData }, 'success');
    } catch (err: unknown) {
      addLog('Validate Card Error', { error: err instanceof Error ? err.message : String(err) }, 'error');
    }
  };

  const handleTopUp = async () => {
    const amount = Number.parseInt(ctrl.topUpAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) return;
    setDebugLogs([]);
    addLog('Top-Up Start', { amount });
    try {
      await ctrl.onTopUp(amount);
      addLog('Top-Up Complete', { cardData: ctrl.cardData }, 'success');
    } catch (err: unknown) {
      addLog('Top-Up Error', { error: err instanceof Error ? err.message : String(err) }, 'error');
    }
  };

  return (
    <main className={styles['mbc-station']}>
      <h1 className={styles['mbc-station__title']}>{t('mbc_station_title')}</h1>
      <p className={styles['mbc-station__subtitle']}>{t('mbc_station_subtitle')}</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {nfcAvailable && (
        <div className={styles['mbc-station__section']}>
          {/* Phase: Tap */}
          {ctrl.phase === 'tap' && (
            <>
              <p className={styles['mbc-station__instruction']}>{t('mbc_station_tap_instruction')}</p>
              <button
                type="button"
                onClick={handleTapCard}
                disabled={ctrl.isProcessing}
                className={styles['mbc-station__primary-button']}
              >
                {t('mbc_station_validate_button')}
              </button>
              <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} t={t} />
            </>
          )}

          {/* Phase: Top-Up */}
          {ctrl.phase === 'topup' && (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTopUp();
                }}
                className={styles['mbc-station__form-group']}
              >
                <div>
                  <label htmlFor="topup-amount" className={styles['mbc-station__label']}>
                    {t('mbc_station_topup_amount_label')}
                  </label>
                  <input
                    id="topup-amount"
                    type="number"
                    value={ctrl.topUpAmount}
                    onChange={(e) => ctrl.setTopUpAmount(e.target.value)}
                    min="1"
                    max="999999"
                    required
                    className={styles['mbc-station__input']}
                  />
                </div>
                <button
                  type="submit"
                  disabled={ctrl.isProcessing}
                  className={styles['mbc-station__primary-button']}
                >
                  {t('mbc_station_topup_button')}
                </button>
              </form>
              <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} t={t} />
            </>
          )}

          {/* Phase: Balance */}
          {ctrl.phase === 'balance' && ctrl.cardData && (
            <>
              <BalanceDisplay balance={ctrl.cardData.b} t={t} />
              <button
                type="button"
                onClick={ctrl.onGoToTopUp}
                className={styles['mbc-station__secondary-button']}
              >
                {t('mbc_station_topup_again_button')}
              </button>
            </>
          )}

          {/* Error */}
          {ctrl.error && (
            <div role="alert" className={styles['mbc-station__error-alert']}>
              {ctrl.error}
            </div>
          )}

          {/* Success message for tap phase */}
          {ctrl.nfcStatus === 'success' && ctrl.phase === 'topup' && (
            <output className={styles['mbc-station__success-output']}>
              {t('mbc_station_validation_success')}
            </output>
          )}
        </div>
      )}

      <DebugPanel logs={debugLogs} title="Station NFC Debug" onClear={() => setDebugLogs([])} />
    </main>
  );
};

export default MbcStation;
