import type { FC } from 'react';
import styles from './simulation-banner.module.css';

export interface SimulationBannerProps {
  isActive: boolean;
  timestamp: string | null;
}

const SimulationBanner: FC<SimulationBannerProps> = ({ isActive, timestamp }) => {
  if (!isActive) return null;

  return (
    <div
      role="alert"
      data-testid="simulation-banner"
      className={styles['simulation-banner']}
    >
      <strong>⚠️ Mode Simulasi Aktif</strong>
      {timestamp && (
        <span className={styles['simulation-banner__timestamp']}>
          — Waktu check-in: {new Date(timestamp).toLocaleString('id-ID')}
        </span>
      )}
    </div>
  );
};

export default SimulationBanner;
