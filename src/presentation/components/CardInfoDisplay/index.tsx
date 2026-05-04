import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { CardData, BenefitType } from '@core/services/mbc/models';
import BalanceDisplay from '@components/BalanceDisplay';
import TransactionLogList from '@components/TransactionLogList';
import styles from './card-info-display.module.css';

export interface CardInfoDisplayProps {
  cardData: CardData;
  benefitTypes: BenefitType[];
  t: TFunction;
}

const CardInfoDisplay: FC<CardInfoDisplayProps> = ({ cardData, benefitTypes, t }) => {

  const resolveServiceName = (benefitTypeId: string): string => {
    const found = benefitTypes.find((st) => st.id === benefitTypeId);
    return found?.displayName ?? benefitTypeId;
  };

  return (
    <div data-testid="card-info-display" className={styles['card-info-display']}>
      {/* Member Identity */}
      <div className={styles['card-info-display__member-card']}>
        <h3 className={styles['card-info-display__member-label']}>{t('mbc_card_member_identity')}</h3>
        <p className={styles['card-info-display__member-name']}>{cardData.member.name}</p>
        <p className={styles['card-info-display__member-id']}>{t('mbc_card_member_id_prefix')} {cardData.member.memberId}</p>
      </div>

      {/* Balance */}
      <BalanceDisplay balance={cardData.balance} t={t} />

      {/* Check-in Status */}
      {cardData.checkIn && (
        <div className={styles['card-info-display__check-in-card']}>
          <h3 className={styles['card-info-display__check-in-label']}>{t('mbc_card_checkin_active')}</h3>
          <p className={styles['card-info-display__check-in-detail']}>
            {t('mbc_card_service_label')} <strong>{resolveServiceName(cardData.checkIn.benefitTypeId)}</strong>
          </p>
          <p className={styles['card-info-display__check-in-detail']}>
            {t('mbc_card_entry_time_label')}{' '}
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
        t={t}
      />
    </div>
  );
};

export default CardInfoDisplay;
