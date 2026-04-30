import type { FC } from 'react';
import type { ServiceType } from '@core/services/mbc/models';

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
      <div data-testid="service-type-selector" className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
        Belum ada service type yang dikonfigurasi. Silakan konfigurasi di The Station.
      </div>
    );
  }

  return (
    <div data-testid="service-type-selector">
      <label htmlFor="service-type-select" className="mb-1 block text-sm font-medium text-gray-700">
        Pilih Layanan
      </label>
      <select
        id="service-type-select"
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
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
