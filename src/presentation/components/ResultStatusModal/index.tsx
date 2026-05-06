import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { TFunction } from 'i18next';
import styles from './result-status-modal.module.css';

export interface ResultStatusDetail {
  label: string;
  value: string;
}

export interface ResultStatusModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Result variant: success or error */
  variant: 'success' | 'error';
  /** Title text */
  title: string;
  /** Subtitle / description text */
  subtitle: string;
  /** Optional detail row (e.g. Nominal — Rp 75.000) */
  detail?: ResultStatusDetail;
  /** Button label */
  buttonLabel: string;
  /** Called when user clicks the button or dismisses the modal */
  onClose: () => void;
  /** Translation function */
  t: TFunction;
}

const ResultStatusModal: FC<ResultStatusModalProps> = ({
  isOpen,
  variant,
  title,
  subtitle,
  detail,
  buttonLabel,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isSuccess = variant === 'success';

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-status-modal-title"
      className={styles['result-status-modal__overlay']}
      onClick={handleOverlayClick}
    >
      <div className={styles['result-status-modal']}>
        {/* Icon Circle */}
        <div
          className={`${styles['result-status-modal__circle-outer']} ${
            isSuccess
              ? styles['result-status-modal__circle-outer--success']
              : styles['result-status-modal__circle-outer--error']
          }`}
        >
          <div
            className={`${styles['result-status-modal__circle-inner']} ${
              isSuccess
                ? styles['result-status-modal__circle-inner--success']
                : styles['result-status-modal__circle-inner--error']
            }`}
          >
            <span className={styles['result-status-modal__icon']} aria-hidden="true">
              {isSuccess ? '✓' : '✕'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 id="result-status-modal-title" className={styles['result-status-modal__title']}>
          {title}
        </h2>

        {/* Subtitle */}
        <p className={styles['result-status-modal__subtitle']}>
          {subtitle}
        </p>

        {/* Detail Card (optional) */}
        {detail && (
          <div className={styles['result-status-modal__detail-card']}>
            <span className={styles['result-status-modal__detail-label']}>
              {detail.label}
            </span>
            <span className={styles['result-status-modal__detail-value']}>
              {detail.value}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className={styles['result-status-modal__button']}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};

export default ResultStatusModal;
