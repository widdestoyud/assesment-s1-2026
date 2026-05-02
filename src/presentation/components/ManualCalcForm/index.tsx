import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { BenefitType } from '@core/services/mbc/models';
import styles from './manual-calc-form.module.css';

export interface ManualCalcFormData {
  checkInTimestamp: string;
  benefitTypeId: string;
}

export interface ManualCalcFormProps {
  onSubmit: (data: ManualCalcFormData) => void;
  benefitTypes: BenefitType[];
  isActive: boolean;
}

const ManualCalcForm: FC<ManualCalcFormProps> = ({
  onSubmit,
  benefitTypes,
  isActive,
}) => {
  const [checkInTimestamp, setCheckInTimestamp] = useState('');
  const [benefitTypeId, setBenefitTypeId] = useState('');

  if (!isActive) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!checkInTimestamp || !benefitTypeId) return;
    onSubmit({
      checkInTimestamp: new Date(checkInTimestamp).toISOString(),
      benefitTypeId,
    });
  };

  return (
    <div data-testid="manual-calc-form" className={styles['manual-calc-form']}>
      <h3 className={styles['manual-calc-form__heading']}>
        Manual / Offline Calculation
      </h3>
      <form onSubmit={handleSubmit} className={styles['manual-calc-form__form']}>
        <div>
          <label htmlFor="mc-timestamp" className={styles['manual-calc-form__label']}>
            Waktu Check-In
          </label>
          <input
            id="mc-timestamp"
            type="datetime-local"
            value={checkInTimestamp}
            onChange={(e) => setCheckInTimestamp(e.target.value)}
            required
            className={styles['manual-calc-form__input']}
          />
        </div>
        <div>
          <label htmlFor="mc-service" className={styles['manual-calc-form__label']}>
            Layanan
          </label>
          <select
            id="mc-service"
            value={benefitTypeId}
            onChange={(e) => setBenefitTypeId(e.target.value)}
            required
            className={styles['manual-calc-form__select']}
          >
            <option value="" disabled>-- Pilih layanan --</option>
            {benefitTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.displayName}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={styles['manual-calc-form__submit-button']}
        >
          Hitung Tarif
        </button>
      </form>
    </div>
  );
};

export default ManualCalcForm;
