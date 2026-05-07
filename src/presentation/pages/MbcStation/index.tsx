import type { FC } from 'react';
import { useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import container from '@di/container';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import SignalButton from '@components/SignalButton';
import PageLayout from '@components/PageLayout';
import { formatIDR, formatThousands, stripThousands } from '@utils/helpers/mbc.helper';
import styles from './mbc-station.module.css';

const QUICK_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

const MbcStation: FC = () => {
  const ctrl = container.resolve<StationControllerInterface>('stationController');
  const { t } = ctrl;
  const navigate = useNavigate();
  const nfcAvailable = ctrl.nfcCapability === 'supported' || ctrl.nfcCapability === 'permission_pending';
  const [showNfcModal, setShowNfcModal] = useState(false);
  const [selectedChip, setSelectedChip] = useState<number | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const handleRegister = async () => {
    setShowNfcModal(true);
    try {
      await ctrl.onRegister();
    } finally {
      setShowNfcModal(false);
    }
  };

  const handleStartTopUp = async () => {
    setShowNfcModal(true);
    try {
      await ctrl.onStartTopUp();
    } finally {
      setShowNfcModal(false);
    }
  };

  const handleTopUpNow = async () => {
    const amount = Number.parseInt(ctrl.topUpAmount, 10);
    if (Number.isNaN(amount) || amount <= 0) return;
    setShowNfcModal(true);
    try {
      await ctrl.onTopUp(amount);
    } finally {
      setShowNfcModal(false);
    }
  };

  const handleSelectChip = (amount: number) => {
    setSelectedChip(amount);
    ctrl.setTopUpAmount(String(amount));
    setTimeout(() => amountInputRef.current?.focus(), 0);
  };

  const handleCustomAmountChange = (value: string) => {
    const raw = stripThousands(value).replace(/\D/g, '');
    setSelectedChip(null);
    ctrl.setTopUpAmount(raw);
  };

  const handleCloseNfcModal = () => {
    ctrl.onCancelScan();
    setShowNfcModal(false);
  };

  const handleCloseResult = () => {
    const wasTopUpSuccess = ctrl.resultType === 'topup_success';
    ctrl.onCloseResult();
    if (wasTopUpSuccess) {
      navigate({ to: '/' });
    }
  };

  const getResultProps = () => {
    switch (ctrl.resultType) {
      case 'register_success':
        return {
          variant: 'success' as const,
          title: t('mbc_station_register_success_title'),
          subtitle: t('mbc_station_register_success_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: ctrl.successImage,
        };
      case 'already_registered':
        return {
          variant: 'success' as const,
          title: t('mbc_station_already_registered_title'),
          subtitle: t('mbc_station_already_registered_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: ctrl.alreadyRegisteredImage,
          detail: ctrl.cardData ? { label: t('mbc_scout_card_balance_label'), value: formatIDR(ctrl.cardData.b) } : undefined,
        };
      case 'not_registered':
        return {
          variant: 'error' as const,
          title: t('mbc_station_not_registered_title'),
          subtitle: t('mbc_station_not_registered_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
        };
      case 'topup_success':
        return {
          variant: 'success' as const,
          title: t('mbc_station_topup_result_success_title'),
          subtitle: t('mbc_station_topup_result_success_subtitle'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: ctrl.successImage,
          detail: { label: t('mbc_station_topup_result_nominal_label'), value: formatIDR(ctrl.resultAmount) },
        };
      case 'topup_error':
        return {
          variant: 'error' as const,
          title: t('mbc_station_topup_result_error_title'),
          subtitle: ctrl.error ?? t('mbc_station_topup_result_error_subtitle'),
          buttonLabel: t('mbc_station_topup_result_retry_button'),
        };
      default:
        return null;
    }
  };

  const resultProps = getResultProps();
  const topUpAmount = Number.parseInt(ctrl.topUpAmount, 10);
  const isTopUpValid = !Number.isNaN(topUpAmount) && topUpAmount > 0;

  return (
    <PageLayout
      icon="🏢"
      title={t('mbc_station_title')}
      subtitle={t('mbc_station_subtitle')}
      color="blue"
    >
      <NfcCapabilityNotice status={ctrl.nfcCapability} t={t} />

      {/* NFC Scan Modal */}
      <NfcScanModal
        isOpen={showNfcModal}
        nfcStatus={ctrl.nfcStatus}
        isProcessing={ctrl.isProcessing}
        error={ctrl.error}
        onClose={handleCloseNfcModal}
        onCancel={ctrl.onCancelScan}
        scanImageSrc={ctrl.refreshImage}
        t={t}
      />

      {/* Result Modal */}
      {resultProps && (
        <ResultStatusModal
          isOpen={ctrl.resultType !== null}
          variant={resultProps.variant}
          title={resultProps.title}
          subtitle={resultProps.subtitle}
          buttonLabel={resultProps.buttonLabel}
          imageSrc={resultProps.imageSrc}
          detail={resultProps.detail}
          onClose={handleCloseResult}
          t={t}
        />
      )}

      {/* Phase: Home — 2 action buttons */}
      {nfcAvailable && ctrl.phase === 'home' && (
        <div className={styles['mbc-station__home-section']}>
          <div className={styles['mbc-station__actions-grid']}>
            <button
              type="button"
              onClick={handleRegister}
              disabled={ctrl.isProcessing}
              className={styles['mbc-station__action-button']}
            >
              {t('mbc_station_action_register')}
            </button>
            <button
              type="button"
              onClick={handleStartTopUp}
              disabled={ctrl.isProcessing}
              className={styles['mbc-station__action-button']}
            >
              {t('mbc_station_action_topup')}
            </button>
          </div>
        </div>
      )}

      {/* Phase: Top-Up form */}
      {nfcAvailable && ctrl.phase === 'topup' && (
        <div className={styles['mbc-station__form-section']}>
          {/* Current balance info */}
          {ctrl.cardData && (
            <div className={styles['mbc-station__balance-card']}>
              <p className={styles['mbc-station__balance-label']}>
                {t('mbc_station_current_balance')}
              </p>
              <p className={styles['mbc-station__balance-amount']}>
                {formatIDR(ctrl.cardData.b)}
              </p>
            </div>
          )}

          {/* Amount Input */}
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

          {/* Top-up Now Button */}
          <SignalButton
            variant="primary"
            size="xl"
            fullWidth
            onClick={handleTopUpNow}
            disabled={ctrl.isProcessing || !isTopUpValid}
          >
            {t('mbc_station_topup_now_button')}
          </SignalButton>
        </div>
      )}
    </PageLayout>
  );
};

export default MbcStation;
