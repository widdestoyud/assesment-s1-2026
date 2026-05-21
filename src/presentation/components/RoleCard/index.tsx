import type { FC } from 'react';
import type { TranslateFn } from '../types';
import styles from './role-card.module.css';

export interface RoleCardRole {
  id: string;
  labelKey: string;
  subtitleKey: string;
  descriptionKey: string;
  actionKey?: string;
  color: 'gate' | 'terminal' | 'station' | 'scout';
  variant: 'primary' | 'secondary';
}

export interface RoleCardProps {
  role: RoleCardRole;
  isActive: boolean;
  onSelect: () => void;
  t: TranslateFn;
}

const RoleCard: FC<RoleCardProps> = ({ role, onSelect, t }) => {
  const colorModifier = styles[`role-card--${role.color}`];
  const labelColorModifier = styles[`role-card__label--${role.color}`];

  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid={`role-card-${role.id}`}
      className={`${styles['role-card']} ${colorModifier}`}
    >
      <h3 className={`${styles['role-card__label']} ${labelColorModifier}`}>
        {String(t(role.labelKey as never))}
      </h3>
      <p className={styles['role-card__description']}>
        {String(t(role.descriptionKey as never))}
      </p>
    </button>
  );
};

export default RoleCard;
