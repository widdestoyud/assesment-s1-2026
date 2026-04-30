import React, { ReactNode, useEffect } from 'react';
import styles from '@components/ResponsiveDialog/responsive-dialog.module.scss';

export type ResponsiveDialogProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const ResponsiveDialog: React.FC<ResponsiveDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className={styles.rdBackdrop} />

      {/* Dialog/Bottom Sheet Container */}
      <div
        className={styles.rdWrapper}
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className={styles.rdContainer} data-testid="dialog-container">
          {/* Header */}
          <div className={styles.rdTitleContainer}>
            {title && (
              <h3 id="dialog-title" className={styles.rdTitle}>
                {title}
              </h3>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className={styles.rdCloseButton}
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Content */}
          <div className={styles.rdChildContainer}>{children}</div>

          {/* Footer - optional */}
          {footer && <div className={styles.rdFooterContainer}>{footer}</div>}
        </div>
      </div>
    </>
  );
};

export default ResponsiveDialog;
