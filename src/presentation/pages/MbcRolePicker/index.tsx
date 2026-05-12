import type { FC } from 'react';
import container from '@di/container';
import type { RolePickerControllerInterface } from '@controllers/mbc/role-picker.controller';
import { SignalCallout, SignalCard, SignalGateButton, SignalTypography } from '@components/SignalReact';
import PageHeader from '@components/PageHeader';
import styles from './mbc-role-picker.module.css';

const MbcRolePicker: FC = () => {
  const ctrl = container.resolve<RolePickerControllerInterface>('rolePickerController');
  const { t } = ctrl;


  return (
    <main className={styles['mbc-role-picker']} data-testid="mbc-role-picker">
      {/* Header */}
      <PageHeader
        title={String(t('mbc_role_picker_title'))}
        subtitle={String(t('mbc_role_picker_subtitle'))}
        showMenu={false}
      />

      {/* NFC Info Banner */}
      <SignalCallout
        variant={'info'}
        title={String(t('mbc_role_picker_nfc_banner_title'))}
        message={String(t('mbc_role_picker_nfc_banner_subtitle'))}
        t={t}
        data-testid="nfc-banner"
        icon=""
      />

      {/* Primary Role Cards */}
      <div className={styles['mbc-role-picker__primary-grid']} data-testid="primary-roles">
        {ctrl.primaryRoles.map((role) => (
          <SignalCard key={role.id} data-testid={`role-card-${role.id}`}>
            <div className={`${styles['mbc-role-picker__primary-card']} ]}`}>
              <SignalTypography variant="h5" className={styles['mbc-role-picker__primary-card-label']}>
                {t(role.labelKey as never)}
              </SignalTypography>

              <SignalGateButton
                color={role.color}
                size="sm"
                onClick={() => {
                  ctrl.onNavigateToRole(role.id);
                }}
                data-testid={`role-select-${role.id}`}
              >
                {t(role.actionKey as never)}
              </SignalGateButton>

              <SignalTypography variant="body2-regular" className={styles['mbc-role-picker__primary-card-description']}>
                {t(role.descriptionKey as never)}
              </SignalTypography>
            </div>
          </SignalCard>
        ))}
      </div>

      {/* Secondary Roles Section */}
      <section className={styles['mbc-role-picker__secondary-section']} data-testid="secondary-roles">
        <SignalTypography variant="body1-bold" className={styles['mbc-role-picker__secondary-title']}>
          {t('mbc_role_picker_other_access')}
        </SignalTypography>
        <div className={styles['mbc-role-picker__secondary-list']}>
          {ctrl.secondaryRoles.map((role) => (
            <SignalCard
              key={role.id}
              onClick={() => {
                ctrl.onNavigateToRole(role.id);
              }}
              data-testid={`role-card-${role.id}`}
            >
              <div className={styles['mbc-role-picker__secondary-item']}>
                <div className={styles['mbc-role-picker__secondary-item-content']}>
                  <SignalTypography variant="body1-bold" as="p" className={styles['mbc-role-picker__secondary-item-label']}>
                    {t(role.labelKey as never)}
                  </SignalTypography>
                  <SignalTypography variant="body2-regular" as="p" className={styles['mbc-role-picker__secondary-item-description']}>
                    {t(role.descriptionKey as never)}
                  </SignalTypography>
                </div>
                <span className={styles['mbc-role-picker__secondary-item-chevron']} aria-hidden="true">
                  ›
                </span>
              </div>
            </SignalCard>
          ))}
        </div>
      </section>

      
    </main>
  );
};

export default MbcRolePicker;
