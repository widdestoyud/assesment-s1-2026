import type { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import styles from './page-header.module.css';

export interface PageHeaderProps {
  /** Icon emoji or text */
  icon: string;
  /** Page title */
  title: string;
  /** Page subtitle / description */
  subtitle: string;
  /** Header color theme */
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

const PageHeader: FC<PageHeaderProps> = ({ icon, title, subtitle, color = 'blue' }) => {
  const navigate = useNavigate();

  return (
    <header className={`${styles['page-header']} ${styles[`page-header--${color}`]}`}>
      <div className={styles['page-header__icon']} aria-hidden="true">
        {icon}
      </div>
      <div className={styles['page-header__content']}>
        <h1 className={styles['page-header__title']}>{title}</h1>
        <p className={styles['page-header__subtitle']}>{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate({ to: '/' })}
        aria-label="Menu"
        className={styles['page-header__menu']}
      >
        <span className={styles['page-header__menu-icon']} aria-hidden="true">☰</span>
      </button>
    </header>
  );
};

export default PageHeader;
