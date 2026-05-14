import type { FC } from 'react';
import styles from './fee-breakdown.module.css';

export interface FeeBreakdownProps {
  formattedRatePerUnit: string;
  formattedFee: string;
  usageUnits: number;
  unitLabel: string;
  benefitTypeName: string;
  t: (key: string) => string;
}

const FeeBreakdown: FC<FeeBreakdownProps> = ({
  formattedRatePerUnit,
  formattedFee,
  usageUnits,
  unitLabel,
  benefitTypeName,
  t,
}) => {

  return (
    <div data-testid="fee-breakdown" className={styles['fee-breakdown']}>
      <h3 className={styles['fee-breakdown__title']}>{t('mbc_fee_title')}</h3>
      <dl className={styles['fee-breakdown__list']}>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_service_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>{benefitTypeName}</dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_terminal_duration_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>
            {usageUnits} {unitLabel}
          </dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_rate_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>
            {formattedRatePerUnit} / {unitLabel}
          </dd>
        </div>
        <div className={styles['fee-breakdown__total-row']}>
          <dt>{t('mbc_fee_total_label')}</dt>
          <dd>{formattedFee}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FeeBreakdown;
