import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { TFunction } from 'i18next';
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
  t: TFunction;
}

const ManualCalcForm: FC<ManualCalcFormProps> = ({
  onSubmit,
  benefitTypes,
  isActive,
  t,
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
        {t('mbc_manual_calc_heading')}
      </h3>
      <form onSubmit={handleSubmit} className={styles['manual-calc-form__form']}>
        <div>
          <label htmlFor="mc-timestamp" className={styles['manual-calc-form__label']}>
            {t('mbc_manual_calc_timestamp_label')}
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
            {t('mbc_manual_calc_service_label')}
          </label>
          <select
            id="mc-service"
            value={benefitTypeId}
            onChange={(e) => setBenefitTypeId(e.target.value)}
            required
            className={styles['manual-calc-form__select']}
          >
            <option value="" disabled>{t('mbc_manual_calc_service_placeholder')}</option>
            {benefitTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.displayName}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={styles['manual-calc-form__submit-button']}
        >
          {t('mbc_manual_calc_submit')}
        </button>
      </form>
    </div>
  );
};

export default ManualCalcForm;
