import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import DebugPanel, { createDebugLog, type DebugLog } from '@components/DebugPanel';
import styles from './mbc-gate.module.css';

const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');
  const { t } = ctrl;
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addLog = (step: string, data: unknown, level: DebugLog['level'] = 'info') => {
    setDebugLogs(prev => [...prev, createDebugLog(step, data, level)]);
  };

  const handleCheckIn = async () => {
    setDebugLogs([]);
    addLog('Check-In Start', { nfcCapability: ctrl.nfcCapability });
    try {
      await ctrl.onCheckIn();
      addLog('Check-In Complete', { lastResult: ctrl.lastResult, nfcStatus: ctrl.nfcStatus }, 'success');
    } catch (err: unknown) {
      addLog('Check-In Error', { error: err instanceof Error ? err.message : String(err) }, 'error');
    }
  };

  return (
    <main className={styles['mbc-gate']}>
      <h1 className={styles['mbc-gate__title']}>{t('mbc_gate_title')}</h1>
      <p className={styles['mbc-gate__subtitle']}>{t('mbc_gate_subtitle')}</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {nfcAvailable && (
        <div className={styles['mbc-gate__content']}>
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={ctrl.isProcessing}
            className={styles['mbc-gate__primary-button']}
          >
            {t('mbc_gate_checkin_button')}
          </button>

          <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} t={t} />

          {ctrl.error && (
            <div role="alert" className={styles['mbc-gate__error-alert']}>
              {ctrl.error}
            </div>
          )}

          {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
            <output className={styles['mbc-gate__success-output']}>
              <p className={styles['mbc-gate__success-title']}>{t('mbc_gate_checkin_success')}</p>
              <p>
                {t('mbc_gate_entry_time_label')}{' '}
                <strong>{new Date(ctrl.lastResult.checkInTime).toLocaleString('id-ID')}</strong>
              </p>
            </output>
          )}
        </div>
      )}

      <DebugPanel logs={debugLogs} title="Gate NFC Debug" onClear={() => setDebugLogs([])} />
    </main>
  );
};

export default MbcGate;
