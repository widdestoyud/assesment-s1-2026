import type { FC } from 'react';
import { useState } from 'react';
import container from '@di/container';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import BalanceDisplay from '@components/BalanceDisplay';
import BenefitTypeForm from '@components/BenefitTypeForm';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './mbc-station.module.css';

type Tab = 'register' | 'topup' | 'config';

const MbcStation: FC = () => {
  const ctrl = container.resolve<StationControllerInterface>('stationController');
  const [activeTab, setActiveTab] = useState<Tab>('register');
  const [regName, setRegName] = useState('');
  const [regMemberId, setRegMemberId] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'register', label: 'Registrasi' },
    { id: 'topup', label: 'Top-Up' },
    { id: 'config', label: 'Service Config' },
  ];

  return (
    <main className={styles['mbc-station']}>
      <h1 className={styles['mbc-station__title']}>🏢 The Station</h1>
      <p className={styles['mbc-station__subtitle']}>Admin: Registrasi, Top-Up, Konfigurasi</p>

      {ctrl.storageWarning && (
        <div role="alert" className={styles['mbc-station__storage-warning']}>
          ⚠️ {ctrl.storageWarning}
        </div>
      )}

      {/* Tabs */}
      <div className={styles['mbc-station__tab-list']} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? styles['mbc-station__tab--active'] : styles['mbc-station__tab--inactive']}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== 'config' && <NfcCapabilityNotice status={ctrl.nfcCapability} />}

      {/* Registration Tab */}
      {activeTab === 'register' && nfcAvailable && (
        <div className={styles['mbc-station__section']}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ctrl.onRegister({ name: regName, memberId: regMemberId });
            }}
            className={styles['mbc-station__form-group']}
          >
            <div>
              <label htmlFor="reg-name" className={styles['mbc-station__label']}>Nama</label>
              <input id="reg-name" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required className={styles['mbc-station__input']} />
            </div>
            <div>
              <label htmlFor="reg-id" className={styles['mbc-station__label']}>Member ID</label>
              <input id="reg-id" type="text" value={regMemberId} onChange={(e) => setRegMemberId(e.target.value)} required className={styles['mbc-station__input']} />
            </div>
            <button type="submit" disabled={ctrl.isProcessing} className={styles['mbc-station__primary-button']}>
              Registrasi Kartu
            </button>
          </form>
          <NfcTapPrompt nfcStatus={ctrl.nfcStatus} isProcessing={ctrl.isProcessing} />
        </div>
      )}

      {/* Top-Up Tab */}
      {activeTab === 'topup' && nfcAvailable && (
        <div className={styles['mbc-station__section']}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ctrl.onTopUp({ amount: Number.parseInt(topUpAmount, 10) });
            }}
            className={styles['mbc-station__form-group']}
          >
            <div>
              <label htmlFor="topup-amount" className={styles['mbc-station__label']}>Jumlah (Rp)</label>
              <input id="topup-amount" type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} min="1" required className={styles['mbc-station__input']} />
            </div>
            <button type="submit" disabled={ctrl.isProcessing} className={styles['mbc-station__secondary-button']}>
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
        <div className={styles['mbc-station__section']}>
          <BenefitTypeForm onSubmit={(data) => ctrl.onAddBenefitType(data)} />
          <div className={styles['mbc-station__config-list']}>
            <h3 className={styles['mbc-station__config-heading']}>Service Types Terdaftar</h3>
            {ctrl.benefitTypes.length === 0 ? (
              <p className={styles['mbc-station__config--empty']}>Belum ada benefit type</p>
            ) : (
              <ul className={styles['mbc-station__config-list']}>
                {ctrl.benefitTypes.map((st) => (
                  <li key={st.id} className={styles['mbc-station__config-item']}>
                    <div>
                      <p className={styles['mbc-station__config-item-name']}>{st.displayName}</p>
                      <p className={styles['mbc-station__config-item-rate']}>{formatIDR(st.pricing.ratePerUnit)} / {st.pricing.unitType}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => ctrl.onRemoveBenefitType(st.id)}
                      className={styles['mbc-station__remove-button']}
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
        <div role="alert" className={styles['mbc-station__error-alert']}>
          {ctrl.error}
        </div>
      )}
      {ctrl.lastResult && ctrl.nfcStatus === 'success' && (
        <output className={styles['mbc-station__success-output']}>
          ✅ {ctrl.lastResult.type === 'registration' ? 'Registrasi berhasil' : 'Top-up berhasil'} — {ctrl.lastResult.memberName}
        </output>
      )}
    </main>
  );
};

export default MbcStation;
