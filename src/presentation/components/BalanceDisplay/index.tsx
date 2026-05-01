import type { FC } from 'react';
import { formatIDR } from '@utils/helpers/mbc.helper';

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
    <div data-testid="balance-display" className="rounded-lg bg-blue-50 p-4">
      <p className="text-sm text-gray-600">Saldo</p>
      <p className="text-2xl font-bold text-blue-700">{formatIDR(balance)}</p>
      {previousBalance !== undefined && changeAmount !== undefined && (
        <div className="mt-2 text-sm text-gray-500">
          <span>{formatIDR(previousBalance)}</span>
          <span className={changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
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
