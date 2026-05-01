import type { FC } from 'react';
import type { TransactionLogEntry, ServiceType } from '@core/services/mbc/models';
import { formatIDR } from '@utils/helpers/mbc.helper';

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
      <div data-testid="transaction-log" className="py-4 text-center text-sm text-gray-400">
        Belum ada riwayat transaksi
      </div>
    );
  }

  return (
    <div data-testid="transaction-log">
      <h3 className="mb-2 text-sm font-semibold text-gray-600">Riwayat Transaksi</h3>
      <ul className="space-y-2">
        {transactions.map((tx, index) => (
          <li
            key={`${tx.timestamp}-${index}`}
            className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium">{resolveServiceName(tx.serviceTypeId)}</p>
              <p className="text-xs text-gray-400">{formatTimestamp(tx.timestamp)}</p>
            </div>
            <span
              className={tx.amount >= 0 ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}
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
