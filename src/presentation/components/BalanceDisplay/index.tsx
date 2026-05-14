import type { FC } from 'react';
import styles from './balance-display.module.css';

export interface BalanceDisplayProps {
  formattedBalance: string;
  formattedPreviousBalance?: string;
  formattedChangeAmount?: string;
  isPositiveChange?: boolean;
  t: (key: string) => string;
}

const BalanceDisplay: FC<BalanceDisplayProps> = ({
  formattedBalance,
  formattedPreviousBalance,
  formattedChangeAmount,
  isPositiveChange,
  t,
}) => {
  return (
    <div data-testid="balance-display" className={styles['balance-display']}>
      <p className={styles['balance-display__label']}>{t('mbc_balance_label')}</p>
      <p className={styles['balance-display__amount']}>{formattedBalance}</p>
      {formattedPreviousBalance !== undefined && formattedChangeAmount !== undefined && (
        <div className={styles['balance-display__change-row']}>
          <span>{formattedPreviousBalance}</span>
          <span className={isPositiveChange ? styles['balance-display__change--positive'] : styles['balance-display__change--negative']}>
            {' '}
            {isPositiveChange ? '+' : ''}
            {formattedChangeAmount}
          </span>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;
