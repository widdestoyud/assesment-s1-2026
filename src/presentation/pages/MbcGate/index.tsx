import type { FC } from 'react';
import container from '@di/container';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import BenefitTypeSelector from '@components/BenefitTypeSelector';
import SimulationBanner from '@components/SimulationBanner';
import styles from './mbc-gate.module.css';

const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');
  const { t } = ctrl;
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';

  return (
    <main className={styles['mbc-gate']}>
      <h1 className={styles['mbc-gate__title']}>{t('mbc_gate_title')}</h1>
      <p className={styles['mbc-gate__subtitle']}>{t('mbc_gate_subtitle')}</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {nfcAvailable && (
        <>
          <SimulationBanner
            isActive={ctrl.simulationMode}
            timestamp={ctrl.simulationTimestamp}
            t={t}
          />

          <div className={styles['mbc-gate__content']}>
        <BenefitTypeSelector
          benefitTypes={ctrl.benefitTypes}
          selectedId={ctrl.selectedBenefitType?.id ?? null}
          onSelect={ctrl.onSelectBenefitType}
          disabled={ctrl.isProcessing}
          t={t}
        />

        {/* Simulation Mode Toggle */}
        <div className={styles['mbc-gate__toggle-row']}>
          <label htmlFor="sim-toggle" className={styles['mbc-gate__toggle-label']}>
            {t('mbc_gate_simulation_mode')}
          </label>
          <button
            id="sim-toggle"
            type="button"
            role="switch"
            aria-checked={ctrl.simulationMode}
            onClick={ctrl.onToggleSimulation}
            className={ctrl.simulationMode ? styles['mbc-gate__switch--on'] : styles['mbc-gate__switch--off']}
          >
            <span
              className={ctrl.simulationMode ? styles['mbc-gate__switch-knob--on'] : styles['mbc-gate__switch-knob--off']}
            />
          </button>
        </div>

        {ctrl.simulationMode && (
          <div>
            <label htmlFor="sim-time" className={styles['mbc-gate__label']}>
              {t('mbc_gate_simulation_time_label')}
            </label>
            <input
              id="sim-time"
              type="datetime-local"
              value={ctrl.simulationTimestamp ?? ''}
              onChange={(e) => ctrl.onSetSimulationTimestamp(e.target.value)}
              className={styles['mbc-gate__input']}
            />
          </div>
        )}

        <button
          type="button"
          onClick={ctrl.onCheckIn}
          disabled={ctrl.isProcessing || !ctrl.selectedBenefitType}
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
            <p>{t('mbc_gate_member_label')} <strong>{ctrl.lastResult.memberName}</strong></p>
            <p>{t('mbc_gate_service_label')} <strong>{ctrl.lastResult.benefitTypeName}</strong></p>
            <p>{t('mbc_gate_entry_time_label')} <strong>{new Date(ctrl.lastResult.entryTime).toLocaleString('id-ID')}</strong></p>
          </output>
        )}
      </div>
        </>
      )}
    </main>
  );
};

export default MbcGate;
