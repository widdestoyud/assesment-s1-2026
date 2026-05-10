import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { FeeResult } from '@src/@core/models/mbc';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './fee-breakdown.module.css';

export interface FeeBreakdownProps {
  feeResult: FeeResult;
  benefitTypeName: string;
  t: TFunction;
}

const FeeBreakdown: FC<FeeBreakdownProps> = ({ feeResult, benefitTypeName, t }) => {

  return (
    <div data-testid="fee-breakdown" className={styles['fee-breakdown']}>
      <h3 className={styles['fee-breakdown__title']}>{t('mbc_fee_title')}</h3>
      <dl className={styles['fee-breakdown__list']}>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_service_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>{benefitTypeName}</dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_usage_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>
            {feeResult.usageUnits} {feeResult.unitLabel}
          </dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_rate_label')}</dt>
          <dd className={styles['fee-breakdown__value']}>
            {formatIDR(feeResult.ratePerUnit)} / {feeResult.unitLabel}
          </dd>
        </div>
        {feeResult.roundingApplied !== 'none' && (
          <div className={styles['fee-breakdown__row']}>
            <dt className={styles['fee-breakdown__label']}>{t('mbc_fee_rounding_label')}</dt>
            <dd className={styles['fee-breakdown__value']}>{feeResult.roundingApplied}</dd>
          </div>
        )}
        <div className={styles['fee-breakdown__total-row']}>
          <dt>{t('mbc_fee_total_label')}</dt>
          <dd>{formatIDR(feeResult.fee)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FeeBreakdown;
