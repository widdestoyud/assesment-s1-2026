import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { TFunction } from 'i18next';
import type { BenefitType } from '@core/services/mbc/models';
import styles from './benefit-type-form.module.css';

export interface BenefitTypeFormProps {
  onSubmit: (data: BenefitType) => void;
  initialValues?: Partial<BenefitType>;
  isEditing?: boolean;
  t: TFunction;
}

const BenefitTypeForm: FC<BenefitTypeFormProps> = ({
  onSubmit,
  initialValues,
  isEditing = false,
  t,
}) => {
  const [id, setId] = useState(initialValues?.id ?? '');
  const [displayName, setDisplayName] = useState(initialValues?.displayName ?? '');
  const [activityType, setActivityType] = useState(initialValues?.activityType ?? '');
  const [ratePerUnit, setRatePerUnit] = useState(initialValues?.pricing?.ratePerUnit?.toString() ?? '');
  const [unitType, setUnitType] = useState(initialValues?.pricing?.unitType ?? 'per-hour');
  const [roundingStrategy, setRoundingStrategy] = useState(initialValues?.pricing?.roundingStrategy ?? 'ceiling');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      id,
      displayName,
      activityType,
      pricing: {
        ratePerUnit: Number.parseInt(ratePerUnit, 10),
        unitType: unitType as 'per-hour' | 'per-visit' | 'flat-fee',
        roundingStrategy: roundingStrategy as 'ceiling' | 'floor' | 'nearest',
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} data-testid="benefit-type-form" className={styles['benefit-type-form']}>
      <div>
        <label htmlFor="st-id" className={styles['benefit-type-form__label']}>{t('mbc_benefit_form_id_label')}</label>
        <input
          id="st-id"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          disabled={isEditing}
          placeholder="parking"
          pattern="^[a-z0-9-]+$"
          required
          className={styles['benefit-type-form__input--disabled']}
        />
      </div>
      <div>
        <label htmlFor="st-name" className={styles['benefit-type-form__label']}>{t('mbc_benefit_form_name_label')}</label>
        <input
          id="st-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Parkir"
          required
          className={styles['benefit-type-form__input']}
        />
      </div>
      <div>
        <label htmlFor="st-activity" className={styles['benefit-type-form__label']}>{t('mbc_benefit_form_activity_label')}</label>
        <input
          id="st-activity"
          type="text"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          placeholder="parking-fee"
          pattern="^[a-z0-9-]+$"
          required
          className={styles['benefit-type-form__input']}
        />
      </div>
      <div>
        <label htmlFor="st-rate" className={styles['benefit-type-form__label']}>{t('mbc_benefit_form_rate_label')}</label>
        <input
          id="st-rate"
          type="number"
          value={ratePerUnit}
          onChange={(e) => setRatePerUnit(e.target.value)}
          min="1"
          required
          className={styles['benefit-type-form__input']}
        />
      </div>
      <div>
        <label htmlFor="st-unit" className={styles['benefit-type-form__label']}>{t('mbc_benefit_form_unit_label')}</label>
        <select
          id="st-unit"
          value={unitType}
          onChange={(e) => setUnitType(e.target.value as 'per-hour' | 'per-visit' | 'flat-fee')}
          className={styles['benefit-type-form__select']}
        >
          <option value="per-hour">{t('mbc_benefit_form_unit_per_hour')}</option>
          <option value="per-visit">{t('mbc_benefit_form_unit_per_visit')}</option>
          <option value="flat-fee">{t('mbc_benefit_form_unit_flat_fee')}</option>
        </select>
      </div>
      <div>
        <label htmlFor="st-rounding" className={styles['benefit-type-form__label']}>{t('mbc_benefit_form_rounding_label')}</label>
        <select
          id="st-rounding"
          value={roundingStrategy}
          onChange={(e) => setRoundingStrategy(e.target.value as 'ceiling' | 'floor' | 'nearest')}
          className={styles['benefit-type-form__select']}
        >
          <option value="ceiling">{t('mbc_benefit_form_rounding_ceiling')}</option>
          <option value="floor">{t('mbc_benefit_form_rounding_floor')}</option>
          <option value="nearest">{t('mbc_benefit_form_rounding_nearest')}</option>
        </select>
      </div>
      <button
        type="submit"
        className={styles['benefit-type-form__submit-button']}
      >
        {isEditing ? t('mbc_benefit_form_submit_edit') : t('mbc_benefit_form_submit_add')}
      </button>
    </form>
  );
};

export default BenefitTypeForm;
