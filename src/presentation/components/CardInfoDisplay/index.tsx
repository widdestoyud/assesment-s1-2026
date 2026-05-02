import type { FC } from 'react';
import type { CardData, BenefitType } from '@core/services/mbc/models';
import BalanceDisplay from '@components/BalanceDisplay';
import TransactionLogList from '@components/TransactionLogList';
import styles from './card-info-display.module.css';

export interface CardInfoDisplayProps {
  cardData: CardData;
  benefitTypes: BenefitType[];
}

const CardInfoDisplay: FC<CardInfoDisplayProps> = ({ cardData, benefitTypes }) => {
  const resolveServiceName = (benefitTypeId: string): string => {
    const found = benefitTypes.find((st) => st.id === benefitTypeId);
    return found?.displayName ?? benefitTypeId;
  };

  return (
    <div data-testid="card-info-display" className={styles['card-info-display']}>
      {/* Member Identity */}
      <div className={styles['card-info-display__member-card']}>
        <h3 className={styles['card-info-display__member-label']}>Identitas Member</h3>
        <p className={styles['card-info-display__member-name']}>{cardData.member.name}</p>
        <p className={styles['card-info-display__member-id']}>ID: {cardData.member.memberId}</p>
      </div>

      {/* Balance */}
      <BalanceDisplay balance={cardData.balance} />

      {/* Check-in Status */}
      {cardData.checkIn && (
        <div className={styles['card-info-display__check-in-card']}>
          <h3 className={styles['card-info-display__check-in-label']}>Status Check-In Aktif</h3>
          <p className={styles['card-info-display__check-in-detail']}>
            Layanan: <strong>{resolveServiceName(cardData.checkIn.benefitTypeId)}</strong>
          </p>
          <p className={styles['card-info-display__check-in-detail']}>
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
        benefitTypes={benefitTypes}
      />
    </div>
  );
};

export default CardInfoDisplay;
