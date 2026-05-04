import type { FC } from 'react';
import container from '@di/container';
import type { ScoutControllerInterface } from '@controllers/mbc/scout.controller';
import NfcTapPrompt from '@components/NfcTapPrompt';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import CardInfoDisplay from '@components/CardInfoDisplay';
import styles from './mbc-scout.module.css';

const MbcScout: FC = () => {
  const ctrl = container.resolve<ScoutControllerInterface>('scoutController');
  const { t } = ctrl;

  return (
    <main className={styles['mbc-scout']}>
      <h1 className={styles['mbc-scout__title']}>{t('mbc_scout_title')}</h1>
      <p className={styles['mbc-scout__subtitle']}>{t('mbc_scout_subtitle')}</p>

      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {(ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending') && (
        <div className={styles['mbc-scout__content']}>
          <button
            type="button"
            onClick={ctrl.onReadCard}
            disabled={ctrl.isReading}
            className={styles['mbc-scout__primary-button']}
          >
            {t('mbc_scout_read_button')}
          </button>

          <NfcTapPrompt
            nfcStatus={ctrl.nfcStatus}
            isProcessing={ctrl.isReading}
            t={t}
          />

          {ctrl.error && (
            <div role="alert" className={styles['mbc-scout__error-alert']}>
              {ctrl.error}
            </div>
          )}

          {ctrl.cardData && (
            <CardInfoDisplay
              cardData={ctrl.cardData}
              benefitTypes={ctrl.benefitTypes}
              t={t}
            />
          )}
        </div>
      )}
    </main>
  );
};

export default MbcScout;
