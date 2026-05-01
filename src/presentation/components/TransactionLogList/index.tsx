import type { FC } from 'react';
import type { TransactionLogEntry, ServiceType } from '@core/services/mbc/models';
import { formatIDR } from '@utils/helpers/mbc.helper';
import styles from './transaction-log-list.module.css';

export interface TransactionLogListProps {
  transactions: TransactionLogEntry[];
  serviceTypes: ServiceType[];
}

const TransactionLogList: FC<TransactionLogListProps> = ({
  transactions,
  serviceTypes,
}) => {
  const resolveServiceName = (serviceTypeId: string): string => {
    const found = serviceTypes.find((st) => st.id === serviceTypeId);
    return found?.displayName ?? serviceTypeId;
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
        Belum ada riwayat transaksi
      </div>
    );
  }

  return (
    <div data-testid="transaction-log">
      <h3 className={styles['transaction-log-list__heading']}>Riwayat Transaksi</h3>
      <ul className={styles['transaction-log-list__list']}>
        {transactions.map((tx, index) => (
          <li
            key={`${tx.timestamp}-${index}`}
            className={styles['transaction-log-list__item']}
          >
            <div>
              <p className={styles['transaction-log-list__service-name']}>{resolveServiceName(tx.serviceTypeId)}</p>
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
