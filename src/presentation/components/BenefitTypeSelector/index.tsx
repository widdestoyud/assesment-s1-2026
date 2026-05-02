import type { FC } from 'react';
import type { BenefitType } from '@core/services/mbc/models';
import styles from './benefit-type-selector.module.css';

export interface BenefitTypeSelectorProps {
  benefitTypes: BenefitType[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const BenefitTypeSelector: FC<BenefitTypeSelectorProps> = ({
  benefitTypes,
  selectedId,
  onSelect,
  disabled = false,
}) => {
  if (benefitTypes.length === 0) {
    return (
      <div data-testid="benefit-type-selector" className={styles['benefit-type-selector--empty']}>
        Belum ada benefit type yang dikonfigurasi. Silakan konfigurasi di The Station.
      </div>
    );
  }

  return (
    <div data-testid="benefit-type-selector">
      <label htmlFor="benefit-type-select" className={styles['benefit-type-selector__label']}>
        Pilih Layanan
      </label>
      <select
        id="benefit-type-select"
        value={selectedId ?? ''}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className={styles['benefit-type-selector__select']}
      >
        <option value="" disabled>
          -- Pilih layanan --
        </option>
        {benefitTypes.map((st) => (
          <option key={st.id} value={st.id}>
            {st.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BenefitTypeSelector;
