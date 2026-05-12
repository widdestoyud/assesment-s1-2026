import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { CardData } from '@src/@core/models/mbc';
import BalanceDisplay from '@components/BalanceDisplay';
import styles from './card-info-display.module.css';

export interface CardInfoDisplayProps {
  cardData: CardData;
  t: TFunction;
}

const CardInfoDisplay: FC<CardInfoDisplayProps> = ({ cardData, t }) => {
  return (
    <div data-testid="card-info-display" className={styles['card-info-display']}>
      {/* Balance */}
      <BalanceDisplay balance={cardData.b} t={t} />

      {/* Check-in Status */}
      {cardData.s === 1 && cardData.t && (
        <div className={styles['card-info-display__check-in-card']}>
          <h3 className={styles['card-info-display__check-in-label']}>{t('mbc_card_checkin_active')}</h3>
          <p className={styles['card-info-display__check-in-detail']}>
            {t('mbc_common_entry_time_label')}{' '}
            <strong>
              {new Date(cardData.t).toLocaleString('id-ID')}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default CardInfoDisplay;
