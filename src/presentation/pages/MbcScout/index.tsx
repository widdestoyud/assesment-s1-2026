import type { FC } from 'react';
import container from '@di/container';
import type { ScoutControllerInterface } from '@controllers/scout.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import CardInfoDisplay from '@components/CardInfoDisplay';

const MbcScout: FC = () => {
  const ctrl = container.resolve<ScoutControllerInterface>('scoutController');

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-xl font-bold">🔍 The Scout</h1>
      <p className="mb-4 text-sm text-gray-500">Lihat isi kartu member</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} />

      {(ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending') && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={ctrl.onReadCard}
            disabled={ctrl.isReading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Baca Kartu
          </button>

          <NfcTapPrompt
            nfcStatus={ctrl.nfcStatus}
            isProcessing={ctrl.isReading}
          />

          {ctrl.error && (
            <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {ctrl.error}
            </div>
          )}

          {ctrl.cardData && (
            <CardInfoDisplay
              cardData={ctrl.cardData}
              serviceTypes={ctrl.serviceTypes}
            />
          )}
        </div>
      )}
    </main>
  );
};

export default MbcScout;
