import type { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import container from '@di/container';
import type { RolePickerControllerInterface } from '@controllers/mbc/role-picker.controller';
import RoleCard from '@components/RoleCard';
import styles from './mbc-role-picker.module.css';

const MbcRolePicker: FC = () => {
  const ctrl = container.resolve<RolePickerControllerInterface>('rolePickerController');
  const { t } = ctrl;
  const navigate = useNavigate();

  return (
    <main className={styles['mbc-role-picker']}>
      <h1 className={styles['mbc-role-picker__title']}>{t('mbc_role_picker_title')}</h1>
      <p className={styles['mbc-role-picker__subtitle']}>{t('mbc_role_picker_subtitle')}</p>

      <div className={styles['mbc-role-picker__grid']}>
        {ctrl.roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isActive={ctrl.activeRole === role.id}
            onSelect={() => {
              ctrl.onSelectRole(role.id);
              navigate({ to: `/${role.id}` });
            }}
            t={t}
          />
        ))}
      </div>
    </main>
  );
};

export default MbcRolePicker;
