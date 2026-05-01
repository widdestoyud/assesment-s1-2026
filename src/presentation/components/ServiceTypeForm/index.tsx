import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import type { ServiceType } from '@core/services/mbc/models';
import styles from './service-type-form.module.css';

export interface ServiceTypeFormProps {
  onSubmit: (data: ServiceType) => void;
  initialValues?: Partial<ServiceType>;
  isEditing?: boolean;
}

const ServiceTypeForm: FC<ServiceTypeFormProps> = ({
  onSubmit,
  initialValues,
  isEditing = false,
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
    <form onSubmit={handleSubmit} data-testid="service-type-form" className={styles['service-type-form']}>
      <div>
        <label htmlFor="st-id" className={styles['service-type-form__label']}>ID</label>
        <input
          id="st-id"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          disabled={isEditing}
          placeholder="parking"
          pattern="^[a-z0-9-]+$"
          required
          className={styles['service-type-form__input--disabled']}
        />
      </div>
      <div>
        <label htmlFor="st-name" className={styles['service-type-form__label']}>Nama</label>
        <input
          id="st-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Parkir"
          required
          className={styles['service-type-form__input']}
        />
      </div>
      <div>
        <label htmlFor="st-activity" className={styles['service-type-form__label']}>Activity Type</label>
        <input
          id="st-activity"
          type="text"
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          placeholder="parking-fee"
          pattern="^[a-z0-9-]+$"
          required
          className={styles['service-type-form__input']}
        />
      </div>
      <div>
        <label htmlFor="st-rate" className={styles['service-type-form__label']}>Tarif (Rp)</label>
        <input
          id="st-rate"
          type="number"
          value={ratePerUnit}
          onChange={(e) => setRatePerUnit(e.target.value)}
          min="1"
          required
          className={styles['service-type-form__input']}
        />
      </div>
      <div>
        <label htmlFor="st-unit" className={styles['service-type-form__label']}>Tipe Unit</label>
        <select
          id="st-unit"
          value={unitType}
          onChange={(e) => setUnitType(e.target.value as 'per-hour' | 'per-visit' | 'flat-fee')}
          className={styles['service-type-form__select']}
        >
          <option value="per-hour">Per Jam</option>
          <option value="per-visit">Per Kunjungan</option>
          <option value="flat-fee">Flat Fee</option>
        </select>
      </div>
      <div>
        <label htmlFor="st-rounding" className={styles['service-type-form__label']}>Pembulatan</label>
        <select
          id="st-rounding"
          value={roundingStrategy}
          onChange={(e) => setRoundingStrategy(e.target.value as 'ceiling' | 'floor' | 'nearest')}
          className={styles['service-type-form__select']}
        >
          <option value="ceiling">Ke Atas (Ceiling)</option>
          <option value="floor">Ke Bawah (Floor)</option>
          <option value="nearest">Terdekat (Nearest)</option>
        </select>
      </div>
      <button
        type="submit"
        className={styles['service-type-form__submit-button']}
      >
        {isEditing ? 'Simpan Perubahan' : 'Tambah Service Type'}
      </button>
    </form>
  );
};

export default ServiceTypeForm;
