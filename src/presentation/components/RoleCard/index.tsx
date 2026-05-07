import type { FC } from 'react';
import type { TFunction } from 'i18next';
import type { RoleOption } from '@controllers/mbc/role-picker.controller';
import styles from './role-card.module.css';

export interface RoleCardProps {
  role: RoleOption;
  isActive: boolean;
  onSelect: () => void;
  t: TFunction;
}

const RoleCard: FC<RoleCardProps> = ({ role, onSelect, t }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`role-card-${role.id}`}
      className={`${styles['role-card']} ${styles[`role-card--${role.color}`]}`}
    >
      <span className={styles['role-card__icon']} aria-hidden="true">
        {role.icon}
      </span>
      <h3 className={`${styles['role-card__label']} ${styles[`role-card__label--${role.color}`]}`}>
        {role.label}
      </h3>
      <p className={styles['role-card__description']}>
        {String(t(role.descriptionKey as never))}
      </p>
    </button>
  );
};

export default RoleCard;
