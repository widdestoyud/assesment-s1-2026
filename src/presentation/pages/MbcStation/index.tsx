import type { FC } from 'react';
import { useRef, useState } from 'react';
import container from '@di/container';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import { SignalButton, SignalCard, SignalCallout, SignalTypography } from '@components/SignalReact';
import PageHeader from '@components/PageHeader';
import { formatIDR, formatThousands, stripThousands } from '@utils/helpers/mbc.helper';
import styles from './mbc-station.module.css';

const QUICK_AMOUNTS = [2000, 5000, 10000, 20000, 50000, 100000];

const MbcStation: FC = () => {
  const ctrl = container.resolve<StationControllerInterface>('stationController');
  const { t } = ctrl;
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
    ctrl.onCloseResult();
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
      case 'nfc_error':
        return {
          variant: 'error' as const,
          title: t('mbc_nfc_error_title'),
          subtitle: t(ctrl.error as 'mbc_nfc_error_hardware_unavailable') ?? t('mbc_nfc_error_hardware_unavailable'),
          buttonLabel: t('mbc_station_topup_result_done_button'),
          imageSrc: ctrl.nfcErrorImage,
        };
      default:
        return null;
    }
  };


  const resultProps = getResultProps();
  const topUpAmount = Number.parseInt(ctrl.topUpAmount, 10);
  const isTopUpValid = !Number.isNaN(topUpAmount) && topUpAmount > 0;

  return (
    <div className={styles['mbc-station']}>
      <PageHeader title={String(t('mbc_station_title'))} onBack={() => window.history.back()} />
      <main className={styles['mbc-station__main']}>
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
          />
        )}

        {/* Phase: Home */}
        {nfcAvailable && ctrl.phase === 'home' && (
          <div className={styles['mbc-station__content']}>
            {/* Info Banner */}
            <SignalCallout
              variant="info"
              message={String(t('mbc_station_home_info'))}
              t={t}
              data-testid="station-info-banner"
            />

            {/* Register Card */}
            <SignalCard
              onClick={handleRegister}
              data-testid="station-register-card"
            >
              <div className={styles['mbc-station__action-card']}>
                <SignalTypography variant="h5" >
                  {t('mbc_station_register_card_title')}
                </SignalTypography>
                <SignalTypography variant="body1-regular" >
                  {t('mbc_station_register_card_description')}
                </SignalTypography>
              </div>
            </SignalCard>

            {/* Top-up Saldo */}
            <SignalCard
              onClick={handleStartTopUp}
              data-testid="station-topup-card"
            >
              <div className={styles['mbc-station__action-card']}>
                <SignalTypography variant="h5">
                  {t('mbc_station_topup_card_title')}
                </SignalTypography>
                <SignalTypography variant="body1-regular" className={styles['mbc-station__action-card-description']}>
                  {t('mbc_station_topup_card_description')}
                </SignalTypography>
              </div>
            </SignalCard>
          </div>
        )}

        {/* Phase: Top-Up form */}
        {nfcAvailable && ctrl.phase === 'topup' && (
          <div className={styles['mbc-station__content']}>
            {/* Current balance info */}
            {ctrl.cardData && (
              <SignalCard data-testid="station-balance-card">
                <div className={styles['mbc-station__balance-card']}>
                  <SignalTypography variant="body2-regular" as="p" className={styles['mbc-station__balance-label']}>
                    {t('mbc_station_current_balance')}
                  </SignalTypography>
                  <SignalTypography variant="h4" as="p" className={styles['mbc-station__balance-amount']}>
                    {formatIDR(ctrl.cardData.b)}
                  </SignalTypography>
                </div>
              </SignalCard>
            )}

            {/* Amount Input */}
            <SignalCard data-testid="station-amount-card">
              <div className={styles['mbc-station__form-card']}>
                <SignalTypography variant="body1-bold" as="p" className={styles['mbc-station__form-label']}>
                  {t('mbc_station_topup_other_nominal')}
                </SignalTypography>
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="numeric"
                  value={formatThousands(ctrl.topUpAmount)}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder={String(t('mbc_station_topup_other_placeholder'))}
                  className={styles['mbc-station__form-input']}
                />

                {/* Quick Amount Chips */}
                <SignalTypography variant="body1-bold" as="p" className={styles['mbc-station__chips-title']}>
                  {t('mbc_station_topup_nominal_title')}
                </SignalTypography>
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
            </SignalCard>

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
      </main>
    </div>
  );
};

export default MbcStation;
