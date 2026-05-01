import type { FC } from 'react';
import type { RoleOption } from '@controllers/mbc/role-picker.controller';
import styles from './role-card.module.css';

export interface RoleCardProps {
  role: RoleOption;
  isActive: boolean;
  onSelect: () => void;
}

const RoleCard: FC<RoleCardProps> = ({ role, isActive, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`role-card-${role.id}`}
      aria-pressed={isActive}
      className={`${styles['role-card']} ${isActive ? styles['role-card--active'] : styles['role-card--default']}`}
    >
      <span className={styles['role-card__icon']} aria-hidden="true">
        {role.icon}
      </span>
      <h3 className={styles['role-card__label']}>{role.label}</h3>
      <p className={styles['role-card__description']}>{role.description}</p>
    </button>
  );
};

export default RoleCard;
