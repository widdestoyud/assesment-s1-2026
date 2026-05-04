import type { FC } from 'react';
import container from '@di/container';
import type { TerminalControllerInterface } from '@controllers/mbc/terminal.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import FeeBreakdown from '@components/FeeBreakdown';
import BalanceDisplay from '@components/BalanceDisplay';
import ManualCalcForm from '@components/ManualCalcForm';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './mbc-terminal.module.css';

const MbcTerminal: FC = () => {
  const ctrl = container.resolve<TerminalControllerInterface>('terminalController');
  const { t } = ctrl;
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';

  return (
    <main className={styles['mbc-terminal']}>
      <h1 className={styles['mbc-terminal__title']}>{t('mbc_terminal_title')}</h1>
      <p className={styles['mbc-terminal__subtitle']}>{t('mbc_terminal_subtitle')}</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      <div className={styles['mbc-terminal__content']}>
        {/* Manual Mode Toggle */}
        <div className={styles['mbc-terminal__toggle-row']}>
          <label htmlFor="manual-toggle" className={styles['mbc-terminal__toggle-label']}>
            {t('mbc_terminal_manual_calc_label')}
          </label>
          <button
            id="manual-toggle"
            type="button"
            role="switch"
            aria-checked={ctrl.isManualMode}
            onClick={ctrl.onToggleManualMode}
            className={ctrl.isManualMode ? styles['mbc-terminal__switch--on'] : styles['mbc-terminal__switch--off']}
          >
            <span
              className={ctrl.isManualMode ? styles['mbc-terminal__switch-knob--on'] : styles['mbc-terminal__switch-knob--off']}
            />
          </button>
        </div>

        {/* Manual Calculation Form */}
        <ManualCalcForm
          onSubmit={ctrl.onManualCalculate}
          benefitTypes={ctrl.benefitTypes}
          isActive={ctrl.isManualMode}
          t={t}
        />

        {/* Manual Result */}
        {ctrl.manualResult && (
          <div className={styles['mbc-terminal__manual-result-card']}>
            <h3 className={styles['mbc-terminal__manual-result-heading']}>{t('mbc_terminal_manual_result_heading')}</h3>
            <p className={styles['mbc-terminal__manual-result-amount']}>{formatIDR(ctrl.manualResult.fee)}</p>
            <p className={styles['mbc-terminal__manual-result-detail']}>
              {ctrl.manualResult.usageUnits} {ctrl.manualResult.unitLabel} × {formatIDR(ctrl.manualResult.ratePerUnit)}
            </p>
          </div>
        )}

        {/* NFC Check-Out */}
        {nfcAvailable && !ctrl.isManualMode && (
          <>
            <button
              type="button"
              onClick={ctrl.onCheckOut}
              disabled={ctrl.isProcessing}
              className={styles['mbc-terminal__primary-button']}
            >
              {t('mbc_terminal_checkout_button')}
            </button>

            <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} t={t} />
          </>
        )}

        {/* Check-Out Result */}
        {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
          <div className={styles['mbc-terminal__result-section']}>
            <output className={styles['mbc-terminal__success-output']}>
              {t('mbc_terminal_checkout_success', { benefitTypeName: ctrl.lastResult.benefitTypeName })}
            </output>
            <FeeBreakdown
              feeResult={ctrl.lastResult.feeBreakdown}
              benefitTypeName={ctrl.lastResult.benefitTypeName}
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
    </main>
  );
};

export default MbcTerminal;
