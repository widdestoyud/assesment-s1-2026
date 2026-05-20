import type { FC, HTMLAttributes, ReactNode } from 'react';
import styles from './signal-card.module.css';

export interface SignalCardProps extends HTMLAttributes<HTMLElement> {
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

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        data-testid={testId}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      className={classes}
      data-testid={testId}
      {...rest}
    >
      {children}
    </div>
  );
};

export default SignalCard;
