import type { FC } from 'react';
import type { ServiceType } from '@core/services/mbc/models';
import styles from './service-type-selector.module.css';

export interface ServiceTypeSelectorProps {
  serviceTypes: ServiceType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const ServiceTypeSelector: FC<ServiceTypeSelectorProps> = ({
  serviceTypes,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  if (serviceTypes.length === 0) {
    return (
      <div data-testid="service-type-selector" className={styles['service-type-selector--empty']}>
        Belum ada service type yang dikonfigurasi. Silakan konfigurasi di The Station.
      </div>
    );
  }

  return (
    <div data-testid="service-type-selector">
      <label htmlFor="service-type-select" className={styles['service-type-selector__label']}>
        Pilih Layanan
      </label>
      <select
        id="service-type-select"
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className={styles['service-type-selector__select']}
      >
        <option value="" disabled>
          -- Pilih layanan --
        </option>
        {serviceTypes.map((st) => (
          <option key={st.id} value={st.id}>
            {st.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ServiceTypeSelector;
