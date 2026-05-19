import type { FC } from 'react';
import container from '@di/container';
import type { StationControllerInterface } from '@controllers/mbc/station.controller';
import PageHeader from '@components/PageHeader';
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';
import NfcScanModal from '@components/NfcScanModal';
import ResultStatusModal from '@components/ResultStatusModal';
import { SignalButton, SignalCard, SignalCallout, SignalTypography } from '@components/SignalReact';
import styles from './mbc-station.module.css';

const MbcStation: FC = () => {
  const ctrl = container.resolve<StationControllerInterface>('stationController');
  const {
    t,
    pageTitle,
    onBack,
    chipTransferCapability,
    chipTransferAvailable,
    onNfcNoticeClose,
    chipTransferFailedImage,
    showNfcModal,
    chipTransferStatus,
    isProcessing,
    error,
    onCloseNfcModal,
    onCancelScan,
    scanImage,
    resultProps,
    resultType,
    onCloseResult,
    onRegister,
    onStartTopUp,
    onTopUpNow,
    phase,
    formattedTopUpAmount,
    isTopUpValid,
    topUpError,
    selectedChip,
    quickAmounts,
    onSelectChip,
    onCustomAmountChange,
    formattedBalance,
    cardData,
  } = ctrl;

  return (
    <div className={styles['mbc-station']}>
      <PageHeader title={pageTitle} onBack={onBack} />
      <main className={styles['mbc-station__main']}>
        <NfcCapabilityNotice status={chipTransferCapability} onClose={onNfcNoticeClose} imageSrc={chipTransferFailedImage} t={t} />

        <NfcScanModal
          isOpen={showNfcModal}
          chipTransferStatus={chipTransferStatus}
          isProcessing={isProcessing}
          error={error}
          onClose={onCloseNfcModal}
          onCancel={onCancelScan}
          scanImageSrc={scanImage}
          t={t}
        />

        {resultProps && (
          <ResultStatusModal
            isOpen={resultType !== null}
            variant={resultProps.variant}
            title={resultProps.title}
            subtitle={resultProps.subtitle}
            buttonLabel={resultProps.buttonLabel}
            imageSrc={resultProps.imageSrc}
            detail={resultProps.detail}
            onClose={onCloseResult}
          />
        )}

        {/* Phase: Home */}
        {chipTransferAvailable && phase === 'home' && (
          <div className={styles['mbc-station__content']}>
            {/* Info Banner */}
            <SignalCallout
              variant="info"
              message={String(t('mbc_station_home_info'))}
              data-testid="station-info-banner"
            />

            {/* Register Card */}
            <SignalCard
              onClick={onRegister}
              data-testid="station-register-card"
            >
              <div className={styles['mbc-station__action-card']}>
                <SignalTypography variant="h5">
                  {t('mbc_station_register_card_title')}
                </SignalTypography>
                <SignalTypography variant="body1-regular">
                  {t('mbc_station_register_card_description')}
                </SignalTypography>
              </div>
            </SignalCard>

            {/* Top-up Saldo */}
            <SignalCard
              onClick={onStartTopUp}
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
        {chipTransferAvailable && phase === 'topup' && (
          <div className={styles['mbc-station__content']}>
            {/* Current balance info */}
            {cardData && (
              <SignalCard data-testid="station-balance-card">
                <div className={styles['mbc-station__balance-card']}>
                  <SignalTypography variant="body2-regular" as="p" className={styles['mbc-station__balance-label']}>
                    {t('mbc_station_current_balance')}
                  </SignalTypography>
                  <SignalTypography variant="h4" as="p" className={styles['mbc-station__balance-amount']}>
                    {formattedBalance}
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
                  type="text"
                  inputMode="numeric"
                  value={formattedTopUpAmount}
                  onChange={(e) => onCustomAmountChange(e.target.value)}
                  placeholder={String(t('mbc_station_topup_other_placeholder'))}
                  className={`${styles['mbc-station__form-input']} ${topUpError ? styles['mbc-station__form-input--error'] : ''}`}
                />
                {topUpError && (
                  <p className={styles['mbc-station__form-error']} data-testid="topup-error-message">
                    {topUpError}
                  </p>
                )}

                {/* Quick Amount Chips */}
                <SignalTypography variant="body1-bold" as="p" className={styles['mbc-station__chips-title']}>
                  {t('mbc_station_topup_nominal_title')}
                </SignalTypography>
                <div className={styles['mbc-station__chips-grid']}>
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => onSelectChip(amount)}
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
              onClick={onTopUpNow}
              disabled={isProcessing || !isTopUpValid}
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
