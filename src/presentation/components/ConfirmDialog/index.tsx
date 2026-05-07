import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import styles from './confirm-dialog.module.css';

export interface ConfirmDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Optional icon (emoji or text) */
  icon?: string;
  /** Dialog title */
  title: string;
  /** Dialog message / description */
  message: string;
  /** Label for the confirm (primary) button */
  confirmLabel: string;
  /** Label for the cancel (secondary) button */
  cancelLabel: string;
  /** Called when user confirms */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  // Prevent body scroll when dialog is open
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onCancel();
    }
  };

  return (
    <div
      ref={overlayRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className={styles['confirm-dialog__overlay']}
      onClick={handleOverlayClick}
    >
      <div className={styles['confirm-dialog']}>
        {icon && (
          <p className={styles['confirm-dialog__icon']} aria-hidden="true">
            {icon}
          </p>
        )}

        <h2 id="confirm-dialog-title" className={styles['confirm-dialog__title']}>
          {title}
        </h2>

        <p id="confirm-dialog-message" className={styles['confirm-dialog__message']}>
          {message.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < message.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>

        <div className={styles['confirm-dialog__actions']}>
          <button
            type="button"
            onClick={onConfirm}
            className={styles['confirm-dialog__button--primary']}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={styles['confirm-dialog__button--secondary']}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
