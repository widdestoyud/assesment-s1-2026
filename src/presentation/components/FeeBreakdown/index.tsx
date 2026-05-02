import type { FC } from 'react';
import type { FeeResult } from '@core/services/mbc/models';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './fee-breakdown.module.css';

export interface FeeBreakdownProps {
  feeResult: FeeResult;
  benefitTypeName: string;
}

const FeeBreakdown: FC<FeeBreakdownProps> = ({ feeResult, benefitTypeName }) => {
  return (
    <div data-testid="fee-breakdown" className={styles['fee-breakdown']}>
      <h3 className={styles['fee-breakdown__title']}>Rincian Biaya</h3>
      <dl className={styles['fee-breakdown__list']}>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>Layanan</dt>
          <dd className={styles['fee-breakdown__value']}>{benefitTypeName}</dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>Penggunaan</dt>
          <dd className={styles['fee-breakdown__value']}>
            {feeResult.usageUnits} {feeResult.unitLabel}
          </dd>
        </div>
        <div className={styles['fee-breakdown__row']}>
          <dt className={styles['fee-breakdown__label']}>Tarif</dt>
          <dd className={styles['fee-breakdown__value']}>
            {formatIDR(feeResult.ratePerUnit)} / {feeResult.unitLabel}
          </dd>
        </div>
        {feeResult.roundingApplied !== 'none' && (
          <div className={styles['fee-breakdown__row']}>
            <dt className={styles['fee-breakdown__label']}>Pembulatan</dt>
            <dd className={styles['fee-breakdown__value']}>{feeResult.roundingApplied}</dd>
          </div>
        )}
        <div className={styles['fee-breakdown__total-row']}>
          <dt>Total</dt>
          <dd>{formatIDR(feeResult.fee)}</dd>
        </div>
      </dl>
    </div>
  );
};

export default FeeBreakdown;
