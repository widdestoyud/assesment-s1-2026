import type { FC } from 'react';
import type { CardData, ServiceType } from '@core/services/mbc/models';
import BalanceDisplay from '@components/BalanceDisplay';
import TransactionLogList from '@components/TransactionLogList';

export interface CardInfoDisplayProps {
  cardData: CardData;
  serviceTypes: ServiceType[];
}

const CardInfoDisplay: FC<CardInfoDisplayProps> = ({ cardData, serviceTypes }) => {
  const resolveServiceName = (serviceTypeId: string): string => {
    const found = serviceTypes.find((st) => st.id === serviceTypeId);
    return found?.displayName ?? serviceTypeId;
  };

  return (
    <div data-testid="card-info-display" className="space-y-4">
      {/* Member Identity */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500">Identitas Member</h3>
        <p className="text-xl font-bold">{cardData.member.name}</p>
        <p className="text-sm text-gray-500">ID: {cardData.member.memberId}</p>
      </div>

      {/* Balance */}
      <BalanceDisplay balance={cardData.balance} />

      {/* Check-in Status */}
      {cardData.checkIn && (
        <div className="rounded-lg bg-orange-50 p-4">
          <h3 className="text-sm font-semibold text-orange-700">Status Check-In Aktif</h3>
          <p className="text-sm">
            Layanan: <strong>{resolveServiceName(cardData.checkIn.serviceTypeId)}</strong>
          </p>
          <p className="text-sm">
            Waktu masuk:{' '}
            <strong>
              {new Date(cardData.checkIn.timestamp).toLocaleString('id-ID')}
            </strong>
          </p>
        </div>
      )}

      {/* Transaction Log */}
      <TransactionLogList
        transactions={cardData.transactions}
        serviceTypes={serviceTypes}
      />
    </div>
  );
};

export default CardInfoDisplay;
