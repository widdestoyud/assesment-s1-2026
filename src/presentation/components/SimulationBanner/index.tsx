import type { FC } from 'react';
import type { TFunction } from 'i18next';
import styles from './simulation-banner.module.css';

export interface SimulationBannerProps {
  isActive: boolean;
  timestamp: string | null;
  t: TFunction;
}

const SimulationBanner: FC<SimulationBannerProps> = ({ isActive, timestamp, t }) => {

  if (!isActive) return null;

  return (
    <div
      role="alert"
      data-testid="simulation-banner"
      className={styles['simulation-banner']}
    >
      <strong>{t('mbc_simulation_active')}</strong>
      {timestamp && (
        <span className={styles['simulation-banner__timestamp']}>
          {t('mbc_simulation_checkin_time')} {new Date(timestamp).toLocaleString('id-ID')}
        </span>
      )}
    </div>
  );
};

export default SimulationBanner;
