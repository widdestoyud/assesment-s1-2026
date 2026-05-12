import type { FC, ReactNode } from 'react';
import styles from './signal-snack-bar.module.css';

export interface SignalSnackBarProps {
  /** Snackbar visual variant */
  variant: 'dark' | 'warning';
  /** Message text */
  message: string;
  /** Position fixed to top or bottom of the screen (for standalone usage) */
  position?: 'top' | 'bottom';
  /** Optional action element (button, icon, link) — consumer controls the CTA */
  action?: ReactNode;
  /** Whether the snackbar is visible */
  visible?: boolean;
  /** Optional test id */
  'data-testid'?: string;
}

const SignalSnackBar: FC<SignalSnackBarProps> = ({
  variant,
  message,
  position,
  action,
  visible = true,
  'data-testid': testId,
}) => {
  if (!visible) return null;

  const positionClass = position ? styles[`signal-snack-bar--${position}`] : '';

  return (
    <div
      className={`${styles['signal-snack-bar']} ${styles[`signal-snack-bar--${variant}`]} ${positionClass}`}
      role="status"
      aria-live="polite"
      data-testid={testId}
    >
      <span className={styles['signal-snack-bar__message']}>{message}</span>
      {action && (
        <span className={styles['signal-snack-bar__action']}>
          {action}
        </span>
      )}
    </div>
  );
};

export default SignalSnackBar;
