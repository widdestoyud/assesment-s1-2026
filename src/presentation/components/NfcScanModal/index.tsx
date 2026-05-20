import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { ChipTransferStatus, TranslateFn } from '../types';
import styles from './nfc-scan-modal.module.css';

export interface NfcScanModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Current chip transfer operation status */
  chipTransferStatus: ChipTransferStatus;
  /** Whether an NFC operation is in progress */
  isProcessing: boolean;
  /** Optional error message to display */
  error?: string | null;
  /** Called when user closes the modal (cancel) */
  onClose: () => void;
  /** Called when user wants to cancel an ongoing scan */
  onCancel?: () => void;
  /** Called when user wants to retry after error */
  onRetry?: () => void;
  /** Translation function */
  t: TranslateFn;
  /** Optional custom title override */
  title?: string;
  /** Optional custom subtitle override */
  subtitle?: string;
  /** Optional image to display instead of emoji during scanning/waiting */
  scanImageSrc?: string;
}

const NfcScanModal: FC<NfcScanModalProps> = ({
  isOpen,
  chipTransferStatus,
  isProcessing,
  error,
  onClose,
  onCancel,
  onRetry,
  t,
  title,
  subtitle,
  scanImageSrc,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isProcessing && onCancel) {
          onCancel();
        }
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose, onCancel]);

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

  const isScanning = chipTransferStatus === 'idle' || chipTransferStatus === 'scanning';
  const isWorking = chipTransferStatus === 'reading' || chipTransferStatus === 'writing' || chipTransferStatus === 'verifying';
  const isSuccess = chipTransferStatus === 'success';
  const isError = chipTransferStatus === 'error';

  const getCircleModifier = (): string => {
    if (isSuccess) return styles['nfc-scan-modal__circle--success'];
    if (isError) return styles['nfc-scan-modal__circle--error'];
    if (isScanning || isWorking) return styles['nfc-scan-modal__circle--scanning'];
    return '';
  };

  const getIcon = (): string => {
    if (isSuccess) return '✅';
    if (isError) return '❌';
    return '📶';
  };

  const getLabel = (): string => {
    if (isSuccess) return t('mbc_nfc_status_success');
    if (isError) return t('mbc_nfc_status_error');
    if (chipTransferStatus === 'reading') return t('mbc_nfc_status_reading');
    if (chipTransferStatus === 'writing') return t('mbc_nfc_status_writing');
    if (chipTransferStatus === 'verifying') return t('mbc_nfc_status_verifying');
    return t('mbc_nfc_scan_modal_waiting');
  };

  const getLabelModifier = (): string => {
    if (isSuccess) return styles['nfc-scan-modal__label--success'];
    if (isError) return styles['nfc-scan-modal__label--error'];
    return '';
  };

  const displayTitle = title ?? t('mbc_nfc_scan_modal_title');
  const displaySubtitle = subtitle ?? t('mbc_nfc_scan_modal_subtitle');

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      if (isProcessing && onCancel) {
        onCancel();
      }
      onClose();
    }
  };

  const handleClose = () => {
    if (isProcessing && onCancel) {
      onCancel();
    }
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nfc-scan-modal-title"
      className={styles['nfc-scan-modal__overlay']}
      onClick={handleOverlayClick}
      onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
    >
      <div className={styles['nfc-scan-modal']}>
        {/* Close / Cancel button — always available */}
        <button
          type="button"
          onClick={handleClose}
          aria-label={t('mbc_nfc_scan_modal_close')}
          className={styles['nfc-scan-modal__close']}
        >
          ✕
        </button>

        {/* Title */}
        <h2 id="nfc-scan-modal-title" className={styles['nfc-scan-modal__title']}>
          {displayTitle}
        </h2>

        {/* Subtitle */}
        <p className={styles['nfc-scan-modal__subtitle']}>
          {displaySubtitle}
        </p>

        {/* NFC Circle with ripple animation */}
        <div className={styles['nfc-scan-modal__circle-wrapper']}>
          {/* Ripple rings (only when scanning/waiting) */}
          {(isScanning || isWorking) && (
            <>
              <span className={styles['nfc-scan-modal__ripple']} aria-hidden="true" />
              <span className={`${styles['nfc-scan-modal__ripple']} ${styles['nfc-scan-modal__ripple--delayed']}`} aria-hidden="true" />
              <span className={`${styles['nfc-scan-modal__ripple']} ${styles['nfc-scan-modal__ripple--delayed-2']}`} aria-hidden="true" />
            </>
          )}

          <div
            role="status"
            aria-live="polite"
            aria-busy={isProcessing}
            className={`${styles['nfc-scan-modal__circle']} ${getCircleModifier()}`}
          >
            {scanImageSrc && (isScanning || isWorking) ? (
              <img
                src={scanImageSrc}
                alt=""
                aria-hidden="true"
                className={styles['nfc-scan-modal__scan-image']}
              />
            ) : (
              <span className={styles['nfc-scan-modal__icon']} aria-hidden="true">
                {getIcon()}
              </span>
            )}
           
          </div>
        </div>

         <span className={`${styles['nfc-scan-modal__label']} ${getLabelModifier()}`}>
            {getLabel()}
        </span>

        {/* Error message */}
        {isError && error && (
          <div className={styles['nfc-scan-modal__error']} role="alert">
            {error}
          </div>
        )}

        {/* Retry button */}
        {isError && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={styles['nfc-scan-modal__retry']}
          >
            {t('mbc_nfc_scan_modal_retry')}
          </button>
        )}


      </div>
    </div>
  );
};

export default NfcScanModal;
