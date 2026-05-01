import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import NfcTapPrompt from '@components/mbc/NfcTapPrompt';
import BalanceDisplay from '@components/mbc/BalanceDisplay';
import ServiceTypeForm from '@components/mbc/ServiceTypeForm';
import { formatIDR } from '@utils/helpers/mbc.helper';

type Tab = 'register' | 'topup' | 'config';

const MbcStation: FC = () => {
  const ctrl = container.resolve<StationControllerInterface>('stationController');
  const [activeTab, setActiveTab] = useState<Tab>('register');
  const [regName, setRegName] = useState('');
  const [regMemberId, setRegMemberId] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'register', label: 'Registrasi' },
    { id: 'topup', label: 'Top-Up' },
    { id: 'config', label: 'Service Config' },
  ];

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-1 text-xl font-bold">🏢 The Station</h1>
      <p className="mb-4 text-sm text-gray-500">Admin: Registrasi, Top-Up, Konfigurasi</p>

      {ctrl.storageWarning && (
        <div role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          ⚠️ {ctrl.storageWarning}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Registration Tab */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ctrl.onRegister({ name: regName, memberId: regMemberId });
            }}
            className="space-y-3"
          >
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">Nama</label>
              <input id="reg-name" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="reg-id" className="block text-sm font-medium text-gray-700">Member ID</label>
              <input id="reg-id" type="text" value={regMemberId} onChange={(e) => setRegMemberId(e.target.value)} required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={ctrl.isProcessing} className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              Registrasi Kartu
            </button>
          </form>
          <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} />
        </div>
      )}

      {/* Top-Up Tab */}
      {activeTab === 'topup' && (
        <div className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ctrl.onTopUp({ amount: Number.parseInt(topUpAmount, 10) });
            }}
            className="space-y-3"
          >
            <div>
              <label htmlFor="topup-amount" className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
              <input id="topup-amount" type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} min="1" required className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={ctrl.isProcessing} className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
              Top-Up Saldo
            </button>
          </form>
          <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} />
          {ctrl.lastResult?.type === 'top-up' && (
            <BalanceDisplay
              balance={ctrl.lastResult.newBalance}
              previousBalance={ctrl.lastResult.previousBalance}
              changeAmount={ctrl.lastResult.amount}
            />
          )}
        </div>
      )}

      {/* Service Config Tab */}
      {activeTab === 'config' && (
        <div className="space-y-4">
          <ServiceTypeForm onSubmit={(data) => ctrl.onAddServiceType(data)} />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-600">Service Types Terdaftar</h3>
            {ctrl.serviceTypes.length === 0 ? (
              <p className="text-sm text-gray-400">Belum ada service type</p>
            ) : (
              <ul className="space-y-2">
                {ctrl.serviceTypes.map((st) => (
                  <li key={st.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{st.displayName}</p>
                      <p className="text-xs text-gray-400">{formatIDR(st.pricing.ratePerUnit)} / {st.pricing.unitType}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => ctrl.onRemoveServiceType(st.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Hapus ${st.displayName}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {ctrl.error && (
        <div role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {ctrl.error}
        </div>
      )}
      {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
        <output className="mt-4 block rounded-md bg-green-50 p-3 text-sm text-green-700">
          ✅ {ctrl.lastResult.type === 'registration' ? 'Registrasi berhasil' : 'Top-up berhasil'} — {ctrl.lastResult.memberName}
        </output>
      )}
    </main>
  );
};

export default MbcStation;
