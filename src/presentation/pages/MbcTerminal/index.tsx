import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { TerminalControllerInterface } from '@controllers/mbc/terminal.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import PageLayout from '@components/PageLayout';
import FeeBreakdown from '@components/FeeBreakdown';
import BalanceDisplay from '@components/BalanceDisplay';
import DebugPanel, { createDebugLog, type DebugLog } from '@components/DebugPanel';
import { DEFAULT_PARKING_BENEFIT } from '@core/services/mbc/models';
import styles from './mbc-terminal.module.css';

const MbcTerminal: FC = () => {
  const ctrl = container.resolve<TerminalControllerInterface>('terminalController');
  const { t } = ctrl;
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addLog = (step: string, data: unknown, level: DebugLog['level'] = 'info') => {
    setDebugLogs(prev => [...prev, createDebugLog(step, data, level)]);
  };

  const handleCheckOut = async () => {
    setDebugLogs([]);
    addLog('Check-Out Start', { nfcCapability: ctrl.nfcCapability });
    try {
      await ctrl.onCheckOut();
      addLog('Check-Out Complete', { lastResult: ctrl.lastResult, nfcStatus: ctrl.nfcStatus }, 'success');
    } catch (err: unknown) {
      addLog('Check-Out Error', { error: err instanceof Error ? err.message : String(err) }, 'error');
    }
  };

  return (
    <PageLayout
      icon="💳"
      title={t('mbc_terminal_title')}
      subtitle={t('mbc_terminal_subtitle')}
      color="orange"
    >
      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {nfcAvailable && (
        <div className={styles['mbc-terminal__content']}>
          <button
            type="button"
            onClick={handleCheckOut}
            disabled={ctrl.isProcessing}
            className={styles['mbc-terminal__primary-button']}
          >
            {t('mbc_terminal_checkout_button')}
          </button>

          <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} t={t} />

          {/* Check-Out Result */}
          {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
            <div className={styles['mbc-terminal__result-section']}>
              <output className={styles['mbc-terminal__success-output']}>
                {t('mbc_terminal_checkout_success')}
              </output>
              <FeeBreakdown
                feeResult={ctrl.lastResult.feeBreakdown}
                benefitTypeName={DEFAULT_PARKING_BENEFIT.displayName}
                t={t}
              />
              <BalanceDisplay balance={ctrl.lastResult.remainingBalance} t={t} />
            </div>
          )}

          {/* Error */}
          {ctrl.error && (
            <div role="alert" className={styles['mbc-terminal__error-alert']}>
              {ctrl.error}
            </div>
          )}
        </div>
      )}

      <DebugPanel logs={debugLogs} title="Terminal NFC Debug" onClear={() => setDebugLogs([])} />
    </PageLayout>
  );
};

export default MbcTerminal;
