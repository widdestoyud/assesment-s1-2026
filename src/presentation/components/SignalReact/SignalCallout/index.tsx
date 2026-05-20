import type { FC, ReactNode } from 'react';
import styles from './signal-callout.module.css';

export interface SignalCalloutProps {
  /** Callout visual variant */
  variant: 'info' | 'warning';
  /** Custom icon: ReactNode (component/element), image URL string, or omit for default emoji */
  icon?: ReactNode | string;
  /** Optional bold title text */
  title?: string;
  /** Info/description message */
  message: string;
  /** Optional action label (rendered as a clickable text) */
  actionLabel?: string;
  /** Callback when action is clicked */
  onAction?: () => void;
  /** Whether to show the dismiss (×) button */
  dismissible?: boolean;
  /** Callback when dismiss is clicked */
  onDismiss?: () => void;
  /** Translation function */
  /** Optional test id */
  'data-testid'?: string;
}

const SignalCallout: FC<SignalCalloutProps> = ({
  variant,
  icon,
  title,
  message,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  'data-testid': testId,
}) => {
  const renderIcon = (): ReactNode | null => {
    if (!icon) {
      return null;
    }

    if (typeof icon === 'string') {
      return (
        <img
          src={icon}
          alt=""
          className={styles['signal-callout__icon-image']}
          loading="lazy"
        />
      );
    }

    return icon;
  };

  return (
    <section
      className={`${styles['signal-callout']} ${styles[`signal-callout--${variant}`]}`}
      role="status"
      aria-label={title ?? message}
      data-testid={testId}
    >
      {icon && (
        <span className={`${styles['signal-callout__icon']} ${styles[`signal-callout__icon--${variant}`]}`} aria-hidden="true">
          {renderIcon()}
        </span>
      )}

      <div className={styles['signal-callout__content']}>
        {title && (
          <p className={styles['signal-callout__title']}>{title}</p>
        )}
        <p className={styles['signal-callout__message']}>{message}</p>
        {actionLabel && (
          <button
            type="button"
            className={styles['signal-callout__action']}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          className={styles['signal-callout__dismiss']}
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </section>
  );
};

export default SignalCallout;
