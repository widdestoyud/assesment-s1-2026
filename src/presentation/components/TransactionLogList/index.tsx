import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { TransactionLogEntry, BenefitType } from '@core/services/mbc/models';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './transaction-log-list.module.css';

export interface TransactionLogListProps {
  transactions: TransactionLogEntry[];
  benefitTypes: BenefitType[];
  t: TFunction;
}

const TransactionLogList: FC<TransactionLogListProps> = ({
  transactions,
  benefitTypes,
  t,
}) => {

  const resolveServiceName = (benefitTypeId: string): string => {
    const found = benefitTypes.find((st) => st.id === benefitTypeId);
    return found?.displayName ?? benefitTypeId;
  };

  const formatTimestamp = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (transactions.length === 0) {
    return (
      <div data-testid="transaction-log" className={styles['transaction-log-list--empty']}>
        {t('mbc_transaction_empty')}
      </div>
    );
  }

  return (
    <div data-testid="transaction-log">
      <h3 className={styles['transaction-log-list__heading']}>{t('mbc_transaction_heading')}</h3>
      <ul className={styles['transaction-log-list__list']}>
        {transactions.map((tx, index) => (
          <li
            key={`${tx.timestamp}-${index}`}
            className={styles['transaction-log-list__item']}
          >
            <div>
              <p className={styles['transaction-log-list__service-name']}>{resolveServiceName(tx.benefitTypeId)}</p>
              <p className={styles['transaction-log-list__timestamp']}>{formatTimestamp(tx.timestamp)}</p>
            </div>
            <span
              className={tx.amount >= 0 ? styles['transaction-log-list__amount--positive'] : styles['transaction-log-list__amount--negative']}
            >
              {tx.amount >= 0 ? '+' : ''}
              {formatIDR(tx.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionLogList;
