import type { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import styles from './page-header.module.css';

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Callback when back button is pressed (unused in current design, kept for API compat) */
  onBack?: () => void;
  /** Whether to show the hamburger menu button */
  showMenu?: boolean;
  /** Optional additional class name */
  className?: string;
}

const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  showMenu = true,
  className,
}) => {
  const navigate = useNavigate();

  const classes = [
    styles['page-header'],
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <header className={classes}>
      <div className={styles['page-header__content']}>
        <h1 className={styles['page-header__title']}>{title}</h1>
        {subtitle && (
          <p className={styles['page-header__subtitle']}>{subtitle}</p>
        )}
      </div>
      {showMenu && (
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          aria-label="Menu"
          className={styles['page-header__menu']}
        >
          <span className={styles['page-header__menu-icon']} aria-hidden="true">☰</span>
        </button>
      )}
    </header>
  );
};

export default PageHeader;
