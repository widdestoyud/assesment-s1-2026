import type { FC, HTMLAttributes, ReactNode } from 'react';
import styles from './signal-card.module.css';

export interface SignalCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Optional click handler — makes the card interactive */
  onClick?: () => void;
  /** Optional test id */
  'data-testid'?: string;
}

const SignalCard: FC<SignalCardProps> = ({
  children,
  className,
  onClick,
  'data-testid': testId,
  ...rest
}) => {
  const classes = [
    styles['signal-card'],
    onClick ? styles['signal-card--clickable'] : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

export default SignalCard;
