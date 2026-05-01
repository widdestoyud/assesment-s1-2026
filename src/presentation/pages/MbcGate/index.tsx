import type { FC } from 'react';
import container from '@di/container';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import ServiceTypeSelector from '@components/ServiceTypeSelector';
import SimulationBanner from '@components/SimulationBanner';
import styles from './mbc-gate.module.css';

const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';

  return (
    <main className={styles['mbc-gate']}>
      <h1 className={styles['mbc-gate__title']}>🚪 The Gate</h1>
      <p className={styles['mbc-gate__subtitle']}>Check-in member dengan NFC</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} />

      {nfcAvailable && (
        <>
          <SimulationBanner
            isActive={ctrl.simulationMode}
            timestamp={ctrl.simulationTimestamp}
          />

          <div className={styles['mbc-gate__content']}>
        <ServiceTypeSelector
          serviceTypes={ctrl.serviceTypes}
          selectedId={ctrl.selectedServiceType?.id ?? null}
          onSelect={ctrl.onSelectServiceType}
          disabled={ctrl.isProcessing}
        />

        {/* Simulation Mode Toggle */}
        <div className={styles['mbc-gate__toggle-row']}>
          <label htmlFor="sim-toggle" className={styles['mbc-gate__toggle-label']}>
            Mode Simulasi
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
              Waktu Check-In (Simulasi)
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
          disabled={ctrl.isProcessing || !ctrl.selectedServiceType}
          className={styles['mbc-gate__primary-button']}
        >
          Check-In
        </button>

        <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} />

        {ctrl.error && (
          <div role="alert" className={styles['mbc-gate__error-alert']}>
            {ctrl.error}
          </div>
        )}

        {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
          <output className={styles['mbc-gate__success-output']}>
            <p className={styles['mbc-gate__success-title']}>✅ Check-in berhasil</p>
            <p>Member: <strong>{ctrl.lastResult.memberName}</strong></p>
            <p>Layanan: <strong>{ctrl.lastResult.serviceTypeName}</strong></p>
            <p>Waktu masuk: <strong>{new Date(ctrl.lastResult.entryTime).toLocaleString('id-ID')}</strong></p>
          </output>
        )}
      </div>
        </>
      )}
    </main>
  );
};

export default MbcGate;
