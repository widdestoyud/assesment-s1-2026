import type { FC } from 'react';
import container from '@di/container';
import type { GateControllerInterface } from '@controllers/mbc/gate.controller';
import NfcTapPrompt from '@components/mbc/NfcTapPrompt';
import ServiceTypeSelector from '@components/mbc/ServiceTypeSelector';
import SimulationBanner from '@components/mbc/SimulationBanner';

const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-xl font-bold">🚪 The Gate</h1>
      <p className="mb-4 text-sm text-gray-500">Check-in member dengan NFC</p>

      <SimulationBanner
        isActive={ctrl.simulationMode}
        timestamp={ctrl.simulationTimestamp}
      />

      <div className="mt-4 space-y-4">
        <ServiceTypeSelector
          serviceTypes={ctrl.serviceTypes}
          selectedId={ctrl.selectedServiceType?.id ?? null}
          onSelect={ctrl.onSelectServiceType}
          disabled={ctrl.isProcessing}
        />

        {/* Simulation Mode Toggle */}
        <div className="flex items-center gap-3">
          <label htmlFor="sim-toggle" className="text-sm font-medium text-gray-700">
            Mode Simulasi
          </label>
          <button
            id="sim-toggle"
            type="button"
            role="switch"
            aria-checked={ctrl.simulationMode}
            onClick={ctrl.onToggleSimulation}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              ctrl.simulationMode ? 'bg-yellow-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                ctrl.simulationMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {ctrl.simulationMode && (
          <div>
            <label htmlFor="sim-time" className="block text-sm font-medium text-gray-700">
              Waktu Check-In (Simulasi)
            </label>
            <input
              id="sim-time"
              type="datetime-local"
              value={ctrl.simulationTimestamp ?? ''}
              onChange={(e) => ctrl.onSetSimulationTimestamp(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <button
          type="button"
          onClick={ctrl.onCheckIn}
          disabled={ctrl.isProcessing || !ctrl.selectedServiceType}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Check-In
        </button>

        <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} />

        {ctrl.error && (
          <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {ctrl.error}
          </div>
        )}

        {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
          <div role="status" className="rounded-md bg-green-50 p-4 text-sm">
            <p className="font-semibold text-green-700">✅ Check-in berhasil</p>
            <p>Member: <strong>{ctrl.lastResult.memberName}</strong></p>
            <p>Layanan: <strong>{ctrl.lastResult.serviceTypeName}</strong></p>
            <p>Waktu masuk: <strong>{new Date(ctrl.lastResult.entryTime).toLocaleString('id-ID')}</strong></p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MbcGate;
