import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import container from '@di/container';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import ConfirmDialog from '@components/ConfirmDialog';
import { formatIDR, formatThousands, stripThousands } from '@utils/helpers/mbc.helper';
import styles from './mbc-station.module.css';

const QUICK_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

const MbcStation: FC = () => {
  const ctrl = container.resolve<StationControllerInterface>('stationController');
  const { t } = ctrl;
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultVariant, setResultVariant] = useState<'success' | 'error'>('success');
  const [resultAmount, setResultAmount] = useState(0);
  const [resultError, setResultError] = useState<string | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when entering topup phase
  useEffect(() => {
    if (ctrl.phase === 'topup' && amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, [ctrl.phase]);

  const handleTapCard = async () => {
    setShowNfcModal(true);
    try {
      await ctrl.onTapCard();
      setTimeout(() => setShowNfcModal(false), 800);
    } catch {
      // Keep modal open to show error with retry option
    }
  };

  const handleTopUpNow = async () => {
    const amount = Number.parseInt(ctrl.topUpAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) return;
    setResultAmount(amount);
    setShowNfcModal(true);
    try {
      await ctrl.onTopUp(amount);
      setShowNfcModal(false);
      setResultVariant('success');
      setResultError(null);
      setShowResultModal(true);
    } catch {
      setShowNfcModal(false);
      setResultVariant('error');
      setResultError(ctrl.error);
      setShowResultModal(true);
    }
  };

  const handleSelectChip = (amount: number) => {
    setSelectedChip(amount);
    ctrl.setTopUpAmount(String(amount));
    // Focus input after chip selection
    setTimeout(() => amountInputRef.current?.focus(), 0);
  };

  const handleCustomAmountChange = (value: string) => {
    const raw = stripThousands(value).replace(/\D/g, '');
    setSelectedChip(null);
    ctrl.setTopUpAmount(raw);
  };

  const handleCloseModal = () => {
    ctrl.onCancelScan();
    setShowNfcModal(false);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    if (resultVariant === 'success') {
      ctrl.onGoToTopUp();
    }
  };

  const handleRetry = () => {
    if (ctrl.phase === 'topup') {
      handleTopUpNow();
    } else {
      handleTapCard();
    }
  };

  const topUpAmount = Number.parseInt(ctrl.topUpAmount, 10);
  const isTopUpValid = !Number.isNaN(topUpAmount) && topUpAmount > 0;

  return (
    <main className={styles['mbc-station']}>
      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {/* NFC Scan Modal */}
      <NfcScanModal
        isOpen={showNfcModal}
        nfcStatus={ctrl.nfcStatus}
        isProcessing={ctrl.isProcessing}
        error={ctrl.error}
        onClose={handleCloseModal}
        onCancel={ctrl.onCancelScan}
        onRetry={handleRetry}
        t={t}
      />

      {/* Top-Up Result Modal */}
      <ResultStatusModal
        isOpen={showResultModal}
        variant={resultVariant}
        title={
          resultVariant === 'success'
            ? t('mbc_station_topup_result_success_title')
            : t('mbc_station_topup_result_error_title')
        }
        subtitle={
          resultVariant === 'success'
            ? t('mbc_station_topup_result_success_subtitle')
            : (resultError ?? t('mbc_station_topup_result_error_subtitle'))
        }
        detail={{
          label: t('mbc_station_topup_result_nominal_label'),
          value: formatIDR(resultAmount),
        }}
        buttonLabel={
          resultVariant === 'success'
            ? t('mbc_station_topup_result_done_button')
            : t('mbc_station_topup_result_retry_button')
        }
        onClose={handleCloseResultModal}
        t={t}
      />

      {/* Register Confirmation Dialog */}
      <ConfirmDialog
        isOpen={ctrl.pendingRegister}
        icon="⚠️"
        title={t('mbc_station_register_confirm_title')}
        message={t('mbc_station_register_confirm_message')}
        confirmLabel={t('mbc_station_register_confirm_button')}
        cancelLabel={t('mbc_station_register_cancel_button')}
        onConfirm={ctrl.onConfirmRegister}
        onCancel={ctrl.onCancelRegister}
      />      {/* Phase: Tap (Home) */}
      {nfcAvailable && ctrl.phase === 'tap' && (
        <>

          {/* NFC Tap Area */}
          <div className={styles['mbc-station__nfc-area']}>
            <button
              type="button"
              onClick={handleTapCard}
              disabled={ctrl.isProcessing}
              aria-label={t('mbc_station_nfc_tap_label')}
              className={styles['mbc-station__nfc-circle']}
            >
              <span className={styles['mbc-station__nfc-icon']} aria-hidden="true">
                📶
              </span>
              <span className={styles['mbc-station__nfc-label']}>
                {t('mbc_station_nfc_tap_label')}
              </span>
              <span className={styles['mbc-station__nfc-sublabel']}>
                {t('mbc_station_nfc_tap_sublabel')}
              </span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className={styles['mbc-station__actions-section']}>
            <p className={styles['mbc-station__actions-title']}>
              {t('mbc_station_quick_actions_title')}
            </p>
            <div className={styles['mbc-station__actions-grid']}>
              <button
                type="button"
                onClick={handleTapCard}
                disabled={ctrl.isProcessing}
                className={styles['mbc-station__action-button']}
              >
                {t('mbc_station_action_topup')}
              </button>
              <button
                type="button"
                onClick={handleTapCard}
                disabled={ctrl.isProcessing}
                className={styles['mbc-station__action-button']}
              >
                {t('mbc_station_action_register')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Phase: Top-Up (after NFC read success) */}
      {nfcAvailable && ctrl.phase === 'topup' && (
        <div className={styles['mbc-station__form-section']}>
          {/* Other Amount Input */}
          <div className={styles['mbc-station__other-section']}>
            <p className={styles['mbc-station__other-label']}>
              {t('mbc_station_topup_other_nominal')}
            </p>
            <input
              ref={amountInputRef}
              type="text"
              inputMode="numeric"
              value={formatThousands(ctrl.topUpAmount)}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              placeholder={t('mbc_station_topup_other_placeholder')}
              className={styles['mbc-station__other-input']}
            />
          </div>

          {/* Quick Amount Chips */}
          <div className={styles['mbc-station__chips-section']}>
            <p className={styles['mbc-station__chips-title']}>
              {t('mbc_station_topup_nominal_title')}
            </p>
            <div className={styles['mbc-station__chips-grid']}>
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleSelectChip(amount)}
                  className={`${styles['mbc-station__chip']} ${selectedChip === amount ? styles['mbc-station__chip--active'] : ''}`}
                >
                  Rp{amount.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>

          

          {/* Error (non-modal) */}
          {ctrl.error && !showNfcModal && (
            <div role="alert" className={styles['mbc-station__error-alert']}>
              {ctrl.error}
            </div>
          )}

          {/* Top-up Now Button */}
          <button
            type="button"
            onClick={handleTopUpNow}
            disabled={ctrl.isProcessing || !isTopUpValid}
            className={styles['mbc-station__topup-button']}
          >
            {t('mbc_station_topup_now_button')}
          </button>
        </div>
      )}

      {/* Phase: Balance (after top-up success) */}
      {nfcAvailable && ctrl.phase === 'balance' && ctrl.cardData && (
        <div className={styles['mbc-station__section']}>
          <div className={styles['mbc-station__success-output']}>
            {t('mbc_station_validation_success')}
          </div>
          <div className={styles['mbc-station__balance-card']}>
            <p className={styles['mbc-station__balance-label']}>
              {t('mbc_station_current_balance')}
            </p>
            <p className={styles['mbc-station__balance-amount']}>
              {formatIDR(ctrl.cardData.b)}
            </p>
          </div>
          <button
            type="button"
            onClick={ctrl.onGoToTopUp}
            className={styles['mbc-station__secondary-button']}
          >
            {t('mbc_station_topup_again_button')}
          </button>
        </div>
      )}
    </main>
  );
};

export default MbcStation;
