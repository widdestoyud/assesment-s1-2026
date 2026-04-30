import type { FC } from 'react';

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
      className="rounded-md bg-yellow-100 border border-yellow-400 px-4 py-2 text-sm text-yellow-800"
    >
      <strong>⚠️ Mode Simulasi Aktif</strong>
      {timestamp && (
        <span className="ml-2">
          — Waktu check-in: {new Date(timestamp).toLocaleString('id-ID')}
        </span>
      )}
    </div>
  );
};

export default SimulationBanner;
