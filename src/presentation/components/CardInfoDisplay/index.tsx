import type { FC } from 'react';
import BalanceDisplay from '@components/BalanceDisplay';
import styles from './card-info-display.module.css';

export interface CardInfoProps {
  formattedBalance: string;
  isCheckedIn: boolean;
  formattedEntryTime?: string;
}

export interface CardInfoDisplayProps {
  cardInfo: CardInfoProps;
  t: (key: string) => string;
}

const CardInfoDisplay: FC<CardInfoDisplayProps> = ({ cardInfo, t }) => {
  return (
    <div data-testid="card-info-display" className={styles['card-info-display']}>
      <BalanceDisplay formattedBalance={cardInfo.formattedBalance} t={t} />

      {cardInfo.isCheckedIn && cardInfo.formattedEntryTime && (
        <div className={styles['card-info-display__check-in-card']}>
          <h3 className={styles['card-info-display__check-in-label']}>
            {t('mbc_card_checkin_active')}
          </h3>
          <p className={styles['card-info-display__check-in-detail']}>
            {t('mbc_common_entry_time_label')}{' '}
            <strong>{cardInfo.formattedEntryTime}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default CardInfoDisplay;
