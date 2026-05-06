import type { FC } from 'react';
import type { TFunction } from 'i18next';
import { useLocation, useNavigate } from '@tanstack/react-router';
import styles from './bottom-navigation.module.css';

interface NavItem {
  id: string;
  path: string;
  labelKey: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'station', path: '/station', labelKey: 'mbc_nav_station', icon: '🏢' },
  { id: 'gate', path: '/gate', labelKey: 'mbc_nav_gate', icon: '🚪' },
  { id: 'terminal', path: '/terminal', labelKey: 'mbc_nav_terminal', icon: '💳' },
  { id: 'scout', path: '/scout', labelKey: 'mbc_nav_scout', icon: '🔍' },
];

export interface BottomNavigationProps {
  t: TFunction;
}

const BottomNavigation: FC<BottomNavigationProps> = ({ t }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const isItemActive = (item: NavItem): boolean => {
    if (item.id === 'station') {
      return currentPath === item.path || currentPath === '/';
    }
    return currentPath === item.path;
  };

  return (
    <nav className={styles['bottom-navigation']} aria-label={t('mbc_nav_aria_label')}>
      <ul className={styles['bottom-navigation__list']}>
        {NAV_ITEMS.map((item) => {
          const isActive = isItemActive(item);
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => navigate({ to: item.path })}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`nav-${item.id}`}
                className={`${styles['bottom-navigation__item']} ${isActive ? styles['bottom-navigation__item--active'] : styles['bottom-navigation__item--default']}`}
              >
                <span className={styles['bottom-navigation__icon']} aria-hidden="true">
                  {item.icon}
                </span>
                <span className={styles['bottom-navigation__label']}>
                  {t(item.labelKey)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
