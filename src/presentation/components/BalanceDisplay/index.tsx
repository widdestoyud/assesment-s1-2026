import type { FC } from 'react';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './balance-display.module.css';

export interface BalanceDisplayProps {
  balance: number;
  previousBalance?: number;
  changeAmount?: number;
}

const BalanceDisplay: FC<BalanceDisplayProps> = ({
  balance,
  previousBalance,
  changeAmount,
}) => {
  return (
    <div data-testid="balance-display" className={styles['balance-display']}>
      <p className={styles['balance-display__label']}>Saldo</p>
      <p className={styles['balance-display__amount']}>{formatIDR(balance)}</p>
      {previousBalance !== undefined && changeAmount !== undefined && (
        <div className={styles['balance-display__change-row']}>
          <span>{formatIDR(previousBalance)}</span>
          <span className={changeAmount >= 0 ? styles['balance-display__change--positive'] : styles['balance-display__change--negative']}>
            {' '}
            {changeAmount >= 0 ? '+' : ''}
            {formatIDR(changeAmount)}
          </span>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;
