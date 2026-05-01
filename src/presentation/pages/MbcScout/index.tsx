import type { FC } from 'react';
import container from '@di/container';
import type { ScoutControllerInterface } from '@controllers/mbc/scout.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import CardInfoDisplay from '@components/CardInfoDisplay';
import styles from './mbc-scout.module.css';

const MbcScout: FC = () => {
  const ctrl = container.resolve<ScoutControllerInterface>('scoutController');

  return (
    <main className={styles['mbc-scout']}>
      <h1 className={styles['mbc-scout__title']}>🔍 The Scout</h1>
      <p className={styles['mbc-scout__subtitle']}>Lihat isi kartu member</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} />

      {(ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending') && (
        <div className={styles['mbc-scout__content']}>
          <button
            type="button"
            onClick={ctrl.onReadCard}
            disabled={ctrl.isReading}
            className={styles['mbc-scout__primary-button']}
          >
            Baca Kartu
          </button>

          <NfcTapPrompt
            nfcStatus={ctrl.nfcStatus}
            isProcessing={ctrl.isReading}
          />

          {ctrl.error && (
            <div role="alert" className={styles['mbc-scout__error-alert']}>
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
