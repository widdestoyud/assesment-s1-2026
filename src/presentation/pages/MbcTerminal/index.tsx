import type { FC } from 'react';
import container from '@di/container';
import type { TerminalControllerInterface } from '@controllers/terminal.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import FeeBreakdown from '@components/FeeBreakdown';
import BalanceDisplay from '@components/BalanceDisplay';
import ManualCalcForm from '@components/ManualCalcForm';
import { formatIDR } from '@utils/helpers/mbc.helper';

const MbcTerminal: FC = () => {
  const ctrl = container.resolve<TerminalControllerInterface>('terminalController');
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-xl font-bold">💳 The Terminal</h1>
      <p className="mb-4 text-sm text-gray-500">Check-out dan kalkulasi tarif</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} />

      <div className="space-y-4">
        {/* Manual Mode Toggle — always available */}
        <div className="flex items-center gap-3">
          <label htmlFor="manual-toggle" className="text-sm font-medium text-gray-700">
            Kalkulasi Manual
          </label>
          <button
            id="manual-toggle"
            type="button"
            role="switch"
            aria-checked={ctrl.isManualMode}
            onClick={ctrl.onToggleManualMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              ctrl.isManualMode ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                ctrl.isManualMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Manual Calculation Form — always available */}
        <ManualCalcForm
          onSubmit={ctrl.onManualCalculate}
          serviceTypes={ctrl.serviceTypes}
          isActive={ctrl.isManualMode}
        />

        {/* Manual Result */}
        {ctrl.manualResult && (
          <div className="rounded-lg bg-orange-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-orange-700">Hasil Kalkulasi Manual</h3>
            <p className="text-2xl font-bold">{formatIDR(ctrl.manualResult.fee)}</p>
            <p className="text-sm text-gray-500">
              {ctrl.manualResult.usageUnits} {ctrl.manualResult.unitLabel} × {formatIDR(ctrl.manualResult.ratePerUnit)}
            </p>
          </div>
        )}

        {/* NFC Check-Out — only when NFC available and not in manual mode */}
        {nfcAvailable && !ctrl.isManualMode && (
          <>
            <button
              type="button"
              onClick={ctrl.onCheckOut}
              disabled={ctrl.isProcessing}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Check-Out
            </button>

            <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} />
          </>
        )}

        {/* Check-Out Result */}
        {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
          <div className="space-y-3">
            <output className="block rounded-md bg-green-50 p-3 text-sm text-green-700">
              ✅ Check-out berhasil — {ctrl.lastResult.serviceTypeName}
            </output>
            <FeeBreakdown
              feeResult={ctrl.lastResult.feeBreakdown}
              serviceTypeName={ctrl.lastResult.serviceTypeName}
            />
            <BalanceDisplay balance={ctrl.lastResult.remainingBalance} />
          </div>
        )}

        {/* Error */}
        {ctrl.error && (
          <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {ctrl.error}
          </div>
        )}
      </div>
    </main>
  );
};

export default MbcTerminal;
